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
    expect(decodeInteger('i9e'))
      .toEqual(9)
    expect(decodeInteger('i1337e'))
      .toEqual(1337)
  })

  it('handles negative numbers', () => {
    expect(decodeInteger('i-9e'))
      .toEqual(-9)
    expect(decodeInteger('i-1337e'))
      .toEqual(-1337)
  })

  it('handles zero', () => {
    expect(decodeInteger('i0e'))
      .toEqual(0)
  })

  describe('errors', () => {
    it('throws on leading zeroes', () => {
      expect(() => decodeInteger('i00e'))
        .toThrow()
      expect(() => decodeInteger('i0123e'))
        .toThrow()
    })

    it('throws on negative zero', () => {
      expect(() => decodeInteger('i-0e'))
        .toThrow()
    })

    it('throws on missing number', () => {
      expect(() => decodeInteger('ie'))
        .toThrow()
    })

    it('throws on missing start', () => {
      expect(() => decodeInteger('123e'))
        .toThrow()
    })

    it('throws on missing end', () => {
      expect(() => decodeInteger('i123'))
        .toThrow()
    })

    it('throws on missing EOF', () => {
      expect(() => decodeInteger('i123e456'))
        .toThrow()
    })
  })
})

describe('decodeBytes', () => {
  it('handles ascii strings', () => {
    expect(decodeBytes('3:123'))
      .toEqual('123')
    expect(decodeBytes('5:hello'))
      .toEqual('hello')
  })

  it('handles binary strings', () => {
    expect(decodeBytes('3:\x13\x37\xff'))
      .toEqual('\x13\x37\xff')
  })

  it('handles empty strings', () => {
    expect(decodeBytes('0:'))
      .toEqual('')
  })

  describe('errors', () => {
    it('throws on missing separator', () => {
      expect(() => decodeBytes('3abcdefg'))
        .toThrow()
    })

    it('throws on early EOF', () => {
      expect(() => decodeBytes('10:'))
        .toThrow()
    })

    it('throws on missing EOF', () => {
      expect(() => decodeBytes('3:abcdefg'))
        .toThrow()
    })
  })
})

describe('decodeList', () => {
  it('handles integer lists', () => {
    expect(decodeList('li1ei2ee'))
      .toEqual([1, 2])
  })

  it('handles bytes lists', () => {
    expect(decodeList('l3:1235:helloe'))
      .toEqual(['123', 'hello'])
  })

  it('handles list lists', () => {
    expect(decodeList('lli1ei2eel3:1235:helloee'))
      .toEqual([
        [1, 2],
        ['123', 'hello'],
      ])
  })

  it('handles dict lists', () => {
    expect(decodeList('ld1:ai1e1:bi2eed1:ci3e1:di4eee'))
      .toEqual([
        { a: 1, b: 2 },
        { c: 3, d: 4 },
      ])
  })

  it('handles mixed lists', () => {
    expect(decodeList('li1e5:helloli1ei2eed1:ai1e1:bi2eee'))
      .toEqual([
        1,
        'hello',
        [1, 2],
        { a: 1, b: 2 },
      ])
  })

  it('handles empty lists', () => {
    expect(decodeList('le'))
      .toEqual([])
  })

  describe('errors', () => {
    it('throws on invalid content', () => {
      expect(() => decodeList('lQUACKe'))
        .toThrow()
    })

    it('throws on missing start', () => {
      expect(() => decodeList('i1ee'))
        .toThrow()
    })

    it('throws on missing end', () => {
      expect(() => decodeList('li1e'))
        .toThrow()
    })

    it('throws on missing EOF', () => {
      expect(() => decodeList('li1eeEXTRA'))
        .toThrow()
    })
  })
})

