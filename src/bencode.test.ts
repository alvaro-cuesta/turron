import {
  decodeInteger,
  decodeBytes,
  decodeList,
  decodeDict,
  encodeInteger,
  encodeBytes,
  encodeList,
  encodeDict,
} from './bencode'

describe('decodeInteger', () => {
  it('handles positive numbers', () => {
    expect(decodeInteger(Buffer.from('i9e')))
      .toEqual(9)
    expect(decodeInteger(Buffer.from('i1337e')))
      .toEqual(1337)
  })

  it('handles negative numbers', () => {
    expect(decodeInteger(Buffer.from('i-9e')))
      .toEqual(-9)
    expect(decodeInteger(Buffer.from('i-1337e')))
      .toEqual(-1337)
  })

  it('handles zero', () => {
    expect(decodeInteger(Buffer.from('i0e')))
      .toEqual(0)
  })

  describe('errors', () => {
    it('throws on leading zeroes', () => {
      expect(() => decodeInteger(Buffer.from('i00e')))
        .toThrow()
      expect(() => decodeInteger(Buffer.from('i0123e')))
        .toThrow()
    })

    it('throws on negative zero', () => {
      expect(() => decodeInteger(Buffer.from('i-0e')))
        .toThrow()
    })

    it('throws on missing number', () => {
      expect(() => decodeInteger(Buffer.from('ie')))
        .toThrow()
    })

    it('throws on missing start', () => {
      expect(() => decodeInteger(Buffer.from('123e')))
        .toThrow()
    })

    it('throws on missing end', () => {
      expect(() => decodeInteger(Buffer.from('i123')))
        .toThrow()
    })

    it('throws on missing EOF', () => {
      expect(() => decodeInteger(Buffer.from('i123e456')))
        .toThrow()
    })
  })
})

describe('decodeBytes', () => {
  it('handles ascii strings', () => {
    expect(decodeBytes(Buffer.from('3:123')))
      .toEqual(Buffer.from('123'))
    expect(decodeBytes(Buffer.from('5:hello')))
      .toEqual(Buffer.from('hello'))
  })

  it('handles binary strings', () => {
    expect(decodeBytes(Buffer.concat([Buffer.from('3:'), Buffer.from([13, 37, 255])])))
      .toEqual(Buffer.from([13, 37, 255]))
  })

  it('handles empty strings', () => {
    expect(decodeBytes(Buffer.from('0:')))
      .toEqual(Buffer.from([]))
  })

  describe('errors', () => {
    it('throws on missing separator', () => {
      expect(() => decodeBytes(Buffer.from('3abcdefg')))
        .toThrow()
    })

    it('throws on early EOF', () => {
      expect(() => decodeBytes(Buffer.from('10:')))
        .toThrow()
    })

    it('throws on missing EOF', () => {
      expect(() => decodeBytes(Buffer.from('3:abcdefg')))
        .toThrow()
    })
  })
})

describe('decodeList', () => {
  it('handles integer lists', () => {
    expect(decodeList(Buffer.from('li1ei2ee')))
      .toEqual([1, 2])
  })

  it('handles bytes lists', () => {
    expect(decodeList(Buffer.from('l3:1235:helloe')))
      .toEqual([
        Buffer.from('123'),
        Buffer.from('hello'),
      ])
  })

  it('handles list lists', () => {
    expect(decodeList(Buffer.from('lli1ei2eel3:1235:helloee')))
      .toEqual([
        [1, 2],
        [Buffer.from('123'), Buffer.from('hello')],
      ])
  })

  it('handles dict lists', () => {
    expect(decodeList(Buffer.from('ld1:ai1e1:bi2eed1:ci3e1:di4eee')))
      .toEqual([
        new Map([
          [Buffer.from('a'), 1],
          [Buffer.from('b'), 2],
        ]),
        new Map([
          [Buffer.from('c'), 3],
          [Buffer.from('d'), 4],
        ]),
      ])
  })

  it('handles mixed lists', () => {
    expect(decodeList(Buffer.from('li1e5:helloli1ei2eed1:ai1e1:bi2eee')))
      .toEqual([
        1,
        Buffer.from('hello'),
        [1, 2],
        new Map([
          [Buffer.from('a'), 1],
          [Buffer.from('b'), 2],
        ]),
      ])
  })

  it('handles empty lists', () => {
    expect(decodeList(Buffer.from('le')))
      .toEqual([])
  })

  describe('errors', () => {
    it('throws on invalid content', () => {
      expect(() => decodeList(Buffer.from('lQUACKe')))
        .toThrow()
    })

    it('throws on missing start', () => {
      expect(() => decodeList(Buffer.from('i1ee')))
        .toThrow()
    })

    it('throws on missing end', () => {
      expect(() => decodeList(Buffer.from('li1e')))
        .toThrow()
    })

    it('throws on missing EOF', () => {
      expect(() => decodeList(Buffer.from('li1eeEXTRA')))
        .toThrow()
    })
  })
})

