import {
  decodeInteger,
  decodeBytes,
  decodeList,
  decodeDict,
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
