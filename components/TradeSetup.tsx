'use client';

import React from 'react';
import Tooltip from './Tooltip';
import { PairInfo } from '@/lib/pairData';
import { getTradeDirection } from '@/lib/validation';

interface TradeSetupProps {
  entryPrice: string;
  stopLossPrice: string;
  takeProfitPrice: string;
  onEntryChange: (value: string) => void;
  onStopLossChange: (value: string) => void;
  onTakeProfitChange: (value: string) => void;
  pair: PairInfo;
}

export default function TradeSetup({
  entryPrice,
  stopLossPrice,
  takeProfitPrice,
  onEntryChange,
  onStopLossChange,
  onTakeProfitChange,
  pair,
}: TradeSetupProps) {
  const entry = Number(entryPrice);
  const sl = Number(stopLossPrice);
  const tp = Number(takeProfitPrice);

  const hasValidPrices = entry > 0 && sl > 0 && entry !== sl;
  const direction = hasValidPrices ? getTradeDirection(entry, sl) : null;

  const pipDistance = hasValidPrices
    ? Math.abs(entry - sl) / pair.pipSize
    : 0;

  const tpPipDistance =
    hasValidPrices && tp > 0 ? Math.abs(tp - entry) / pair.pipSize : 0;

  return (
    <div className="input-group trade-setup">
      <div className="trade-setup-header">
        <h3 className="section-title">Trade Setup</h3>
        {direction && (
          <span className={`direction-badge direction-${direction}`}>
            {direction === 'long' ? '▲ LONG' : '▼ SHORT'}
          </span>
        )}
      </div>

      <div className="trade-inputs-grid">
        <div className="trade-input-item">
          <Tooltip text="The price at which you plan to enter the trade. This is your intended execution price.">
            <label htmlFor="entry-price">Entry Price</label>
          </Tooltip>
          <input
            id="entry-price"
            type="number"
            value={entryPrice}
            onChange={(e) => onEntryChange(e.target.value)}
            placeholder={pair.type === 'forex' ? '1.10000' : '50000.00'}
            step={pair.pipSize}
            className="input-field"
          />
        </div>

        <div className="trade-input-item">
          <Tooltip text="The price at which your trade will be automatically closed to limit losses. Place below entry for long trades, above for short trades.">
            <label htmlFor="stop-loss">Stop Loss Price</label>
          </Tooltip>
          <input
            id="stop-loss"
            type="number"
            value={stopLossPrice}
            onChange={(e) => onStopLossChange(e.target.value)}
            placeholder={pair.type === 'forex' ? '1.09500' : '48000.00'}
            step={pair.pipSize}
            className="input-field"
          />
          {pipDistance > 0 && (
            <div className="pip-distance">
              <span className="pip-label">SL Distance:</span>
              <span className="pip-value">{pipDistance.toFixed(1)} pips</span>
            </div>
          )}
        </div>

        <div className="trade-input-item">
          <Tooltip text="The price at which you plan to take profit. This is optional but recommended to calculate your reward-to-risk ratio.">
            <label htmlFor="take-profit">Take Profit Price <span className="optional-badge">Optional</span></label>
          </Tooltip>
          <input
            id="take-profit"
            type="number"
            value={takeProfitPrice}
            onChange={(e) => onTakeProfitChange(e.target.value)}
            placeholder={pair.type === 'forex' ? '1.11000' : '55000.00'}
            step={pair.pipSize}
            className="input-field"
          />
          {tpPipDistance > 0 && (
            <div className="pip-distance pip-profit">
              <span className="pip-label">TP Distance:</span>
              <span className="pip-value">{tpPipDistance.toFixed(1)} pips</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
