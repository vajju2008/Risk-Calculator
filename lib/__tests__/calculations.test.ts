import Decimal from 'decimal.js';
import {
  calculateRiskAmount,
  calculatePipDistance,
  calculateForexPositionSize,
  calculateCryptoPositionSize,
  calculateLots,
  calculateRewardRiskRatio,
  calculatePotentialProfit,
  calculatePosition,
} from '../calculations';
import { getPairBySymbol } from '../pairData';

describe('calculateRiskAmount', () => {
  it('calculates 1% risk on $10,000 account', () => {
    const result = calculateRiskAmount(new Decimal(10000), new Decimal(1));
    expect(result.toNumber()).toBe(100);
  });

  it('calculates 2% risk on $50,000 account', () => {
    const result = calculateRiskAmount(new Decimal(50000), new Decimal(2));
    expect(result.toNumber()).toBe(1000);
  });

  it('calculates 0.5% risk on $5,000 account', () => {
    const result = calculateRiskAmount(new Decimal(5000), new Decimal(0.5));
    expect(result.toNumber()).toBe(25);
  });

  it('handles very small accounts', () => {
    const result = calculateRiskAmount(new Decimal(100), new Decimal(1));
    expect(result.toNumber()).toBe(1);
  });

  it('handles 5% maximum risk', () => {
    const result = calculateRiskAmount(new Decimal(10000), new Decimal(5));
    expect(result.toNumber()).toBe(500);
  });
});

describe('calculatePipDistance', () => {
  it('calculates pip distance for EUR/USD (4 decimal places)', () => {
    const result = calculatePipDistance(
      new Decimal('1.10000'),
      new Decimal('1.09500'),
      new Decimal('0.0001')
    );
    expect(result.toNumber()).toBe(50);
  });

  it('calculates pip distance for USD/JPY (2 decimal places)', () => {
    const result = calculatePipDistance(
      new Decimal('150.000'),
      new Decimal('149.500'),
      new Decimal('0.01')
    );
    expect(result.toNumber()).toBe(50);
  });

  it('handles short trades (SL above entry)', () => {
    const result = calculatePipDistance(
      new Decimal('1.09000'),
      new Decimal('1.09300'),
      new Decimal('0.0001')
    );
    expect(result.toNumber()).toBe(30);
  });

  it('returns 0 when entry equals stop loss', () => {
    const result = calculatePipDistance(
      new Decimal('1.10000'),
      new Decimal('1.10000'),
      new Decimal('0.0001')
    );
    expect(result.toNumber()).toBe(0);
  });
});

describe('calculateForexPositionSize', () => {
  it('calculates position size for EUR/USD with 50 pip SL', () => {
    // Risk $100, 50 pips, pip value $10/lot, contract 100000
    const result = calculateForexPositionSize(
      new Decimal(100),
      new Decimal(50),
      new Decimal(10),
      new Decimal(100000)
    );
    // Position = 100 / (50 * (10/100000)) = 100 / (50 * 0.0001) = 100 / 0.005 = 20000
    expect(result.toNumber()).toBe(20000);
  });

  it('returns 0 when pip distance is 0', () => {
    const result = calculateForexPositionSize(
      new Decimal(100),
      new Decimal(0),
      new Decimal(10),
      new Decimal(100000)
    );
    expect(result.toNumber()).toBe(0);
  });

  it('returns 0 when pip value is 0', () => {
    const result = calculateForexPositionSize(
      new Decimal(100),
      new Decimal(50),
      new Decimal(0),
      new Decimal(100000)
    );
    expect(result.toNumber()).toBe(0);
  });
});

describe('calculateCryptoPositionSize', () => {
  it('calculates BTC position with $2000 price difference', () => {
    // Risk $200, entry $50000, SL $48000 → position = 200 / 2000 = 0.1 BTC
    const result = calculateCryptoPositionSize(
      new Decimal(200),
      new Decimal(50000),
      new Decimal(48000)
    );
    expect(result.toNumber()).toBe(0.1);
  });

  it('calculates ETH position', () => {
    // Risk $100, entry $3000, SL $2900 → position = 100 / 100 = 1 ETH
    const result = calculateCryptoPositionSize(
      new Decimal(100),
      new Decimal(3000),
      new Decimal(2900)
    );
    expect(result.toNumber()).toBe(1);
  });

  it('returns 0 when entry equals stop loss', () => {
    const result = calculateCryptoPositionSize(
      new Decimal(100),
      new Decimal(50000),
      new Decimal(50000)
    );
    expect(result.toNumber()).toBe(0);
  });
});

describe('calculateLots', () => {
  it('converts 100000 units to 1 standard lot', () => {
    const result = calculateLots(new Decimal(100000), new Decimal(100000));
    expect(result.standard.toNumber()).toBe(1);
    expect(result.mini.toNumber()).toBe(10);
    expect(result.micro.toNumber()).toBe(100);
  });

  it('converts 20000 units to 0.2 standard lots', () => {
    const result = calculateLots(new Decimal(20000), new Decimal(100000));
    expect(result.standard.toNumber()).toBe(0.2);
    expect(result.mini.toNumber()).toBe(2);
    expect(result.micro.toNumber()).toBe(20);
  });

  it('converts 5000 units to 0.05 standard lots', () => {
    const result = calculateLots(new Decimal(5000), new Decimal(100000));
    expect(result.standard.toNumber()).toBe(0.05);
    expect(result.mini.toNumber()).toBe(0.5);
    expect(result.micro.toNumber()).toBe(5);
  });
});

