#!/usr/bin/env ts-node
import express from 'express'
import morgan from 'morgan'
import { trackerHandler, TrackerEvent } from '../src/tracker'
import { binaryToEncoding } from '../src/util'

const app = express()
const port = 3000

type PeerInfo = {
  ip: string,
  port: number,
  uploaded: number,
  downloaded: number,
  left: number,
  event?: TrackerEvent,
}

const peersByInfoHash: { [infoHash: string]: { [peerId: string]: PeerInfo } } = {}

app.use(morgan('dev'))

app.get('/stats', (_req, res) => {
  res.json(peersByInfoHash)
})

app.get('/stats/:infoHash', (req, res) => {
  res.json(peersByInfoHash?.[req.params.infoHash])
})

app.get('/announce', trackerHandler(async (request, req) => {
  const {
    infoHash,
    peerId,
    ip,
    port,
    uploaded,
    downloaded,
    left,
    event,
  } = request

  const hexInfoHash = binaryToEncoding(infoHash, 'hex')

  if (typeof peersByInfoHash[hexInfoHash] === 'undefined') {
    peersByInfoHash[hexInfoHash] = {}
  }

  peersByInfoHash[hexInfoHash][peerId] = {
    ip: ip || req.ip,
    port,
    uploaded,
    downloaded,
    left,
    event,
  }

  return {
    intervalSeconds: 60,
    peers: Object.entries(peersByInfoHash[hexInfoHash])
      .filter(([id]) => id !== peerId)
      .map(([id, peer]) => ({
        id,
        ip: peer.ip,
        port: peer.port,
      })),
    error: undefined,
  }
}))

app.listen(port, () => {
  console.log(`Dev tracker listening at http://localhost:${port}`)
})
