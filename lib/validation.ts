export type RiskLevel = 'safe' | 'moderate' | 'high' | 'dangerous' | 'blocked';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RiskAssessment {
  level: RiskLevel;
  color: string;
  label: string;
  message: string;
}

/**
 * Assess the risk level based on the percentage.
 */
export function assessRiskLevel(riskPercent: number): RiskAssessment {
  if (riskPercent > 5) {
    return {
      level: 'blocked',
      color: '#ef4444',
      label: 'BLOCKED',
      message: 'Risk cannot exceed 5% per trade. This is a fundamental risk management rule.',
    };
  }
  if (riskPercent > 3) {
    return {
      level: 'dangerous',
      color: '#ef4444',
      label: 'DANGEROUS',
      message: 'Risk above 3% is extremely aggressive. You could be wiped out in a short losing streak.',
    };
  }
  if (riskPercent > 2) {
    return {
      level: 'high',
      color: '#f97316',
      label: 'HIGH RISK',
      message: 'Risk above 2% is considered aggressive by most professional traders.',
    };
  }
  if (riskPercent > 1) {
    return {
      level: 'moderate',
      color: '#eab308',
      label: 'MODERATE',
      message: 'This risk level is acceptable but on the higher side. Professional traders typically risk 1-2%.',
    };
  }
  return {
    level: 'safe',
    color: '#22c55e',
    label: 'CONSERVATIVE',
    message: 'This is a conservative risk level. Good for preserving capital during learning.',
  };
}

/**
 * Validate all trade inputs before calculation.
 */
export function validateTradeInputs(
  accountSize: number | string,
  riskPercent: number | string,
  entryPrice: number | string,
  stopLossPrice: number | string,
  takeProfitPrice: number | string | null
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Account size
  const account = Number(accountSize);
  if (isNaN(account) || account <= 0) {
    errors.push('Account size must be a positive number.');
  } else if (account < 100) {
    warnings.push('Account size is very small. Position sizing may not be practical.');
  }

  // Risk percent
  const risk = Number(riskPercent);
  if (isNaN(risk) || risk <= 0) {
    errors.push('Risk percentage must be a positive number.');
  } else if (risk > 5) {
    errors.push('Risk percentage cannot exceed 5%. This is a safety limit.');
  } else if (risk > 3) {
    warnings.push('Risk above 3% is extremely aggressive and not recommended.');
  } else if (risk > 2) {
    warnings.push('Risk above 2% is considered high by professional standards.');
  }

  // Entry price
  const entry = Number(entryPrice);
  if (isNaN(entry) || entry <= 0) {
    errors.push('Entry price must be a positive number.');
  }

  // Stop loss
  const sl = Number(stopLossPrice);
  if (isNaN(sl) || sl <= 0) {
    errors.push('Stop loss price must be a positive number.');
  }

  // Entry and SL cannot be equal
  if (!isNaN(entry) && !isNaN(sl) && entry === sl) {
    errors.push('Entry price and stop loss cannot be the same.');
  }

  // Take profit (optional)
  if (takeProfitPrice !== null && takeProfitPrice !== '') {
    const tp = Number(takeProfitPrice);
    if (isNaN(tp) || tp <= 0) {
      errors.push('Take profit price must be a positive number.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Determine trade direction from entry and stop loss.
 */
export function getTradeDirection(
  entryPrice: number,
  stopLossPrice: number
): 'long' | 'short' {
  return entryPrice > stopLossPrice ? 'long' : 'short';
}
