'use client';

import React from 'react';
import Tooltip from './Tooltip';

interface AccountInputProps {
  value: string;
  onChange: (value: string) => void;
  riskPercent: number;
}

export default function AccountInput({
  value,
  onChange,
  riskPercent,
}: AccountInputProps) {
  const accountNum = Number(value) || 0;
  const riskAmount = accountNum * (riskPercent / 100);

  return (
    <div className="input-group">
      <Tooltip text="Your total trading account balance in US Dollars. This is used to calculate how much money you're risking on each trade.">
        <label htmlFor="account-size">Account Size (USD)</label>
      </Tooltip>
      <div className="input-with-prefix">
        <span className="input-prefix">$</span>
        <input
          id="account-size"
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="10,000"
          min="0"
          step="100"
          className="input-field"
        />
      </div>
      {accountNum > 0 && riskPercent > 0 && (
        <div className="input-helper">
          Risk per trade: <strong>${riskAmount.toFixed(2)}</strong>
        </div>
      )}
    </div>
  );
}
