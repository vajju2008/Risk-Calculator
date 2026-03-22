'use client';

import React from 'react';
import { CalculationResult } from '@/lib/calculations';
import { PairInfo } from '@/lib/pairData';
import { assessRiskLevel, getTradeDirection } from '@/lib/validation';

interface SummaryCardProps {
  result: CalculationResult;
  pair: PairInfo;
  accountSize: number;
  riskPercent: number;
  entryPrice: number;
  stopLossPrice: number;
}

export default function SummaryCard({
  result,
  pair,
  accountSize,
  riskPercent,
  entryPrice,
  stopLossPrice,
}: SummaryCardProps) {
  const riskAssessment = assessRiskLevel(riskPercent);
  const direction = getTradeDirection(entryPrice, stopLossPrice);
  const riskOfAccount = result.riskAmountUSD.div(accountSize).mul(100);

  return (
    <div className="summary-card">
      <div className="summary-header">
        <div className="summary-pair">
          <span className={`pair-type-badge ${pair.type}`}>{pair.type.toUpperCase()}</span>
          <h3>{pair.displayName}</h3>
          <span className={`direction-badge direction-${direction}`}>
            {direction === 'long' ? '▲ LONG' : '▼ SHORT'}
          </span>
        </div>
        <div
          className="summary-risk-indicator"
          style={{ borderColor: riskAssessment.color }}
        >
          <span className="risk-indicator-value" style={{ color: riskAssessment.color }}>
            {riskPercent}%
          </span>
          <span className="risk-indicator-label">Risk</span>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-item summary-primary">
          <span className="summary-label">Risk Per Trade</span>
          <span className="summary-value">
            ${result.riskAmountUSD.toFixed(2)}
          </span>
          <span className="summary-sub">
            {riskOfAccount.toFixed(2)}% of ${accountSize.toLocaleString()}
          </span>
        </div>

        <div className="summary-item">
          <span className="summary-label">Position Size</span>
          <span className="summary-value">
            {pair.type === 'crypto'
              ? `${result.positionSizeUnits.toFixed(6)} ${pair.baseCurrency}`
              : `${result.positionSizeUnits.toFixed(0)} units`}
          </span>
          {(pair.type === 'forex' || pair.type === 'commodity') && (
            <span className="summary-sub">
              {result.standardLots.toFixed(2)} standard lots
            </span>
          )}
        </div>

        {(pair.type === 'forex' || pair.type === 'commodity') && (
          <div className="summary-item">
            <span className="summary-label">Lot Breakdown</span>
            <div className="lot-breakdown">
              <div className="lot-item">
                <span className="lot-type">Standard</span>
                <span className="lot-value">{result.standardLots.toFixed(2)}</span>
              </div>
              <div className="lot-item">
                <span className="lot-type">Mini</span>
                <span className="lot-value">{result.miniLots.toFixed(2)}</span>
              </div>
              <div className="lot-item">
                <span className="lot-type">Micro</span>
                <span className="lot-value">{result.microLots.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="summary-item">
          <span className="summary-label">Stop Loss Distance</span>
          <span className="summary-value">
            {result.pipDistance.toFixed(1)} pips
          </span>
        </div>

        {result.rewardRiskRatio !== null && (
          <div className="summary-item">
            <span className="summary-label">Reward:Risk</span>
            <span className="summary-value rr-color" style={{
              color: result.rewardRiskRatio.toNumber() >= 2
                ? '#22c55e'
                : result.rewardRiskRatio.toNumber() >= 1
                ? '#eab308'
                : '#ef4444',
            }}>
              1:{result.rewardRiskRatio.toFixed(2)}
            </span>
          </div>
        )}

        <div className="summary-item">
          <span className="summary-label">Max Loss</span>
          <span className="summary-value summary-loss">
            -${result.potentialLoss.toFixed(2)}
          </span>
        </div>

        {result.potentialProfit && (
          <div className="summary-item">
            <span className="summary-label">Target Profit</span>
            <span className="summary-value summary-profit">
              +${result.potentialProfit.toFixed(2)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
