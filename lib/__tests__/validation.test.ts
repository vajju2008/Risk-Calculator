import {
  assessRiskLevel,
  validateTradeInputs,
  getTradeDirection,
} from '../validation';

describe('assessRiskLevel', () => {
  it('returns safe for 0.5%', () => {
    const result = assessRiskLevel(0.5);
    expect(result.level).toBe('safe');
    expect(result.color).toBe('#22c55e');
  });

  it('returns safe for 1%', () => {
    const result = assessRiskLevel(1);
    expect(result.level).toBe('safe');
  });

  it('returns moderate for 1.5%', () => {
    const result = assessRiskLevel(1.5);
    expect(result.level).toBe('moderate');
    expect(result.color).toBe('#eab308');
  });

  it('returns high for 2.5%', () => {
    const result = assessRiskLevel(2.5);
    expect(result.level).toBe('high');
    expect(result.color).toBe('#f97316');
  });

  it('returns dangerous for 4%', () => {
    const result = assessRiskLevel(4);
    expect(result.level).toBe('dangerous');
    expect(result.color).toBe('#ef4444');
  });

  it('returns blocked for 6%', () => {
    const result = assessRiskLevel(6);
    expect(result.level).toBe('blocked');
  });
});

describe('validateTradeInputs', () => {
  it('validates correct inputs', () => {
    const result = validateTradeInputs(10000, 1, 1.1, 1.095, 1.11);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects negative account size', () => {
    const result = validateTradeInputs(-100, 1, 1.1, 1.095, null);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects zero account size', () => {
    const result = validateTradeInputs(0, 1, 1.1, 1.095, null);
    expect(result.isValid).toBe(false);
  });

  it('rejects risk over 5%', () => {
    const result = validateTradeInputs(10000, 6, 1.1, 1.095, null);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('5%'))).toBe(true);
  });

  it('warns for risk over 2%', () => {
    const result = validateTradeInputs(10000, 2.5, 1.1, 1.095, null);
    expect(result.isValid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('warns for risk over 3%', () => {
    const result = validateTradeInputs(10000, 3.5, 1.1, 1.095, null);
    expect(result.isValid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('rejects same entry and stop loss', () => {
    const result = validateTradeInputs(10000, 1, 1.1, 1.1, null);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('same'))).toBe(true);
  });

  it('rejects negative prices', () => {
    const result = validateTradeInputs(10000, 1, -1.1, 1.095, null);
    expect(result.isValid).toBe(false);
  });

  it('handles null take profit', () => {
    const result = validateTradeInputs(10000, 1, 1.1, 1.095, null);
    expect(result.isValid).toBe(true);
  });

  it('rejects invalid take profit', () => {
    const result = validateTradeInputs(10000, 1, 1.1, 1.095, -1.2);
    expect(result.isValid).toBe(false);
  });

  it('warns for very small account', () => {
    const result = validateTradeInputs(50, 1, 1.1, 1.095, null);
    expect(result.isValid).toBe(true);
    expect(result.warnings.some((w) => w.includes('small'))).toBe(true);
  });
});

describe('getTradeDirection', () => {
  it('returns long when entry > stop loss', () => {
    expect(getTradeDirection(1.1, 1.095)).toBe('long');
  });

  it('returns short when entry < stop loss', () => {
    expect(getTradeDirection(1.095, 1.1)).toBe('short');
  });
});
