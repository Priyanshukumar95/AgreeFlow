import React, { useState } from 'react';
import { WORKSPACES } from '../sampleData';

interface HeaderProps {
  currentWorkspace: string;
  onSelectWorkspace: (workspace: string) => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentWorkspace,
  onSelectWorkspace,
  onOpenHelp,
}) => {
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-[#f8f9ff]/85 backdrop-blur-xl border-b border-[#c7c4d8]/40 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="h-16 px-4 sm:px-6 max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3525cd] to-[#4f46e5] flex items-center justify-center shadow-sm relative overflow-hidden">
            <span className="material-symbols-outlined text-white text-[20px] font-bold">
              check
            </span>
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#38bdf8]"></span>
            <span className="absolute bottom-1 left-1.5 w-1.5 h-1.5 rounded-full bg-[#34d399]"></span>
          </div>
          <span className="font-semibold text-[17px] text-[#0b1c30] tracking-tight">
            AgreeFlow
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#dae2fd] text-[#131b2e] font-semibold text-[11px] tracking-wide">
            BETA
          </span>
        </div>

        {/* Workspace & Action items */}
        <div className="flex items-center gap-2">
          {/* Workspace selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              className="h-9 px-2.5 rounded-lg bg-[#eff4ff] text-[#0b1c30] text-[13px] font-medium flex items-center gap-1.5 hover:bg-[#e5eeff] transition-colors border border-[#c7c4d8]/50"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-[#565e74]">
                folder
              </span>
              <span className="max-w-[95px] truncate font-medium">
                {currentWorkspace}
              </span>
              <span className="material-symbols-outlined text-[16px] text-[#565e74]">
                unfold_more
              </span>
            </button>

            {workspaceMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white shadow-xl border border-[#c7c4d8]/60 p-1.5 z-50 flex flex-col gap-0.5">
                <div className="px-2 py-1 text-[11px] font-semibold text-[#565e74] uppercase tracking-wider">
                  Select Workspace
                </div>
                {WORKSPACES.map((ws) => (
                  <button
                    key={ws}
                    onClick={() => {
                      onSelectWorkspace(ws);
                      setWorkspaceMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[13px] flex items-center justify-between transition-colors ${
                      currentWorkspace === ws
                        ? 'bg-[#e2dfff] text-[#0f0069] font-semibold'
                        : 'text-[#0b1c30] hover:bg-[#eff4ff]'
                    }`}
                  >
                    <span className="truncate">{ws}</span>
                    {currentWorkspace === ws && (
                      <span className="material-symbols-outlined text-[15px]">
                        check
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            aria-label="Extraction Rules & Help"
            title="Extraction Rules & Schema"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#565e74] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              help_outline
            </span>
          </button>

          {/* User Profile Avatar */}
          <div
            className="w-8 h-8 rounded-full bg-[#3525cd] flex items-center justify-center text-white shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
            title="Logged in as Workspace Lead"
          >
            <span className="material-symbols-outlined text-[18px]">
              person
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