describe('decodeDict', () => {
  it('handles integer values', () => {
    expect(decodeDict(Buffer.from('d1:ai1e1:bi2ee')))
      .toEqual(new Map([
        [Buffer.from('a'), 1],
        [Buffer.from('b'), 2],
      ]))
  })

  it('handles bytes values', () => {
    expect(decodeDict(Buffer.from('d1:a3:1231:b5:helloe')))
      .toEqual(new Map([
        [Buffer.from('a'), Buffer.from('123')],
        [Buffer.from('b'), Buffer.from('hello')],
      ]))
  })

  it('handles list values', () => {
    expect(decodeDict(Buffer.from('d1:ali1ei2ee1:bli3ei4eee')))
      .toEqual(new Map([
        [Buffer.from('a'), [1, 2]],
        [Buffer.from('b'), [3, 4]],
      ]))
  })

  it('handles dict values', () => {
    expect(decodeDict(Buffer.from('d1:ad1:bi1e1:ci2ee1:dd1:ei3e1:fi4eee')))
      .toEqual(new Map([
        [
          Buffer.from('a'),
          new Map([
            [Buffer.from('b'), 1],
            [Buffer.from('c'), 2],
          ])
        ],
        [
          Buffer.from('d'),
          new Map([
            [Buffer.from('e'), 3],
            [Buffer.from('f'), 4],
          ])
        ],
      ]))
  })

  it('handles empty dict', () => {
    expect(decodeDict(Buffer.from('de')))
      .toEqual(new Map())
  })

  describe('errors', () => {
    it('throws on non-bytes key', () => {
      expect(() => decodeDict(Buffer.from('di1ei1ee')))
        .toThrow()
    })

    it('throws on invalid content', () => {
      expect(() => decodeDict(Buffer.from('dQUACKe')))
        .toThrow()
    })

    it('throws on missing value', () => {
      expect(() => decodeDict(Buffer.from('d1:ae')))
        .toThrow()
    })

    it('throws on missing start', () => {
      expect(() => decodeDict(Buffer.from('1:ai1e2:bi2ee')))
        .toThrow()
    })

    it('throws on missing end', () => {
      expect(() => decodeDict(Buffer.from('d1:ai1e2:bi2e')))
        .toThrow()
    })

    it('throws on missing EOF', () => {
      expect(() => decodeList(Buffer.from('d1:ai1e2:bi2eeEXTRA')))
        .toThrow()
    })
  })
})

describe('encodeInteger', () => {
  it('encodes positive values', () => {
    expect(encodeInteger(7))
      .toEqual(Buffer.from('i7e'))
    expect(encodeInteger(123))
      .toEqual(Buffer.from('i123e'))
  })

  it('encodes negative values', () => {
    expect(encodeInteger(-7))
      .toEqual(Buffer.from('i-7e'))
    expect(encodeInteger(-123))
      .toEqual(Buffer.from('i-123e'))
  })

  it('encodes zero', () => {
    expect(encodeInteger(0))
      .toEqual(Buffer.from('i0e'))
  })

  describe('errors', () => {
    it('throws on non-integer numbers', () => {
      expect(() => encodeInteger(0.5))
        .toThrow()
    })
  })
})

describe('encodeBytes', () => {
  it('encodes buffers', () => {
    expect(encodeBytes(Buffer.from('hello')))
      .toEqual(Buffer.from('5:hello'))
  })

  it('encodes emtpy buffers', () => {
    expect(encodeBytes(Buffer.from('')))
      .toEqual(Buffer.from('0:'))
  })

  it('encodes strings', () => {
    expect(encodeBytes('hello'))
      .toEqual(Buffer.from('5:hello'))
  })

  it('encodes emtpy strings', () => {
    expect(encodeBytes(''))
      .toEqual(Buffer.from('0:'))
  })
})

