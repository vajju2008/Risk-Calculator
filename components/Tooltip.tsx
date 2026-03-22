'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export default function Tooltip({ text, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<'top' | 'bottom'>('top');
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      if (rect.top < 80) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPosition('bottom');
      } else {
        setPosition('top');
      }
    }
  }, [isVisible]);

  return (
    <div
      className="tooltip-wrapper"
      ref={triggerRef}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <span className="tooltip-icon">ⓘ</span>
      {isVisible && (
        <div className={`tooltip-popup tooltip-${position}`}>
          <div className="tooltip-arrow" />
          <p>{text}</p>
        </div>
      )}
    </div>
  );
}
