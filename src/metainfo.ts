import { decodeDict, Dict } from './bencode'

type Metainfo = {
  announce?: string,
  info: MetainfoInfo,
  comment?: string,
  createdBy?: string,
  creationDate?: Date,
  other: Dict,
}

type MetainfoInfo =
  {
    name: string,
    pieceLength: number,
    pieces: string[],
  }
  & (MetainfoSingle | MetainfoMulti)

type MetainfoSingle = {
  length: number,
  files: undefined,
}

type MetainfoMulti = {
  files: MetainfoFile[],
  length: undefined,
}

type MetainfoFile = {
  length: number,
  path: string[],
}

const _parseMetainfoFile = (dict: Dict): MetainfoFile => {
  const {
    length,
    path: maybePath,
    ...other
  } = dict

  const unknownKeys = Object.keys(other)

  if (unknownKeys.length > 0) {
    throw new Error(`Unknown keys in "files" item: ${unknownKeys.join(', ')}`)
  }

  // length
  if (typeof length !== 'number') {
    throw new Error('Expected "length" to be Integer')
  }

  // path
  if (!Array.isArray(maybePath)) {
    throw new Error('Expected "path" to be List')
  }

  const path = maybePath
    .map(x => {
      if (typeof x !== 'string') {
        throw new Error('Expected "path" fragment to be Bytes')
      }

      return x
    })

  return {
    length,
    path,
  }
}

const _parseMetainfoInfo = (dict: Dict): MetainfoInfo => {
  const {
    name,
    'piece length': pieceLength,
    pieces: maybePieces,
    length,
    files: maybeFiles,
    ...other
  } = dict

  const unknownKeys = Object.keys(other)

  if (unknownKeys.length > 0) {
    throw new Error(`Unknown keys in "info": ${unknownKeys.join(', ')}`)
  }

  // name
  if (typeof name !== 'string') {
    throw new Error('Expected "name" to be Bytes')
  }

  // piece length
  if (typeof pieceLength !== 'number') {
    throw new Error('Expected "pieceLength" to be Integer')
  }

  // pieces
  if (typeof maybePieces !== 'string') {
    throw new Error('Expected "pieces" to be Bytes')
  }

  if (maybePieces.length % 20 !== 0) {
    throw new Error('Expected "pieces" to be of length % 20')
  }

  const pieces: string[] = []

  for (let i = 0; i < maybePieces.length / 20; i++) {
    pieces.push(maybePieces.slice(20 * i, 20 * (i + 1)))
  }

  // length // files
  if (typeof length !== 'undefined') {
    if (typeof length !== 'number') {
      throw new Error('Expected "length" to be Integer or not exist')
    }

    if (typeof maybeFiles !== 'undefined') {
      throw new Error('Both "length" or "files" cannot co-exist')
    }

    return {
      name,
      pieceLength,
      pieces,
      length,
      files: undefined,
    }
  }

  if (typeof maybeFiles !== 'undefined') {
    if (!Array.isArray(maybeFiles)) {
      throw new Error('Expected "files" to be List or not exist')
    }

    const files = maybeFiles
      .map(x => {
        if (typeof x !== 'object' || x === null || Array.isArray(x)) {
          throw new Error('Expected "files" item to be Dict')
        }

        return _parseMetainfoFile(x)
      })

    return {
      name,
      pieceLength,
      pieces,
      files,
      length: undefined,
    }
  }

  throw new Error('Either "length" or "files" must exist')
}

export const parseMetainfo = (buffer: string): Metainfo => {
  const {
    announce,
    info: maybeInfo,
    comment,
    'created by': createdBy,
    'creation date': maybeCreationDate,
    ...other
  } = decodeDict(buffer)

  // announce
  if (typeof announce !== 'string' && typeof announce !== 'undefined') {
    throw new Error('Expected "announce" to be Bytes or not be defined')
  }

  // info
  if (typeof maybeInfo !== 'object' || maybeInfo === null || Array.isArray(maybeInfo)) {
    throw new Error('Expected "info" to be Dict')
  }

  const info = _parseMetainfoInfo(maybeInfo)

  // created by
  if (typeof comment !== 'string' && typeof comment !== 'undefined') {
    throw new Error('Expected "comment" to be string or not be defined')
  }

  // created by
  if (typeof createdBy !== 'string' && typeof createdBy !== 'undefined') {
    throw new Error('Expected "created by" to be string or not be defined')
  }

  // creation date
  if (typeof maybeCreationDate !== 'number' && typeof maybeCreationDate !== 'undefined') {
    throw new Error('Expected "creation date" to be number or not be defined')
  }

  return {
    announce,
    info,
    comment,
    createdBy,
    creationDate: maybeCreationDate
      ? new Date(maybeCreationDate * 1000)
      : undefined,
    other,
  }
}
