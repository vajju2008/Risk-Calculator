'use client';

import React, { useState } from 'react';
import { CalculationStep } from '@/lib/calculations';

interface CalculationBreakdownProps {
  steps: CalculationStep[];
}

export default function CalculationBreakdown({
  steps,
}: CalculationBreakdownProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (steps.length === 0) return null;

  return (
    <div className="breakdown">
      <button
        className="breakdown-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="section-title">
          <span className="breakdown-icon">{isExpanded ? '▼' : '▶'}</span>
          Calculation Breakdown
        </h3>
        <span className="breakdown-count">{steps.length} steps</span>
      </button>

      {isExpanded && (
        <div className="breakdown-steps">
          {steps.map((step, index) => (
            <div key={index} className="breakdown-step">
              <div className="step-header">
                <span className="step-number">{index + 1}</span>
                <span className="step-label">{step.label}</span>
              </div>
              <div className="step-body">
                <div className="step-formula">
                  <code>{step.formula}</code>
                </div>
                <div className="step-result">
                  <span className="step-equals">=</span>
                  <span className="step-value">{step.result}</span>
                </div>
                <p className="step-explanation">{step.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
