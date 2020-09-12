export const bytesToUTF8 = (bytes: string): string =>
  Buffer.from(bytes, 'utf8')
    .toString("utf8")

export const utf8ToBytes = (bytes: string): string =>
  Buffer.from(bytes, 'latin1')
    .toString("latin1")
