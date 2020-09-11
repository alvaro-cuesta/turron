const NUMBER_0 = 0x30 // 0
const NUMBER_9 = 0x39 // 9

const END = 0x65 // e

const INTEGER_START = 0x69 // i
const INTEGER_NEGATIVE = 0x2d // -

const BYTES_SEPARATOR = 0x3a // :

const LIST_START = 0x6c // l

const DICT_START = 0x64 // d

type Natural = number

type Integer = number

type Bytes = Buffer

type BytesLike = Bytes | string

type List = Array<Primitive>

type Dict = Map<Bytes, Primitive>

type DictLike =
  | Map<Bytes, PrimitiveLike>
  | Map<string, PrimitiveLike>
  | Map<Bytes | string, PrimitiveLike>
  | { [k: string]: PrimitiveLike }

type Primitive =
  | Integer
  | Bytes
  | List
  | Dict

type PrimitiveLike =
  | Integer
  | BytesLike
  | List
  | DictLike

// Decode

const _decodeNatural = (buffer: Buffer, i: number): [Natural, number] => {
  if (buffer[i] === NUMBER_0) {
    i++

    if (buffer[i] >= NUMBER_0 && buffer[i] <= NUMBER_9) {
      throw new Error('Leading zero detected')
    }

    return [0, i]
  }

  if (!(buffer[i] >= NUMBER_0 && buffer[i] <= NUMBER_9)) {
    throw new Error('Digit expected')
  }

  let number = 0

  while (buffer[i] >= NUMBER_0 && buffer[i] <= NUMBER_9) {
    number = number * 10 + buffer[i] - NUMBER_0
    i++
  }

  return [number, i]
}

const _decodeInteger = (buffer: Buffer, i: number): [Integer, number] => {
  if (buffer[i] !== INTEGER_START) {
    throw new Error('Missing INTEGER_START')
  }
  i++

  let negative = false
  if (buffer[i] === INTEGER_NEGATIVE) {
    negative = true
    i++
  }

  let number
  ([number, i] = _decodeNatural(buffer, i))

  if (buffer[i] !== END) {
    throw new Error('Missing END (on Integer)')
  }
  i++

  if (negative && number === 0) {
    throw new Error('Negative zero')
  }

  return [
    (negative ? -1 : 1) * number,
    i
  ]
}

const _decodeBytes = (buffer: Buffer, i: number): [Bytes, number] => {
  let length
  ([length, i] = _decodeNatural(buffer, i))

  if (buffer[i] !== BYTES_SEPARATOR) {
    throw new Error('Missing BYTES_SEPARATOR')
  }
  i++

  return [buffer.slice(i, i + length), i + length]
}

const _decodePrimitive = (buffer: Buffer, i: number): [Primitive, number] => {
  try {
    return _decodeInteger(buffer, i)
  } catch (_) {}

  try {
    return _decodeBytes(buffer, i)
  } catch (_) {}

  try {
    return _decodeList(buffer, i)
  } catch (_) {}

  try {
    return _decodeDict(buffer, i)
  } catch (_) {}

  throw new Error('Expected Primitive')
}

const _decodeList = (buffer: Buffer, i: number): [List, number] => {
  if (buffer[i] !== LIST_START) {
    throw new Error('Missing LIST_START')
  }
  i++

  let list: Array<Primitive> = []

  while (buffer[i] !== END) {
    let primitive
    ([primitive, i] = _decodePrimitive(buffer, i))

    list.push(primitive)
  }
  i++

  return [list, i]
}

const _decodeDict = (buffer: Buffer, i: number): [Dict, number] => {
  if (buffer[i] !== DICT_START) {
    throw new Error('Missing DICT_START')
  }
  i++

  let dict = new Map()
  let lastKey

  while (buffer[i] !== END) {
    let key
    ([key, i] = _decodeBytes(buffer, i))

    if (lastKey && key.compare(lastKey) === 1) {
      throw new Error('Non-lexicographical order detected')
    }

    let value
    ([value, i] = _decodePrimitive(buffer, i))

    dict.set(key, value)
  }
  i++

  return [dict, i]
}

export const decodeInteger = (buffer: Buffer, i: number = 0) => {
  let integer
  ([integer, i] = _decodeInteger(buffer, i))

  if (i !== buffer.length) {
    throw new Error('Expected EOF')
  }

  return integer
}

export const decodeBytes = (buffer: Buffer, i: number = 0) => {
  let bytes
  ([bytes, i] = _decodeBytes(buffer, i))

  if (i !== buffer.length) {
    throw new Error('Expected EOF')
  }

  return bytes
}

export const decodeList = (buffer: Buffer, i: number = 0) => {
  let list
  ([list, i] = _decodeList(buffer, i))

  if (i !== buffer.length) {
    throw new Error('Expected EOF')
  }

  return list
}

export const decodeDict = (buffer: Buffer, i: number = 0) => {
  let dict
  ([dict, i] = _decodeDict(buffer, i))

  if (i !== buffer.length) {
    throw new Error('Expected EOF')
  }

  return dict
}

// Encode

const _encodeNatural = (n: Natural) => {
  if (!Number.isInteger(n)) {
    throw new Error('Non-integer detected')
  }

  if (n < 0) {
    throw new Error('Negative natural detected')
  }

  return Buffer.from(n.toString())
}

export const encodeInteger = (n: Integer): Buffer =>
  Buffer.concat([
    Buffer.from([INTEGER_START]),
    n < 0 ? Buffer.from([INTEGER_NEGATIVE]) : Buffer.from([]),
    _encodeNatural(Math.abs(n)),
    Buffer.from([END]),
  ])

const _encodeBytes = (bytes: Bytes): Buffer =>
  Buffer.concat([
    _encodeNatural(bytes.length),
    Buffer.from([BYTES_SEPARATOR]),
    bytes,
  ])

export const encodeBytes = (bytes: BytesLike): Buffer =>
  _encodeBytes(
    typeof bytes === 'string'
    ? Buffer.from(bytes, 'utf8')
    : bytes
  )

const _encodePrimitive = (primitive: PrimitiveLike): Buffer => {
  if (typeof primitive === 'number') {
    return encodeInteger(primitive)
  }

  if (typeof primitive === 'string' || primitive instanceof Buffer) {
    return encodeBytes(primitive)
  }

  if (Array.isArray(primitive)) {
    return encodeList(primitive)
  }

  if (primitive instanceof Map || (typeof primitive === 'object' && primitive !== null)) {
    return encodeDict(primitive)
  }

  throw new Error('Expected Primitive')
}

export const encodeList = (list: List): Buffer =>
  Buffer.concat([
    Buffer.from([LIST_START]),
    ...list.map(_encodePrimitive),
    Buffer.from([END]),
  ])


const _encodeDict = (dict: Map<Bytes, PrimitiveLike>): Buffer => {
  const keys = [...dict.keys()]
    .sort()

  const entries = []

  for (const key of keys) {
    const value = dict.get(key)

    if (value === undefined) {
      continue
    }

    entries.push(
      Buffer.concat([
        encodeBytes(key),
        _encodePrimitive(value),
      ])
    )
  }

  return Buffer.concat([
    Buffer.from([DICT_START]),
    ...entries,
    Buffer.from([END]),
  ])
}

export const encodeDict = (dict: DictLike): Buffer => {
  const entries = dict instanceof Map
    ? dict.entries()
    : Object.entries(dict)

  const mappedEntries: [Bytes, PrimitiveLike][] = [...entries]
    .map(([k, v]) => [Buffer.from(k), v])

  return _encodeDict(new Map(mappedEntries))
}
