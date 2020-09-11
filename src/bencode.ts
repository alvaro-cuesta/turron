export type Natural = number

export type Integer = number

export type Bytes = string

export type List = Array<Primitive>

export type Dict = { [k: string]: Primitive }

export type Primitive =
  | Integer
  | Bytes
  | List
  | Dict

// Decode

const _decodeNatural = (buffer: string, i: number): [Natural, number] => {
  if (buffer[i] === '0') {
    i++

    if (buffer[i] >= '0' && buffer[i] <= '9') {
      throw new Error(`Leading zero detected at ${i - 1}`)
    }

    return [0, i]
  }

  if (!(buffer[i] >= '0' && buffer[i] <= '9')) {
    throw new Error(`Digit expected at ${i}`)
  }

  let number = 0

  while (buffer[i] >= '0' && buffer[i] <= '9') {
    number = number * 10 + parseInt(buffer[i], 10)
    i++
  }

  return [number, i]
}

const _decodeInteger = (buffer: string, i: number): [Integer, number] => {
  if (buffer[i] !== 'i') {
    throw new Error(`Missing "i" at ${i}`)
  }
  i++

  let negative = false
  if (buffer[i] === '-') {
    negative = true
    i++
  }

  let number
  ([number, i] = _decodeNatural(buffer, i))

  if (buffer[i] !== 'e') {
    throw new Error(`Missing "e" (on Integer) at ${i}`)
  }
  i++

  if (negative && number === 0) {
    throw new Error(`Negative zero at ${i}`)
  }

  return [
    (negative ? -1 : 1) * number,
    i
  ]
}

const _decodeBytes = (buffer: string, i: number): [Bytes, number] => {
  let length
  ([length, i] = _decodeNatural(buffer, i))

  if (buffer[i] !== ':') {
    throw new Error(`Missing ":" at ${i}`)
  }
  i++

  const bytes = buffer.slice(i, i + length)

  return [bytes, i + length]
}

const _decodePrimitive = (buffer: string, i: number): [Primitive, number] => {
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

  throw new Error(`Expected Primitive at ${i}`)
}

const _decodeList = (buffer: string, i: number): [List, number] => {
  if (buffer[i] !== 'l') {
    throw new Error(`Missing "l" at ${i}`)
  }
  i++

  let list: Array<Primitive> = []

  while (buffer[i] !== "e") {
    let primitive
    ([primitive, i] = _decodePrimitive(buffer, i))

    list.push(primitive)
  }
  i++

  return [list, i]
}

const _decodeDict = (buffer: string, i: number): [Dict, number] => {
  if (buffer[i] !== 'd') {
    throw new Error(`Missing "d" at ${i}`)
  }
  i++

  let dict: Dict = {}
  let lastKey

  while (buffer[i] !== 'e') {
    let key
    ([key, i] = _decodeBytes(buffer, i))

    if (lastKey && key < lastKey) {
      throw new Error(`Non-lexicographical order detected at ${i}`)
    }

    let value
    ([value, i] = _decodePrimitive(buffer, i))

    dict[key] = value
  }
  i++

  return [dict, i]
}

export const decodeInteger = (buffer: string, i: number = 0) => {
  let integer
  ([integer, i] = _decodeInteger(buffer, i))

  if (i !== buffer.length) {
    throw new Error(`Expected EOF at ${i}`)
  }

  return integer
}

export const decodeBytes = (buffer: string, i: number = 0) => {
  let bytes
  ([bytes, i] = _decodeBytes(buffer, i))

  if (i !== buffer.length) {
    throw new Error(`Expected EOF at ${i}`)
  }

  return bytes
}

export const decodeList = (buffer: string, i: number = 0) => {
  let list
  ([list, i] = _decodeList(buffer, i))

  if (i !== buffer.length) {
    throw new Error(`Expected EOF at ${i}`)
  }

  return list
}

export const decodeDict = (buffer: string, i: number = 0) => {
  let dict
  ([dict, i] = _decodeDict(buffer, i))

  if (i !== buffer.length) {
    throw new Error(`Expected EOF at ${i}`)
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

  return n.toString()
}

export const encodeInteger = (n: Integer): string =>
  `i`
  + (n < 0 ? '-' : '')
  + _encodeNatural(Math.abs(n))
  + 'e'

export const encodeBytes = (bytes: Bytes): string =>
  _encodeNatural(bytes.length)
  + ':'
  + bytes

const _encodePrimitive = (primitive: Primitive): string => {
  if (typeof primitive === 'number') {
    return encodeInteger(primitive)
  }

  if (typeof primitive === 'string') {
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

export const encodeList = (list: List): string =>
  'l'
  + list.map(_encodePrimitive).join('')
  + 'e'

export const encodeDict = (dict: Dict): string => {
  const keys = Object.keys(dict)
    .sort()

  const entries = []

  for (const key of keys) {
    const value = dict[key]

    if (value === undefined) {
      continue
    }

    entries.push(
      encodeBytes(key)
      + _encodePrimitive(value),
    )
  }

  return 'd'
    + entries.join('')
    + 'e'
}
