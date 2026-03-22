'use client';

import React, { useState, useCallback, useMemo } from 'react';
import AccountInput from './AccountInput';
import RiskInput from './RiskInput';
import PairSelector from './PairSelector';
import TradeSetup from './TradeSetup';
import RewardRiskCalculator from './RewardRiskCalculator';
import CalculationBreakdown from './CalculationBreakdown';
import SummaryCard from './SummaryCard';
import { calculatePosition, CalculationResult } from '@/lib/calculations';
import { getPairBySymbol, PairInfo } from '@/lib/pairData';
import { validateTradeInputs } from '@/lib/validation';

interface PairTradeData {
  entryPrice: string;
  stopLossPrice: string;
  takeProfitPrice: string;
}

export default function Calculator() {
  // Account settings
  const [accountSize, setAccountSize] = useState('10000');
  const [riskPercent, setRiskPercent] = useState('1');

  // Pair selection
  const [selectedPairs, setSelectedPairs] = useState<string[]>(['EURUSD']);
  const [activePair, setActivePair] = useState('EURUSD');

  // Per-pair trade data
  const [pairTradeData, setPairTradeData] = useState<
    Record<string, PairTradeData>
  >({
    EURUSD: { entryPrice: '', stopLossPrice: '', takeProfitPrice: '' },
  });

  const handleTogglePair = useCallback(
    (symbol: string) => {
      setSelectedPairs((prev) => {
        if (prev.includes(symbol)) {
          if (prev.length <= 1) return prev; // Don't deselect the last pair
          const newPairs = prev.filter((p) => p !== symbol);
          if (activePair === symbol) {
            setActivePair(newPairs[0]);
          }
          return newPairs;
        } else {
          // Add pair and initialize trade data
          setPairTradeData((prevData) => ({
            ...prevData,
            [symbol]: prevData[symbol] || {
              entryPrice: '',
              stopLossPrice: '',
              takeProfitPrice: '',
            },
          }));
          setActivePair(symbol);
          return [...prev, symbol];
        }
      });
    },
    [activePair]
  );

  const handleSetActive = useCallback((symbol: string) => {
    setActivePair(symbol);
  }, []);

  const updateTradeData = useCallback(
    (field: keyof PairTradeData, value: string) => {
      setPairTradeData((prev) => ({
        ...prev,
        [activePair]: {
          ...prev[activePair],
          [field]: value,
        },
      }));
    },
    [activePair]
  );

  // Get active pair info
  const activePairInfo = useMemo(
    () => getPairBySymbol(activePair),
    [activePair]
  );
  const activeTradeData = pairTradeData[activePair] || {
    entryPrice: '',
    stopLossPrice: '',
    takeProfitPrice: '',
  };

  // Validate inputs
  const validation = useMemo(
    () =>
      validateTradeInputs(
        accountSize,
        riskPercent,
        activeTradeData.entryPrice,
        activeTradeData.stopLossPrice,
        activeTradeData.takeProfitPrice || null
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountSize, riskPercent, activeTradeData]
  );

  // Calculate results
  const result: CalculationResult | null = useMemo(() => {
    if (!validation.isValid || !activePairInfo) return null;

    const entry = Number(activeTradeData.entryPrice);
    const sl = Number(activeTradeData.stopLossPrice);
    const tp = activeTradeData.takeProfitPrice
      ? Number(activeTradeData.takeProfitPrice)
      : null;

    if (entry <= 0 || sl <= 0 || entry === sl) return null;

    try {
      return calculatePosition(
        Number(accountSize),
        Number(riskPercent),
        entry,
        sl,
        tp,
        activePairInfo
      );
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountSize, riskPercent, activeTradeData, activePairInfo, validation]);

  // Calculate results for all selected pairs (for multi-pair summary)
  const allResults = useMemo(() => {
    const results: { pair: PairInfo; result: CalculationResult }[] = [];
    for (const symbol of selectedPairs) {
      const pair = getPairBySymbol(symbol);
      const tradeData = pairTradeData[symbol];
      if (!pair || !tradeData) continue;

      const entry = Number(tradeData.entryPrice);
      const sl = Number(tradeData.stopLossPrice);
      const tp = tradeData.takeProfitPrice
        ? Number(tradeData.takeProfitPrice)
        : null;

      if (entry <= 0 || sl <= 0 || entry === sl) continue;

      const v = validateTradeInputs(
        accountSize,
        riskPercent,
        tradeData.entryPrice,
        tradeData.stopLossPrice,
        tradeData.takeProfitPrice || null
      );
      if (!v.isValid) continue;

      try {
        const r = calculatePosition(
          Number(accountSize),
          Number(riskPercent),
          entry,
          sl,
          tp,
          pair
        );
        results.push({ pair, result: r });
      } catch {
        // skip invalid
      }
    }
    return results;
  }, [selectedPairs, pairTradeData, accountSize, riskPercent]);

  return (
    <div className="calculator">
      <header className="calculator-header">
        <div className="header-glow" />
        <h1 className="calculator-title">
          <span className="title-icon">◈</span>
          Position Size Calculator
        </h1>
        <p className="calculator-subtitle">
          Precision risk management for Forex, Crypto &amp; Commodities trading
        </p>
      </header>

      <div className="calculator-layout">
        {/* Left Panel: Inputs */}
        <div className="calculator-panel inputs-panel">
          <div className="panel-section">
            <h2 className="panel-title">Account Settings</h2>
            <AccountInput
              value={accountSize}
              onChange={setAccountSize}
              riskPercent={Number(riskPercent) || 0}
            />
            <RiskInput value={riskPercent} onChange={setRiskPercent} />
          </div>

          <div className="panel-section">
            <PairSelector
              selectedPairs={selectedPairs}
              onTogglePair={handleTogglePair}
              activePair={activePair}
              onSetActive={handleSetActive}
            />
          </div>

          {activePairInfo && (
            <div className="panel-section">
              <TradeSetup
                entryPrice={activeTradeData.entryPrice}
                stopLossPrice={activeTradeData.stopLossPrice}
                takeProfitPrice={activeTradeData.takeProfitPrice}
                onEntryChange={(v) => updateTradeData('entryPrice', v)}
                onStopLossChange={(v) => updateTradeData('stopLossPrice', v)}
                onTakeProfitChange={(v) => updateTradeData('takeProfitPrice', v)}
                pair={activePairInfo}
              />
            </div>
          )}

          {/* Validation Messages */}
          {(validation.errors.length > 0 || validation.warnings.length > 0) && (
            <div className="validation-messages">
              {validation.errors.map((err, i) => (
                <div key={`err-${i}`} className="validation-error">
                  <span className="validation-icon">✕</span>
                  {err}
                </div>
              ))}
              {validation.warnings.map((warn, i) => (
                <div key={`warn-${i}`} className="validation-warning">
                  <span className="validation-icon">⚠</span>
                  {warn}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel: Results */}
        <div className="calculator-panel results-panel">
          {result && activePairInfo ? (
            <>
              <SummaryCard
                result={result}
                pair={activePairInfo}
                accountSize={Number(accountSize)}
                riskPercent={Number(riskPercent)}
                entryPrice={Number(activeTradeData.entryPrice)}
                stopLossPrice={Number(activeTradeData.stopLossPrice)}
              />

              <RewardRiskCalculator
                ratio={result.rewardRiskRatio}
                potentialProfit={result.potentialProfit}
                potentialLoss={result.potentialLoss}
              />

              <CalculationBreakdown steps={result.steps} />

              {/* Multi-pair summary */}
              {allResults.length > 1 && (
                <div className="multi-pair-summary">
                  <h3 className="section-title">All Positions Summary</h3>
                  <div className="multi-pair-grid">
                    {allResults.map(({ pair, result: r }) => (
                      <div
                        key={pair.symbol}
                        className={`multi-pair-item ${
                          pair.symbol === activePair ? 'multi-pair-active' : ''
                        }`}
                        onClick={() => setActivePair(pair.symbol)}
                      >
                        <span className="multi-pair-name">
                          {pair.displayName}
                        </span>
                        <span className="multi-pair-size">
                          {pair.type === 'crypto'
                            ? `${r.positionSizeUnits.toFixed(4)} ${pair.baseCurrency}`
                            : `${r.standardLots.toFixed(2)} lots`}
                        </span>
                        <span className="multi-pair-risk">
                          -${r.potentialLoss.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="multi-pair-total">
                    <span>Total Risk Exposure:</span>
                    <span className="total-risk-value">
                      -$
                      {allResults
                        .reduce(
                          (sum, { result: r }) => sum + r.potentialLoss.toNumber(),
                          0
                        )
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-results">
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <rect x="8" y="12" width="48" height="40" rx="4" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                  <line x1="16" y1="24" x2="48" y2="24" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                  <line x1="16" y1="32" x2="40" y2="32" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                  <line x1="16" y1="40" x2="44" y2="40" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                  <circle cx="50" cy="46" r="12" fill="#06b6d4" opacity="0.15" />
                  <text x="46" y="51" fontSize="14" fill="#06b6d4" fontWeight="bold">$</text>
                </svg>
              </div>
              <h3>Enter Trade Details</h3>
              <p>
                Set your account size, risk percentage, and trade prices to
                calculate your optimal position size.
              </p>
              <div className="empty-checklist">
                <div className={`checklist-item ${Number(accountSize) > 0 ? 'checked' : ''}`}>
                  <span className="check-icon">{Number(accountSize) > 0 ? '✓' : '○'}</span>
                  Account size
                </div>
                <div className={`checklist-item ${Number(riskPercent) > 0 && Number(riskPercent) <= 5 ? 'checked' : ''}`}>
                  <span className="check-icon">{Number(riskPercent) > 0 && Number(riskPercent) <= 5 ? '✓' : '○'}</span>
                  Risk percentage
                </div>
                <div className={`checklist-item ${Number(activeTradeData.entryPrice) > 0 ? 'checked' : ''}`}>
                  <span className="check-icon">{Number(activeTradeData.entryPrice) > 0 ? '✓' : '○'}</span>
                  Entry price
                </div>
                <div className={`checklist-item ${Number(activeTradeData.stopLossPrice) > 0 ? 'checked' : ''}`}>
                  <span className="check-icon">{Number(activeTradeData.stopLossPrice) > 0 ? '✓' : '○'}</span>
                  Stop loss price
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