describe('decodeDict', () => {
  it('handles integer values', () => {
    expect(decodeDict('d1:ai1e1:bi2ee'))
      .toEqual({ a: 1, b: 2 })
  })

  it('handles bytes values', () => {
    expect(decodeDict('d1:a3:1231:b5:helloe'))
      .toEqual({
        a: '123',
        b: 'hello',
      })
  })

  it('handles list values', () => {
    expect(decodeDict('d1:ali1ei2ee1:bli3ei4eee'))
      .toEqual({
        a: [ 1, 2 ],
        b: [ 3, 4 ],
      })
  })

  it('handles dict values', () => {
    expect(decodeDict('d1:ad1:bi1e1:ci2ee1:dd1:ei3e1:fi4eee'))
      .toEqual({
        a: {
          b: 1,
          c: 2,
        },
        d: {
          e: 3,
          f: 4,
        }
      })
  })

  it('handles empty dict', () => {
    expect(decodeDict('de'))
      .toEqual({})
  })

  describe('errors', () => {
    it('throws on non-bytes key', () => {
      expect(() => decodeDict('di1ei1ee'))
        .toThrow()
    })

    it('throws on invalid content', () => {
      expect(() => decodeDict('dQUACKe'))
        .toThrow()
    })

    it('throws on missing value', () => {
      expect(() => decodeDict('d1:ae'))
        .toThrow()
    })

    it('throws on missing start', () => {
      expect(() => decodeDict('1:ai1e2:bi2ee'))
        .toThrow()
    })

    it('throws on missing end', () => {
      expect(() => decodeDict('d1:ai1e2:bi2e'))
        .toThrow()
    })

    it('throws on missing EOF', () => {
      expect(() => decodeList('d1:ai1e2:bi2eeEXTRA'))
        .toThrow()
    })
  })
})

describe('encodeInteger', () => {
  it('encodes positive values', () => {
    expect(encodeInteger(7))
      .toEqual('i7e')
    expect(encodeInteger(123))
      .toEqual('i123e')
  })

  it('encodes negative values', () => {
    expect(encodeInteger(-7))
      .toEqual('i-7e')
    expect(encodeInteger(-123))
      .toEqual('i-123e')
  })

  it('encodes zero', () => {
    expect(encodeInteger(0))
      .toEqual('i0e')
  })

  describe('errors', () => {
    it('throws on non-integer numbers', () => {
      expect(() => encodeInteger(0.5))
        .toThrow()
    })
  })
})

describe('encodeBytes', () => {
  it('encodes strings', () => {
    expect(encodeBytes('hello'))
      .toEqual('5:hello')
  })

  it('encodes emtpy strings', () => {
    expect(encodeBytes(''))
      .toEqual('0:')
  })
})

describe('encodeList', () => {
  it('encodes integer arrays', () => {
    expect(encodeList([1, 2]))
      .toEqual('li1ei2ee')
  })

  it('encodes string arrays', () => {
    expect(encodeList(['123', 'hello']))
      .toEqual('l3:1235:helloe')
  })

  it('encodes nested arrays', () => {
    expect(encodeList([
      [1, 2],
      ['123', 'hello'],
    ]))
      .toEqual('lli1ei2eel3:1235:helloee')
  })

  it('encodes object arrays', () => {
    expect(encodeList([
      { a: 1, b: 2 },
      { c: 3, d: 4 },
    ]))
      .toEqual('ld1:ai1e1:bi2eed1:ci3e1:di4eee')
  })

  it('encodes mixed arrays', () => {
    expect(encodeList([
      1,
      'hello',
      [1, 2],
      { a: 1, b: 2 },
    ]))
      .toEqual('li1e5:helloli1ei2eed1:ai1e1:bi2eee')
  })

  it('encodes empty arrays', () => {
    expect(encodeList([]))
      .toEqual('le')
  })
})

describe('encodeDict', () => {
  it('encodes object with integer values', () => {
    expect(encodeDict({
      a: 1,
      b: 2,
    }))
      .toEqual('d1:ai1e1:bi2ee')
  })

  it('encodes object with string values', () => {
    expect(encodeDict({
      a: '123',
      b: 'hello',
    }))
      .toEqual('d1:a3:1231:b5:helloe')
  })

  it('encodes object with array values', () => {
    expect(encodeDict({
      a: [1, 2],
      b: [3, 4],
    }))
      .toEqual('d1:ali1ei2ee1:bli3ei4eee')
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
      .toEqual('d1:ad1:bi1e1:ci2ee1:dd1:ei3e1:fi4eee')
  })

  it('encodes empty object', () => {
    expect(encodeDict({}))
      .toEqual('de')
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
      .toEqual('d1:ad1:bi1e1:ci2ee1:dd1:ei3e1:fi4eee')
  })
})
