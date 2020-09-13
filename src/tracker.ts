import { Request, Response, RequestHandler } from "express"
import { encodeDict } from "./bencode"
import { encodingToBinary } from "./util"

export type TrackerEvent =
  | 'started'
  | 'completed'
  | 'stopped'

export type TrackerRequest = {
  infoHash: string,
  peerId: string,
  ip?: string,
  port: number,
  uploaded: number,
  downloaded: number,
  left: number,
  event?: TrackerEvent,
}

export type TrackerResponse =
  | TrackerReponseOk
  | TrackerResponseError

export type TrackerReponseOk = {
  intervalSeconds: number,
  peers: TrackerResponsePeer[],
  error: undefined,
}

export type TrackerResponseError = {
  error: string,
  httpStatus?: number,
}

export type TrackerResponsePeer = {
  id: string,
  ip: string,
  port: number,
}

const decodeBytes = (encoded: string) => {
  let result = ''
  let left = encoded

  while (left.length > 0) {
    const index = left.indexOf('%')

    if (index === -1) {
      result += left
      left = ''
      break
    }

    result += left.slice(0, index)
    result += encodingToBinary(left.slice(index + 1, index + 3), 'hex')
    left = left.slice(index + 3)
  }

  return result
}

export const trackerHandler =
  (requestHandler: (trackerRequest: TrackerRequest, httpRequest: Request) => Promise<TrackerResponse>): RequestHandler =>
    async (req: Request, res: Response) => {
      try {
        const {
          info_hash: maybeInfohash,
          peer_id: maybePeerId,
          ip,
          port: maybePort,
          uploaded: maybeUploaded,
          downloaded: maybeDownloaded,
          left: maybeLeft,
          event: maybeEvent,
        } = req.query

        // info_hash
        if (typeof maybeInfohash !== 'string') {
          return res.status(400)
            .send(encodeDict({
              'failure reason': 'Missing or invalid `info_hash`'
            }))
        }

        const infoHash = decodeBytes(maybeInfohash)

        if (infoHash.length !== 20) {
          return res.status(400)
            .send(encodeDict({
              'failure reason': `Wrong \`info_hash\` length ${infoHash.length}`,
            }))
        }

        // peer_id
        if (typeof maybePeerId !== 'string') {
          return res.status(400)
            .send(encodeDict({
              'failure reason': 'Missing or invalid `peer_id`'
            }))
        }

        const peerId = decodeBytes(maybePeerId)

        if (peerId.length !== 20) {
          return res.status(400)
            .send(encodeDict({
              'failure reason': `Wrong \`peer_id\` length ${peerId.length}`,
            }))
        }

        // ip
        if (typeof ip !== 'string' && typeof ip !== 'undefined') {
          return res.status(400)
            .send(encodeDict({
              'failure reason': 'Invalid `ip`'
            }))
        }

        // port
        if (typeof maybePort !== 'string') {
          return res.status(400)
            .send(encodeDict({
              'failure reason': 'Missing or invalid `port`'
            }))
        }

        const port = parseInt(maybePort, 10)

        if (isNaN(port) || port < 0x0000 || port > 0xffff) {
          return res.status(400)
            .send(encodeDict({
              'failure reason': 'Missing or invalid `port`'
            }))
        }

        // uploaded
        if (typeof maybeUploaded !== 'string') {
          return res.status(400)
            .send(encodeDict({
              'failure reason': 'Missing or invalid `uploaded`'
            }))
        }

        const uploaded = parseInt(maybeUploaded, 10)

        if (isNaN(uploaded) || uploaded < 0x0000) {
          return res.status(400)
            .send(encodeDict({
              'failure reason': 'Missing or invalid `uploaded`'
            }))
        }

        // downloaded
        if (typeof maybeDownloaded !== 'string') {
          return res.status(400)
            .send(encodeDict({
              'failure reason': 'Missing or invalid `downloaded`'
            }))
        }

        const downloaded = parseInt(maybeDownloaded, 10)

        if (isNaN(downloaded) || downloaded < 0x0000) {
          return res.status(400)
            .send(encodeDict({
              'failure reason': 'Missing or invalid `downloaded`'
            }))
        }

        // left
        if (typeof maybeLeft !== 'string') {
          return res.status(400)
            .send(encodeDict({
              'failure reason': 'Missing or invalid `left`'
            }))
        }

        const left = parseInt(maybeLeft, 10)

        if (isNaN(left) || left < 0x0000) {
          return res.status(400)
            .send(encodeDict({
              'failure reason': 'Missing or invalid `left`'
            }))
        }

        // event
        const event = maybeEvent === 'started'
          ? 'started'
          : maybeEvent === 'completed'
          ? 'completed'
          : maybeEvent === 'stopped'
          ? 'stopped'
          : maybeEvent === 'empty' || typeof maybeEvent === 'undefined'
          ? undefined
          : null

        if (event === null) {
          return res.status(400)
            .send(encodeDict({
              'failure reason': 'Invalid `event`'
            }))
        }

        const response = await requestHandler({
          infoHash,
          peerId,
          ip,
          port,
          uploaded,
          downloaded,
          left,
          event,
        }, req)

        if (response.error !== undefined) {
          return res.status(response.httpStatus || 500)
            .send(encodeDict({
              'failure reason': response.error,
            }))
        }

        return res.status(200)
          .send(encodeDict({
            interval: response.intervalSeconds,
            peers: response.peers,
          }))
      } catch (error) {
        return res.status(500)
          .send(encodeDict({
            'failure reason': error.message || 'internal server error'
          }))
      }
    }
