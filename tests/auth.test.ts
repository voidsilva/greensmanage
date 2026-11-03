import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword, DUMMY_HASH } from '@/lib/password';

describe('password hashing', () => {
  it('verifies the right password and rejects the wrong one', async () => {
    const h = await hashPassword('Green-123');
    expect(h.startsWith('scrypt$')).toBe(true);
    expect(await verifyPassword('Green-123', h)).toBe(true);
    expect(await verifyPassword('green-123', h)).toBe(false);
  });
  it('salts every hash', async () => {
    expect(await hashPassword('x')).not.toBe(await hashPassword('x'));
  });
  it('never matches the dummy hash', async () => {
    expect(await verifyPassword('', DUMMY_HASH)).toBe(false);
  });
});
