import { describe, it, expect } from 'vitest';
import { formatPrice, formatShortPrice, cn, generateOrderNumber, getStatusColor, getStatusLabel } from '../lib/utils';

describe('formatPrice', () => {
  it('formats 0 as 0 FCFA', () => {
    expect(formatPrice(0).replace(/\s/g, ' ')).toBe('0 F CFA');
  });

  it('formats 1000 as 1 000 FCFA', () => {
    expect(formatPrice(1000).replace(/\s/g, ' ')).toBe('1 000 F CFA');
  });

  it('formats 150000 as 150 000 FCFA', () => {
    expect(formatPrice(150000).replace(/\s/g, ' ')).toBe('150 000 F CFA');
  });
});

describe('formatShortPrice', () => {
  it('returns raw number under 1000', () => {
    expect(formatShortPrice(500)).toBe('500');
  });

  it('returns K for thousands', () => {
    expect(formatShortPrice(15000)).toBe('15K');
  });

  it('returns M for millions', () => {
    expect(formatShortPrice(2500000)).toBe('2.5M');
  });
});

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('filters falsy values', () => {
    expect(cn('a', false, undefined, 'b')).toBe('a b');
  });

  it('handles clsx objects', () => {
    expect(cn({ a: true, b: false })).toBe('a');
  });
});

describe('generateOrderNumber', () => {
  it('returns ORD- followed by date and random chars', () => {
    const result = generateOrderNumber();
    expect(result).toMatch(/^ORD-\d{8}-[A-Z0-9]+$/);
  });
});

describe('getStatusColor', () => {
  it('returns color for known status', () => {
    const result = getStatusColor('pending');
    expect(result).toContain('bg-yellow-100');
    expect(result).toContain('text-yellow-800');
    expect(result).toContain('dark:bg-yellow-900/30');
    expect(result).toContain('dark:text-yellow-400');
  });

  it('returns default for unknown status', () => {
    const result = getStatusColor('unknown');
    expect(result).toContain('bg-gray-100');
    expect(result).toContain('text-gray-800');
    expect(result).toContain('dark:bg-gray-700');
    expect(result).toContain('dark:text-gray-300');
  });
});

describe('getStatusLabel', () => {
  it('returns French label for known status', () => {
    expect(getStatusLabel('pending')).toBe('En attente');
  });

  it('returns status itself for unknown', () => {
    expect(getStatusLabel('foo')).toBe('foo');
  });
});
