import React from 'react';
import { ScreenType } from '../types';

interface NavigationProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  actionItemsCount?: number;
  hasUnsavedNotes?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentScreen,
  onNavigate,
  actionItemsCount = 4,
}) => {
  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-[#f8f9ff]/90 backdrop-blur-xl border-t border-[#c7c4d8]/40 shadow-[0_-1px_10px_rgba(0,0,0,0.03)]">
      <div className="h-16 max-w-md mx-auto px-4 flex items-center justify-around">
        {/* Stage 1: Paste Notes */}
        <button
          onClick={() => onNavigate('paste')}
          aria-current={currentScreen === 'paste' ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] transition-all ${
            currentScreen === 'paste'
              ? 'text-[#3525cd] font-semibold scale-105'
              : 'text-[#565e74] hover:text-[#0b1c30]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{
              fontVariationSettings: currentScreen === 'paste' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            edit_note
          </span>
          <span className="text-[11px] mt-0.5 tracking-tight font-medium">
            1. Paste Notes
          </span>
        </button>

        {/* Stage 2: AI Analysis */}
        <button
          onClick={() => onNavigate('analysis')}
          aria-current={currentScreen === 'analysis' ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] transition-all ${
            currentScreen === 'analysis'
              ? 'text-[#3525cd] font-semibold scale-105'
              : 'text-[#565e74] hover:text-[#0b1c30]'
          }`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{
              fontVariationSettings: currentScreen === 'analysis' ? "'FILL' 1" : "'FILL' 0",
            }}
          >
            auto_awesome
          </span>
          <span className="text-[11px] mt-0.5 tracking-tight font-medium">
            2. AI Analysis
          </span>
        </button>

        {/* Stage 3: Action Plan */}
        <button
          onClick={() => onNavigate('action-plan')}
          aria-current={currentScreen === 'action-plan' ? 'page' : undefined}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] transition-all relative ${
            currentScreen === 'action-plan'
              ? 'text-[#3525cd] font-semibold scale-105'
              : 'text-[#565e74] hover:text-[#0b1c30]'
          }`}
        >
          <div className="relative">
            <span
              className="material-symbols-outlined text-[20px]"
              style={{
                fontVariationSettings: currentScreen === 'action-plan' ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              fact_check
            </span>
            {actionItemsCount > 0 && (
              <span className="absolute -top-1 -right-2.5 px-1 py-0.2 rounded-full bg-[#3525cd] text-white text-[9px] font-bold leading-none">
                {actionItemsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight font-medium">
            3. Action Plan
          </span>
        </button>
      </div>
    </nav>
  );
};
