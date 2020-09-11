# Turron - A Torrent experiment

This is just a [BitTorrent](https://www.bittorrent.org) implementation to satisfy my own curiosity.
Neither speed nor any other useful metric is expected of this code. It should _just work_ for no
particular purpose other than learning.

## Implementation

### Implemented [BEPs](https://www.bittorrent.org/beps/bep_0000.html) (list at 2020-09-11)

#### Final and Active Process BEPs

- [ ] ~~[0 - Index of BitTorrent Enhancement Proporsals](https://www.bittorrent.org/beps/bep_0000.html)~~
- [ ] ~~[1 - The BEP Process](https://www.bittorrent.org/beps/bep_0001.html)~~
- [ ] [3 - The BitTorrent Protocol Specification](https://www.bittorrent.org/beps/bep_0003.html)
- [ ] [4 - Known Number Allocations](https://www.bittorrent.org/beps/bep_0004.html)
- [ ] [20 - Peer ID Conventions](https://www.bittorrent.org/beps/bep_0020.html)
- [ ] ~~[1000 - Pending Standards Track Documents](https://www.bittorrent.org/beps/bep_1000.html)~~

#### Accepted BEPs

- [ ] [5 - DHT Protocol](https://www.bittorrent.org/beps/bep_0005.html)
- [ ] [6 - Fast Extension](https://www.bittorrent.org/beps/bep_0006.html)
- [ ] [9 - Extension for Peers to Send Metadata Files](https://www.bittorrent.org/beps/bep_0009.html)
- [ ] [10 - Extension Protocol](https://www.bittorrent.org/beps/bep_0010.html)
- [ ] [11 - Peer Exchange (PEX)](https://www.bittorrent.org/beps/bep_0011.html)
- [ ] [12 - Multitracker Metadata Extension](https://www.bittorrent.org/beps/bep_0012.html)
- [ ] [14 - Local Service Discovery](https://www.bittorrent.org/beps/bep_0014.html)
- [ ] [15 - UDP Tracker Protocol](https://www.bittorrent.org/beps/bep_0015.html)
- [ ] [19 - HTTP/FTP Seeding (GetRight-style)](https://www.bittorrent.org/beps/bep_0019.html)
- [ ] [23 - Tracker Returns Compact Peer Lists](https://www.bittorrent.org/beps/bep_0023.html)
- [ ] [27 - Private Torrents](https://www.bittorrent.org/beps/bep_0027.html)
- [ ] [29 - uTorrent transport protocol](https://www.bittorrent.org/beps/bep_0029.html)
- [ ] [55 - Holepunch extension](https://www.bittorrent.org/beps/bep_0055.html)

#### Draft BEPs

- [ ] [7 - IPv6 Tracker Extension](https://www.bittorrent.org/beps/bep_0007.html)
- [ ] [16 - Superseeding](https://www.bittorrent.org/beps/bep_0016.html)
- [ ] [17 - HTTP Seeding (Hoffman-style)](https://www.bittorrent.org/beps/bep_0017.html)
- [ ] [21 - Extension for Partial Seeds](https://www.bittorrent.org/beps/bep_0021.html)
- [ ] [24 - Tracker Returns External IP](https://www.bittorrent.org/beps/bep_0024.html)
- [ ] [30 - Merkle tree torrent extension](https://www.bittorrent.org/beps/bep_0030.html)
- [ ] [31 - Tracker Failure Retry Extension](https://www.bittorrent.org/beps/bep_0031.html)
- [ ] [32 - IPv6 extension for DHT](https://www.bittorrent.org/beps/bep_0032.html)
- [ ] [33 - DHT scrape](https://www.bittorrent.org/beps/bep_0033.html)
- [ ] [34 - DNS Tracker Preferences](https://www.bittorrent.org/beps/bep_0034.html)
- [ ] [35 - Torrent Signing](https://www.bittorrent.org/beps/bep_0035.html)
- [ ] [36 - Torrent RSS feeds](https://www.bittorrent.org/beps/bep_0036.html)
- [ ] [38 - Finding Local Data Via Torrent File Hints](https://www.bittorrent.org/beps/bep_0038.html)
- [ ] [39 - Updating Torrents Via Feed URL](https://www.bittorrent.org/beps/bep_0039.html)
- [ ] [40 - Canonical Peer Priority](https://www.bittorrent.org/beps/bep_0040.html)
- [ ] [41 - UDP Tracker Protocol Extensions](https://www.bittorrent.org/beps/bep_0041.html)
- [ ] [42 - DHT Security Extension](https://www.bittorrent.org/beps/bep_0042.html)
- [ ] [43 - Read-only DHT Nodes](https://www.bittorrent.org/beps/bep_0043.html)
- [ ] [44 - Storing arbitrary data in the DHT](https://www.bittorrent.org/beps/bep_0044.html)
- [ ] [45 - Multiple-address operation for the BitTorrent DHT](https://www.bittorrent.org/beps/bep_0045.html)
- [ ] [46 - Updating Torrents Via DHT Mutable Items](https://www.bittorrent.org/beps/bep_0046.html)
- [ ] [47 - Padding files and extended file attributes](https://www.bittorrent.org/beps/bep_0047.html)
- [ ] [48 - Tracker Protocol Extension: Scrape](https://www.bittorrent.org/beps/bep_0048.html)
- [ ] [49 - Distributed Torrent Feeds](https://www.bittorrent.org/beps/bep_0049.html)
- [ ] [50 - Publish/Subscribe Protocol](https://www.bittorrent.org/beps/bep_0050.html)
- [ ] [51 - DHT Infohash Indexing](https://www.bittorrent.org/beps/bep_0051.html)
- [ ] [52 - The BitTorrent Protocol Specification v2](https://www.bittorrent.org/beps/bep_0052.html)
- [ ] [53 - Magnet URI extension - Select specific file indices for download](https://www.bittorrent.org/beps/bep_0053.html)
- [ ] [54 - The lt_donthave extension](https://www.bittorrent.org/beps/bep_0054.html)

#### Deferred BEPs

- [ ] [8 - Tracker Peer Obfuscation](https://www.bittorrent.org/beps/bep_0008.html)
- [ ] [18 - Search Engine Specification](https://www.bittorrent.org/beps/bep_0018.html)
- [ ] [22 - BitTorrent Local Tracker Discovery Protocol](https://www.bittorrent.org/beps/bep_0022.html)
- [ ] [26 - Zeroconf Peer Advertising and Discovery](https://www.bittorrent.org/beps/bep_0026.html)
- [ ] [28 - Tracker exchange](https://www.bittorrent.org/beps/bep_0028.html)

#### Withdrawn BEPs

At this time, no BEPs have been withdrawn.

#### Rejected BEPs

At this time, no BEPs have been rejected.

#### [Pending Standards Track Documents](https://www.bittorrent.org/beps/bep_0000.html)

- [ ] 13 - Protocol Encryption ([Wikipedia](https://en.wikipedia.org/wiki/BitTorrent_protocol_encryption))

### Custom or non-BEP extensions

None so far.

## License

Copyright 2020 Álvaro Cuesta <alvaro-cuesta@GitHub>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER
RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT,
NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE
USE OR PERFORMANCE OF THIS SOFTWARE.
