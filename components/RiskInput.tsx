'use client';

import React from 'react';
import Tooltip from './Tooltip';
import { assessRiskLevel } from '@/lib/validation';

interface RiskInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RiskInput({ value, onChange }: RiskInputProps) {
  const riskNum = Number(value) || 0;
  const assessment = assessRiskLevel(riskNum);
  const isBlocked = riskNum > 5;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || (!isNaN(Number(val)) && Number(val) >= 0)) {
      onChange(val);
    }
  };

  // Calculate slider fill percentage
  const fillPercent = Math.min((riskNum / 5) * 100, 100);

  return (
    <div className="input-group">
      <Tooltip text="The percentage of your account you are willing to risk on a single trade. Professional traders typically risk 1-2%. Never exceed 5%.">
        <label htmlFor="risk-percent">Risk Per Trade (%)</label>
      </Tooltip>

      <div className="risk-input-row">
        <input
          id="risk-percent"
          type="number"
          value={value}
          onChange={handleInputChange}
          placeholder="1.0"
          min="0.1"
          max="5"
          step="0.1"
          className={`input-field risk-input ${isBlocked ? 'input-error' : ''}`}
        />
        <span className="risk-percent-sign">%</span>
      </div>

      <div className="slider-container">
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={Math.min(riskNum || 0.1, 5)}
          onChange={handleSliderChange}
          className="risk-slider"
          style={
            {
              '--fill-percent': `${fillPercent}%`,
              '--fill-color': assessment.color,
            } as React.CSSProperties
          }
        />
        <div className="slider-labels">
          <span>0.1%</span>
          <span>1%</span>
          <span>2%</span>
          <span>3%</span>
          <span>5%</span>
        </div>
      </div>

      <div
        className="risk-badge"
        style={{ backgroundColor: `${assessment.color}20`, color: assessment.color, borderColor: `${assessment.color}40` }}
      >
        <span className="risk-dot" style={{ backgroundColor: assessment.color }} />
        <span className="risk-badge-label">{assessment.label}</span>
      </div>

      {riskNum > 0 && (
        <p className="risk-message" style={{ color: assessment.color }}>
          {assessment.message}
        </p>
      )}

      {isBlocked && (
        <div className="risk-warning-banner">
          <span className="warning-icon">⚠</span>
          <span>Risk cannot exceed 5%. This is a safety limit to protect your capital.</span>
        </div>
      )}
    </div>
  );
}
