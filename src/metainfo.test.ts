import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { parseMetainfo, getInfoHash } from "./metainfo"

const FIXTURE_WORLD_TXT = fs.readFileSync(
  path.join(__dirname, '..', 'fixtures', 'world.txt.torrent'),
  'binary'
)

const FIXTURE_BIG_BUCK_BUNNY = fs.readFileSync(
  path.join(__dirname, '..', 'fixtures', 'big-buck-bunny.torrent'),
  'binary'
)

describe('parseMetainfo', () => {
  it('works for single file torrents', () => {
    const metainfo = parseMetainfo(FIXTURE_WORLD_TXT)

    expect(metainfo)
      .toEqual({
        announce: undefined,
        info: {
          name: 'world.txt',
          pieceLength: 16384,
          length: 12,
          files: undefined,
          pieces: [
            crypto.createHash('sha1').update('Hello world!').digest().toString('binary')
          ],
        },
        comment: undefined,
        createdBy: 'qBittorrent v4.1.7',
        creationDate: new Date('2020-09-11T20:59:58.000Z'),
        other: {},
      })
  })

  it('works for multifile torrents', () => {
    const metainfo = parseMetainfo(FIXTURE_BIG_BUCK_BUNNY)

    expect(metainfo)
      .toMatchObject({
        announce: 'udp://tracker.leechers-paradise.org:6969',
        info: {
          name: 'Big Buck Bunny',
          pieceLength: 262144,
          files: [
            { length: 140, path: [ 'Big Buck Bunny.en.srt' ] },
            { length: 276134947, path: [ 'Big Buck Bunny.mp4' ] },
            { length: 310380, path: [ 'poster.jpg' ] },
          ],
          length: undefined,
        },
        comment: "WebTorrent <https://webtorrent.io>",
        createdBy: "WebTorrent <https://webtorrent.io>",
        creationDate: new Date('2017-03-30T23:30:01.000Z'),
        other: {
          'announce-list': [
            ["udp://tracker.leechers-paradise.org:6969"],
            ["udp://tracker.coppersurfer.tk:6969"],
            ["udp://tracker.opentrackr.org:1337"],
            ["udp://explodie.org:6969"],
            ["udp://tracker.empire-js.us:1337"],
            ["wss://tracker.btorrent.xyz"],
            ["wss://tracker.openwebtorrent.com"],
            ["wss://tracker.fastcast.nz"]
          ],
          "encoding": "UTF-8",
          "url-list": ["https://webtorrent.io/torrents/"],
        }
      })
  })
})

describe('getInfoHash', () => {
  it('works with Big Buck Bunny', () => {
    const metainfo = parseMetainfo(FIXTURE_BIG_BUCK_BUNNY)
    const infoHash = getInfoHash(metainfo.info)

    expect(infoHash.toString('hex'))
      .toEqual('dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c')
  })

  it('works with hello.txt', () => {
    const metainfo = parseMetainfo(FIXTURE_WORLD_TXT)
    const infoHash = getInfoHash(metainfo.info)

    expect(infoHash.toString('hex'))
      .toEqual('c3241e3400aa8d76b390c3e9b5e5e1da5ec81ec7')
  })
})