describe('calculateRewardRiskRatio', () => {
  it('calculates 1:2 ratio', () => {
    const result = calculateRewardRiskRatio(
      new Decimal('1.10000'),
      new Decimal('1.09500'),
      new Decimal('1.11000')
    );
    expect(result.toNumber()).toBe(2);
  });

  it('calculates 1:3 ratio', () => {
    const result = calculateRewardRiskRatio(
      new Decimal('1.10000'),
      new Decimal('1.09500'),
      new Decimal('1.11500')
    );
    expect(result.toNumber()).toBe(3);
  });

  it('calculates 1:1 ratio', () => {
    const result = calculateRewardRiskRatio(
      new Decimal('1.10000'),
      new Decimal('1.09500'),
      new Decimal('1.10500')
    );
    expect(result.toNumber()).toBe(1);
  });

  it('returns 0 when entry equals stop loss', () => {
    const result = calculateRewardRiskRatio(
      new Decimal('1.10000'),
      new Decimal('1.10000'),
      new Decimal('1.11000')
    );
    expect(result.toNumber()).toBe(0);
  });
});

describe('calculatePotentialProfit', () => {
  it('calculates forex profit correctly', () => {
    const pair = getPairBySymbol('EURUSD')!;
    // 20000 units, entry 1.10000, TP 1.11000 → 100 pips
    // profit = 100 * (10/100000) * 20000 = 100 * 0.0001 * 20000 = 200
    const result = calculatePotentialProfit(
      new Decimal(20000),
      new Decimal('1.10000'),
      new Decimal('1.11000'),
      pair
    );
    expect(result.toNumber()).toBe(200);
  });

  it('calculates crypto profit correctly', () => {
    const pair = getPairBySymbol('BTCUSD')!;
    // 0.1 BTC, entry $50000, TP $55000 → profit = 0.1 * 5000 = 500
    const result = calculatePotentialProfit(
      new Decimal('0.1'),
      new Decimal(50000),
      new Decimal(55000),
      pair
    );
    expect(result.toNumber()).toBe(500);
  });
});

describe('calculatePosition (full integration)', () => {
  it('computes full EUR/USD long trade', () => {
    const pair = getPairBySymbol('EURUSD')!;
    const result = calculatePosition(
      10000,   // $10k account
      1,       // 1% risk
      1.1,     // entry
      1.095,   // SL (50 pips)
      1.11,    // TP (100 pips)
      pair
    );

    // Risk amount = $100
    expect(result.riskAmountUSD.toNumber()).toBe(100);
    // Pip distance = 50
    expect(result.pipDistance.toNumber()).toBe(50);
    // Position = 100 / (50 * 0.0001) = 20000 units
    expect(result.positionSizeUnits.toNumber()).toBe(20000);
    // Standard lots = 0.2
    expect(result.standardLots.toNumber()).toBe(0.2);
    // R:R = 2
    expect(result.rewardRiskRatio!.toNumber()).toBe(2);
    // Potential profit = $200
    expect(result.potentialProfit!.toNumber()).toBe(200);
    // Steps should be generated
    expect(result.steps.length).toBeGreaterThan(0);
  });

  it('computes full BTC/USD crypto trade', () => {
    const pair = getPairBySymbol('BTCUSD')!;
    const result = calculatePosition(
      10000,   // $10k account
      2,       // 2% risk
      50000,   // entry
      48000,   // SL ($2000 diff)
      54000,   // TP ($4000 diff)
      pair
    );

    // Risk amount = $200
    expect(result.riskAmountUSD.toNumber()).toBe(200);
    // Position = 200 / 2000 = 0.1 BTC
    expect(result.positionSizeUnits.toNumber()).toBe(0.1);
    // R:R = 4000/2000 = 2
    expect(result.rewardRiskRatio!.toNumber()).toBe(2);
    // Potential profit = 0.1 * 4000 = 400
    expect(result.potentialProfit!.toNumber()).toBe(400);
  });

  it('handles null take profit', () => {
    const pair = getPairBySymbol('EURUSD')!;
    const result = calculatePosition(10000, 1, 1.1, 1.095, null, pair);
    expect(result.rewardRiskRatio).toBeNull();
    expect(result.potentialProfit).toBeNull();
  });

  it('maintains decimal precision (no floating point drift)', () => {
    const pair = getPairBySymbol('EURUSD')!;
    // This would cause floating point issues with native JS numbers
    const result = calculatePosition(
      10000,
      0.1,        // 0.1% risk = $10
      1.12345,
      1.12295,    // 5 pips
      1.12395,    // 5 pips TP
      pair
    );

    // Risk = 10000 * 0.1 / 100 = 10
    expect(result.riskAmountUSD.toNumber()).toBe(10);
    // Pip distance should be exactly 5
    expect(result.pipDistance.toNumber()).toBe(5);
    // R:R should be exactly 1
    expect(result.rewardRiskRatio!.toNumber()).toBe(1);
  });
});
