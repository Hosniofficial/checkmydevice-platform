/**
 * Tests: Response helpers, pagination, IMEI masking
 */

import { describe, it, expect } from '@jest/globals';
import { paginate, getPagination, maskIMEI } from '../utils/response.js';

describe('maskIMEI()', () => {
  it('masks all but last 4 digits', () => {
    const masked = maskIMEI('358240051111110');
    expect(masked.endsWith('1110')).toBe(true);
    expect(masked.includes('*')).toBe(true);
  });

  it('handles empty string', () => {
    expect(maskIMEI('')).toBe('');
  });

  it('handles null/undefined gracefully', () => {
    expect(maskIMEI(null)).toBe('');
    expect(maskIMEI(undefined)).toBe('');
  });

  it('last 4 digits are always visible', () => {
    const imei   = '490154203237518';
    const masked = maskIMEI(imei);
    expect(masked.slice(-4)).toBe('7518');
  });
});

describe('paginate()', () => {
  it('calculates total_pages correctly', () => {
    const result = paginate([], 100, 1, 20);
    expect(result.meta.total_pages).toBe(5);
  });

  it('sets has_next=true when more pages exist', () => {
    const result = paginate([], 100, 1, 20);
    expect(result.meta.has_next).toBe(true);
    expect(result.meta.has_prev).toBe(false);
  });

  it('sets has_prev=true on second page', () => {
    const result = paginate([], 100, 2, 20);
    expect(result.meta.has_prev).toBe(true);
  });

  it('has_next=false on last page', () => {
    const result = paginate([], 20, 1, 20);
    expect(result.meta.has_next).toBe(false);
  });

  it('handles zero total gracefully', () => {
    const result = paginate([], 0, 1, 20);
    expect(result.meta.total_pages).toBe(0);
    expect(result.meta.has_next).toBe(false);
  });

  it('passes items through unchanged', () => {
    const items  = [{ id: 1 }, { id: 2 }];
    const result = paginate(items, 50, 1, 20);
    expect(result.items).toEqual(items);
  });
});

describe('getPagination()', () => {
  it('defaults to page=1, limit=20', () => {
    const result = getPagination({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.offset).toBe(0);
  });

  it('calculates offset correctly', () => {
    const result = getPagination({ page: '3', limit: '10' });
    expect(result.offset).toBe(20);
  });

  it('caps limit at 100', () => {
    const result = getPagination({ limit: '9999' });
    expect(result.limit).toBe(100);
  });

  it('floors page at 1', () => {
    const result = getPagination({ page: '-5' });
    expect(result.page).toBe(1);
  });
});
