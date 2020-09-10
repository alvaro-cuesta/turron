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

type List = Array<Primitive>

type Dict = Map<Bytes, Primitive>

type Primitive =
  | Integer
  | Bytes
  | List
  | Dict

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
