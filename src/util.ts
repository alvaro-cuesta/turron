import crypto, { BinaryLike } from 'crypto'

export type Encoding =
  | 'hex'
  | 'base64'
  | 'binary'

export const bytesToUTF8 = (bytes: string): string =>
  Buffer.from(bytes, 'utf8')
    .toString("utf8")

export const utf8ToBytes = (bytes: string): string =>
  Buffer.from(bytes, 'binary')
    .toString("binary")

export const binaryToEncoding = (bytes: string, encoding: Encoding): string =>
  Buffer.from(bytes, 'binary')
    .toString(encoding)

export const encodingToBinary = (bytes: string, encoding: Encoding): string =>
  Buffer.from(bytes, encoding)
    .toString('binary')

export function sha1(input: BinaryLike): Buffer;
export function sha1(input: BinaryLike, encoding: Encoding): string;
export function sha1(input: BinaryLike, encoding?: Encoding): Buffer | string {
  const hash = crypto.createHash('sha1').update(input)

  return encoding
    ? hash.digest(encoding === 'binary' ? 'latin1' : encoding)
    : hash.digest()
}
