'use client';

import React from 'react';
import Decimal from 'decimal.js';

interface RewardRiskCalculatorProps {
  ratio: Decimal | null;
  potentialProfit: Decimal | null;
  potentialLoss: Decimal;
}

const SUGGESTED_RATIOS = [
  { value: 1.5, label: '1:1.5', description: 'Minimum viable' },
  { value: 2, label: '1:2', description: 'Recommended' },
  { value: 3, label: '1:3', description: 'Ideal target' },
];

export default function RewardRiskCalculator({
  ratio,
  potentialProfit,
  potentialLoss,
}: RewardRiskCalculatorProps) {
  const ratioNum = ratio ? ratio.toNumber() : 0;

  const getRatioColor = () => {
    if (ratioNum >= 3) return '#22c55e';
    if (ratioNum >= 2) return '#06b6d4';
    if (ratioNum >= 1.5) return '#eab308';
    if (ratioNum >= 1) return '#f97316';
    return '#ef4444';
  };

  const getRatioLabel = () => {
    if (ratioNum >= 3) return 'Excellent';
    if (ratioNum >= 2) return 'Good';
    if (ratioNum >= 1.5) return 'Acceptable';
    if (ratioNum >= 1) return 'Poor';
    return 'Unfavorable';
  };

  const barWidth = Math.min((ratioNum / 4) * 100, 100);
  const color = getRatioColor();

  return (
    <div className="rr-calculator">
      <h3 className="section-title">Reward : Risk Ratio</h3>

      {ratio !== null ? (
        <>
          <div className="rr-display">
            <div className="rr-main-value" style={{ color }}>
              1:{ratio.toFixed(2)}
            </div>
            <span className="rr-quality" style={{ color }}>
              {getRatioLabel()}
            </span>
          </div>

          <div className="rr-bar-container">
            <div className="rr-bar-track">
              <div
                className="rr-bar-fill"
                style={{ width: `${barWidth}%`, backgroundColor: color }}
              />
              {SUGGESTED_RATIOS.map((sr) => (
                <div
                  key={sr.value}
                  className="rr-bar-marker"
                  style={{ left: `${(sr.value / 4) * 100}%` }}
                >
                  <div className="rr-marker-line" />
                  <span className="rr-marker-label">{sr.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rr-pnl-row">
            <div className="rr-pnl-item rr-loss">
              <span className="rr-pnl-label">Potential Loss</span>
              <span className="rr-pnl-value">-${potentialLoss.toFixed(2)}</span>
            </div>
            {potentialProfit && (
              <div className="rr-pnl-item rr-profit">
                <span className="rr-pnl-label">Potential Profit</span>
                <span className="rr-pnl-value">
                  +${potentialProfit.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="rr-suggestions">
            <p className="rr-suggestion-title">Suggested Ratios</p>
            {SUGGESTED_RATIOS.map((sr) => (
              <div
                key={sr.value}
                className={`rr-suggestion-item ${
                  ratioNum >= sr.value ? 'rr-suggestion-met' : ''
                }`}
              >
                <span className="rr-suggestion-check">
                  {ratioNum >= sr.value ? '✓' : '○'}
                </span>
                <span className="rr-suggestion-ratio">{sr.label}</span>
                <span className="rr-suggestion-desc">{sr.description}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="rr-empty">
          <p>Enter a take profit price to see your reward:risk ratio</p>
        </div>
      )}
    </div>
  );
}