describe('encodeList', () => {
  it('encodes integer arrays', () => {
    expect(encodeList([1, 2]))
      .toEqual(Buffer.from('li1ei2ee'))
  })

  it('encodes buffer arrays', () => {
    expect(encodeList([
      Buffer.from('123'),
      Buffer.from('hello'),
    ]))
      .toEqual(Buffer.from('l3:1235:helloe'))
  })

  it('encodes nested arrays', () => {
    expect(encodeList([
      [1, 2],
      [Buffer.from('123'), Buffer.from('hello')],
    ]))
      .toEqual(Buffer.from('lli1ei2eel3:1235:helloee'))
  })

  it('encodes map arrays', () => {
    expect(encodeList([
      new Map([
        [Buffer.from('a'), 1],
        [Buffer.from('b'), 2],
      ]),
      new Map([
        [Buffer.from('c'), 3],
        [Buffer.from('d'), 4],
      ]),
    ]))
      .toEqual(Buffer.from('ld1:ai1e1:bi2eed1:ci3e1:di4eee'))
  })

  it('encodes mixed arrays', () => {
    expect(encodeList([
      1,
      Buffer.from('hello'),
      [1, 2],
      new Map([
        [Buffer.from('a'), 1],
        [Buffer.from('b'), 2],
      ]),
    ]))
      .toEqual(Buffer.from('li1e5:helloli1ei2eed1:ai1e1:bi2eee'))
  })

  it('encodes empty arrays', () => {
    expect(encodeList([]))
      .toEqual(Buffer.from('le'))
  })
})

describe('encodeDict', () => {
  it('encodes Map with integer values', () => {
    expect(encodeDict(new Map([
      [Buffer.from('a'), 1],
      [Buffer.from('b'), 2],
    ])))
      .toEqual(Buffer.from('d1:ai1e1:bi2ee'))
  })

  it('encodes Map with buffer values', () => {
    expect(encodeDict(new Map([
      [Buffer.from('a'), Buffer.from('123')],
      [Buffer.from('b'), Buffer.from('hello')],
    ])))
      .toEqual(Buffer.from('d1:a3:1231:b5:helloe'))
  })

  it('encodes Map with array values', () => {
    expect(encodeDict(new Map([
      [Buffer.from('a'), [1, 2]],
      [Buffer.from('b'), [3, 4]],
    ])))
      .toEqual(Buffer.from('d1:ali1ei2ee1:bli3ei4eee'))
  })

  it('encodes Map with Map values', () => {
    expect(encodeDict(new Map([
      [
        Buffer.from('a'),
        new Map([
          [Buffer.from('b'), 1],
          [Buffer.from('c'), 2],
        ])
      ],
      [
        Buffer.from('d'),
        new Map([
          [Buffer.from('e'), 3],
          [Buffer.from('f'), 4],
        ])
      ],
    ])))
      .toEqual(Buffer.from('d1:ad1:bi1e1:ci2ee1:dd1:ei3e1:fi4eee'))
  })

  it('encodes empty Map', () => {
    expect(encodeDict(new Map()))
      .toEqual(Buffer.from('de'))
  })

  it('encodes object with integer values', () => {
    expect(encodeDict({
      a: 1,
      b: 2,
    }))
      .toEqual(Buffer.from('d1:ai1e1:bi2ee'))
  })

  it('encodes object with buffer values', () => {
    expect(encodeDict({
      a: Buffer.from('123'),
      b: Buffer.from('hello'),
    }))
      .toEqual(Buffer.from('d1:a3:1231:b5:helloe'))
  })

  it('encodes object with array values', () => {
    expect(encodeDict({
      a: [1, 2],
      b: [3, 4],
    }))
      .toEqual(Buffer.from('d1:ali1ei2ee1:bli3ei4eee'))
  })

  it('encodes object with object values', () => {
    expect(encodeDict({
      a: {
        b: 1,
        c: 2,
      },
      d: {
        e: 3,
        f: 4,
      },
    }))
      .toEqual(Buffer.from('d1:ad1:bi1e1:ci2ee1:dd1:ei3e1:fi4eee'))
  })

  it('encodes empty object', () => {
    expect(encodeDict({}))
      .toEqual(Buffer.from('de'))
  })

  it('encodes Map keys in lexicographical order', () => {
    expect(encodeDict(new Map([
      ['d', new Map([['f', 4], ['e', 3]])],
      ['a', new Map([['c', 2], ['b', 1]])],
    ])))
      .toEqual(Buffer.from('d1:ad1:bi1e1:ci2ee1:dd1:ei3e1:fi4eee'))
  })

  it('encodes object keys in lexicographical order', () => {
    expect(encodeDict({
      d: {
        f: 4,
        e: 3,
      },
      a: {
        c: 2,
        b: 1,
      },
    }))
      .toEqual(Buffer.from('d1:ad1:bi1e1:ci2ee1:dd1:ei3e1:fi4eee'))
  })
})
