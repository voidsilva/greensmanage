import { describe, expect, it } from 'vitest';
import { NewBetSchema, codeFrom, parseDecimal } from '@/lib/validation';

describe('parseDecimal', () => {
  it('reads Brazilian and plain formats', () => {
    expect(parseDecimal('1,85')).toBe(1.85);
    expect(parseDecimal('1.85')).toBe(1.85);
    expect(parseDecimal('1.234,50')).toBe(1234.5);
    expect(parseDecimal(' 100 ')).toBe(100);
  });
});

describe('NewBetSchema', () => {
  const ok = {
    game: 'Santos x Grêmio',
    league: '',
    market: 'btts',
    odd: '1,9',
    stake: '120',
    status: 'pending',
  };
  it('accepts a valid bet and defaults the league', () => {
    const r = NewBetSchema.parse(ok);
    expect(r).toMatchObject({ odd: 1.9, stake: 120, league: 'Outros' });
  });
  it.each([
    [{ odd: '1' }, 'A odd precisa ser maior que 1.'],
    [{ stake: '0' }, 'A stake precisa ser maior que 0.'],
    [{ game: 'ab' }, 'Informe o jogo.'],
    [{ market: 'xyz' }, 'Mercado inválido.'],
  ])('rejects %o', (patch, msg) => {
    const r = NewBetSchema.safeParse({ ...ok, ...patch });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe(msg);
  });
});

describe('codeFrom', () => {
  it('builds a 3-letter badge, ignoring accents', () => {
    expect(codeFrom('Grêmio x Inter')).toBe('GRE');
    expect(codeFrom('123')).toBe('GM');
  });
});
