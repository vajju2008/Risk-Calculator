import Decimal from 'decimal.js';
import { PairInfo } from './pairData';

// Configure Decimal.js for financial precision
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export interface CalculationResult {
  riskAmountUSD: Decimal;
  pipDistance: Decimal;
  pipValue: Decimal;
  positionSizeUnits: Decimal;
  standardLots: Decimal;
  miniLots: Decimal;
  microLots: Decimal;
  rewardRiskRatio: Decimal | null;
  potentialProfit: Decimal | null;
  potentialLoss: Decimal;
  steps: CalculationStep[];
}

export interface CalculationStep {
  label: string;
  formula: string;
  result: string;
  explanation: string;
}

/**
 * Calculate the dollar amount at risk per trade.
 */
export function calculateRiskAmount(
  accountSize: Decimal,
  riskPercent: Decimal
): Decimal {
  return accountSize.mul(riskPercent).div(100);
}

/**
 * Calculate the pip distance between entry and stop loss.
 */
export function calculatePipDistance(
  entryPrice: Decimal,
  stopLossPrice: Decimal,
  pipSize: Decimal
): Decimal {
  return entryPrice.minus(stopLossPrice).abs().div(pipSize);
}

/**
 * Calculate position size in units for a forex pair.
 */
export function calculateForexPositionSize(
  riskAmountUSD: Decimal,
  pipDistance: Decimal,
  pipValuePerLot: Decimal,
  contractSize: Decimal
): Decimal {
  if (pipDistance.isZero() || pipValuePerLot.isZero()) {
    return new Decimal(0);
  }
  // pipValuePerUnit = pipValuePerLot / contractSize
  const pipValuePerUnit = pipValuePerLot.div(contractSize);
  // positionSize = riskAmount / (pipDistance * pipValuePerUnit)
  return riskAmountUSD.div(pipDistance.mul(pipValuePerUnit));
}

/**
 * Calculate position size in units for a crypto pair.
 * For crypto: positionSize = riskAmount / |entry - stopLoss|
 */
export function calculateCryptoPositionSize(
  riskAmountUSD: Decimal,
  entryPrice: Decimal,
  stopLossPrice: Decimal
): Decimal {
  const priceDiff = entryPrice.minus(stopLossPrice).abs();
  if (priceDiff.isZero()) {
    return new Decimal(0);
  }
  return riskAmountUSD.div(priceDiff);
}

/**
 * Convert unit-based position to lot sizes.
 */
export function calculateLots(
  positionSizeUnits: Decimal,
  contractSize: Decimal
): { standard: Decimal; mini: Decimal; micro: Decimal } {
  const standard = positionSizeUnits.div(contractSize);
  const mini = positionSizeUnits.div(contractSize.div(10));
  const micro = positionSizeUnits.div(contractSize.div(100));
  return { standard, mini, micro };
}

/**
 * Calculate reward-to-risk ratio.
 */
export function calculateRewardRiskRatio(
  entryPrice: Decimal,
  stopLossPrice: Decimal,
  takeProfitPrice: Decimal
): Decimal {
  const risk = entryPrice.minus(stopLossPrice).abs();
  const reward = takeProfitPrice.minus(entryPrice).abs();
  if (risk.isZero()) return new Decimal(0);
  return reward.div(risk);
}

/**
 * Calculate potential profit in USD.
 */
export function calculatePotentialProfit(
  positionSizeUnits: Decimal,
  entryPrice: Decimal,
  takeProfitPrice: Decimal,
  pair: PairInfo
): Decimal {
  if (pair.type === 'crypto') {
    const priceDiff = takeProfitPrice.minus(entryPrice).abs();
    return positionSizeUnits.mul(priceDiff);
  }
  // Forex: profit = pipDistance * pipValuePerUnit * positionSize
  const pipDistance = takeProfitPrice
    .minus(entryPrice)
    .abs()
    .div(new Decimal(pair.pipSize));
  const pipValuePerUnit = new Decimal(pair.pipValuePerLot).div(
    new Decimal(pair.contractSize)
  );
  return pipDistance.mul(pipValuePerUnit).mul(positionSizeUnits);
}

/**
 * Full position calculation with step-by-step breakdown.
 */
