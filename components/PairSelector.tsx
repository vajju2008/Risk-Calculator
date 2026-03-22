'use client';

import React from 'react';
import Tooltip from './Tooltip';
import { ALL_PAIRS, PairInfo } from '@/lib/pairData';

interface PairSelectorProps {
  selectedPairs: string[];
  onTogglePair: (symbol: string) => void;
  activePair: string;
  onSetActive: (symbol: string) => void;
}

export default function PairSelector({
  selectedPairs,
  onTogglePair,
  activePair,
  onSetActive,
}: PairSelectorProps) {
  const forexPairs = ALL_PAIRS.filter((p) => p.type === 'forex');
  const cryptoPairs = ALL_PAIRS.filter((p) => p.type === 'crypto');
  const commodityPairs = ALL_PAIRS.filter((p) => p.type === 'commodity');

  const renderPairButton = (pair: PairInfo) => {
    const isSelected = selectedPairs.includes(pair.symbol);
    const isActive = activePair === pair.symbol;

    return (
      <button
        key={pair.symbol}
        className={`pair-button ${isSelected ? 'pair-selected' : ''} ${
          isActive ? 'pair-active' : ''
        }`}
        onClick={() => {
          if (isSelected) {
            if (selectedPairs.length > 1 || !isSelected) {
              onTogglePair(pair.symbol);
            }
          } else {
            onTogglePair(pair.symbol);
          }
          if (isSelected) {
            onSetActive(pair.symbol);
          }
        }}
        title={`${pair.displayName} · Spread: ${pair.typicalSpread} pips · Pip: ${pair.pipSize}`}
      >
        <span className="pair-name">{pair.displayName}</span>
        {isSelected && (
          <span className="pair-check">✓</span>
        )}
      </button>
    );
  };

  return (
    <div className="input-group pair-selector">
      <Tooltip text="Select one or more pairs to calculate position sizes for. Click to toggle selection, then click again on selected pairs to switch the active calculation view.">
        <label>Trading Pairs</label>
      </Tooltip>

      <div className="pair-category">
        <h4 className="pair-category-label">
          <span className="category-dot forex-dot" />
          Forex
        </h4>
        <div className="pair-grid">
          {forexPairs.map(renderPairButton)}
        </div>
      </div>

      <div className="pair-category">
        <h4 className="pair-category-label">
          <span className="category-dot crypto-dot" />
          Crypto
        </h4>
        <div className="pair-grid">
          {cryptoPairs.map(renderPairButton)}
        </div>
      </div>

      <div className="pair-category">
        <h4 className="pair-category-label">
          <span className="category-dot commodity-dot" />
          Commodities
        </h4>
        <div className="pair-grid">
          {commodityPairs.map(renderPairButton)}
        </div>
      </div>

      {selectedPairs.length > 1 && (
        <p className="pair-helper">
          {selectedPairs.length} pairs selected · Click a selected pair to view its calculation
        </p>
      )}
    </div>
  );
}