export function calculatePosition(
  accountSize: number,
  riskPercent: number,
  entryPrice: number,
  stopLossPrice: number,
  takeProfitPrice: number | null,
  pair: PairInfo
): CalculationResult {
  const dAccountSize = new Decimal(accountSize);
  const dRiskPercent = new Decimal(riskPercent);
  const dEntryPrice = new Decimal(entryPrice);
  const dStopLossPrice = new Decimal(stopLossPrice);
  const dPipSize = new Decimal(pair.pipSize);
  const dPipValuePerLot = new Decimal(pair.pipValuePerLot);
  const dContractSize = new Decimal(pair.contractSize);

  const steps: CalculationStep[] = [];

  // Step 1: Risk amount
  const riskAmountUSD = calculateRiskAmount(dAccountSize, dRiskPercent);
  steps.push({
    label: 'Risk Amount',
    formula: `$${dAccountSize.toFixed(2)} × ${dRiskPercent.toFixed(2)}%`,
    result: `$${riskAmountUSD.toFixed(2)}`,
    explanation:
      'The dollar amount you are willing to lose on this trade if your stop loss is hit.',
  });

  // Step 2: Pip distance
  const pipDistance = calculatePipDistance(dEntryPrice, dStopLossPrice, dPipSize);
  steps.push({
    label: 'Pip Distance (Stop Loss)',
    formula: `|${dEntryPrice.toFixed(pair.decimalPlaces)} − ${dStopLossPrice.toFixed(
      pair.decimalPlaces
    )}| ÷ ${dPipSize.toFixed(pair.decimalPlaces)}`,
    result: `${pipDistance.toFixed(1)} pips`,
    explanation:
      'The number of pips between your entry price and stop loss price.',
  });

  // Step 3: Position size
  let positionSizeUnits: Decimal;
  if (pair.type === 'crypto') {
    positionSizeUnits = calculateCryptoPositionSize(
      riskAmountUSD,
      dEntryPrice,
      dStopLossPrice
    );
    steps.push({
      label: 'Position Size',
      formula: `$${riskAmountUSD.toFixed(2)} ÷ |${dEntryPrice.toFixed(
        pair.decimalPlaces
      )} − ${dStopLossPrice.toFixed(pair.decimalPlaces)}|`,
      result: `${positionSizeUnits.toFixed(6)} ${pair.baseCurrency}`,
      explanation: `The number of ${pair.baseCurrency} units to buy/sell to risk exactly $${riskAmountUSD.toFixed(2)}.`,
    });
  } else {
    positionSizeUnits = calculateForexPositionSize(
      riskAmountUSD,
      pipDistance,
      dPipValuePerLot,
      dContractSize
    );
    const pipValuePerUnit = dPipValuePerLot.div(dContractSize);
    steps.push({
      label: 'Pip Value per Unit',
      formula: `$${dPipValuePerLot.toFixed(2)} ÷ ${dContractSize.toFixed(0)}`,
      result: `$${pipValuePerUnit.toFixed(6)}`,
      explanation: 'The dollar value of one pip for one unit of the currency pair.',
    });
    steps.push({
      label: 'Position Size (Units)',
      formula: `$${riskAmountUSD.toFixed(2)} ÷ (${pipDistance.toFixed(
        1
      )} × $${pipValuePerUnit.toFixed(6)})`,
      result: `${positionSizeUnits.toFixed(0)} units`,
      explanation:
        'The number of units to trade to risk your specified dollar amount.',
    });
  }

  // Step 4: Lot sizes (forex only)
  let standardLots = new Decimal(0);
  let miniLots = new Decimal(0);
  let microLots = new Decimal(0);

  if (pair.type === 'forex' || pair.type === 'commodity') {
    const lots = calculateLots(positionSizeUnits, dContractSize);
    standardLots = lots.standard;
    miniLots = lots.mini;
    microLots = lots.micro;
    steps.push({
      label: 'Lot Sizes',
      formula: `${positionSizeUnits.toFixed(0)} units ÷ lot sizes`,
      result: `${standardLots.toFixed(2)} standard · ${miniLots.toFixed(
        2
      )} mini · ${microLots.toFixed(2)} micro`,
      explanation:
        pair.type === 'commodity'
          ? `Position size expressed in standard lots (${dContractSize.toFixed(0)} units), mini lots (${dContractSize.div(10).toFixed(0)} units), and micro lots (${dContractSize.div(100).toFixed(0)} units).`
          : 'Position size expressed in standard lots (100K), mini lots (10K), and micro lots (1K).',
    });
  }

  // Step 5: Potential loss
  const potentialLoss = riskAmountUSD;
  steps.push({
    label: 'Maximum Loss',
    formula: `Risk Amount`,
    result: `$${potentialLoss.toFixed(2)}`,
    explanation:
      'The maximum dollar loss if your stop loss is triggered (equals your risk amount).',
  });

  // Step 6: R:R ratio and potential profit
  let rewardRiskRatio: Decimal | null = null;
  let potentialProfit: Decimal | null = null;

  if (takeProfitPrice !== null) {
    const dTakeProfitPrice = new Decimal(takeProfitPrice);
    rewardRiskRatio = calculateRewardRiskRatio(
      dEntryPrice,
      dStopLossPrice,
      dTakeProfitPrice
    );
    potentialProfit = calculatePotentialProfit(
      positionSizeUnits,
      dEntryPrice,
      dTakeProfitPrice,
      pair
    );

    steps.push({
      label: 'Reward:Risk Ratio',
      formula: `|${dTakeProfitPrice.toFixed(
        pair.decimalPlaces
      )} − ${dEntryPrice.toFixed(
        pair.decimalPlaces
      )}| ÷ |${dEntryPrice.toFixed(
        pair.decimalPlaces
      )} − ${dStopLossPrice.toFixed(pair.decimalPlaces)}|`,
      result: `1:${rewardRiskRatio.toFixed(2)}`,
      explanation:
        'The ratio of potential reward to risk. A ratio above 1:2 is generally recommended.',
    });

    steps.push({
      label: 'Potential Profit',
      formula: `Position × Price Movement`,
      result: `$${potentialProfit.toFixed(2)}`,
      explanation:
        'The potential profit if your take profit target is reached.',
    });
  }

  return {
    riskAmountUSD,
    pipDistance,
    pipValue: pair.type === 'forex' || pair.type === 'commodity' ? dPipValuePerLot : dPipSize,
    positionSizeUnits,
    standardLots,
    miniLots,
    microLots,
    rewardRiskRatio,
    potentialProfit,
    potentialLoss,
    steps,
  };
}
