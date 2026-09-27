import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 shadow-2xl border border-[#c7c4d8]/40 flex flex-col gap-4 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-[#eff4ff] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#e2dfff] flex items-center justify-center text-[#3525cd]">
              <span className="material-symbols-outlined text-[20px]">
                auto_awesome
              </span>
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[#0b1c30]">
                How AgreeFlow Extracts Notes
              </h3>
              <p className="text-[12px] text-[#565e74]">
                Strict 4-category classification schema & rules
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#eff4ff] flex items-center justify-center text-[#565e74]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="space-y-3 text-[13px] text-[#0b1c30]">
          <div className="p-3 rounded-xl bg-[#ecfdf5] border border-emerald-200">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
              1. DECISIONS
            </div>
            <p className="text-emerald-900 mt-1 text-[12px]">
              Things the team explicitly agreed on or confirmed (e.g. <em>"We will use React"</em>, <em>"We agreed to submit prototype Friday"</em>).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#fffbeb] border border-amber-200">
            <div className="font-bold text-amber-950 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
              2. SUGGESTIONS
            </div>
            <p className="text-amber-900 mt-1 text-[12px]">
              Ideas proposed but NOT confirmed as final (e.g. <em>"We could add a chatbot"</em>, <em>"Maybe we should use React"</em> without confirmation).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#f5f3ff] border border-purple-200">
            <div className="font-bold text-purple-950 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8b5cf6]"></span>
              3. OPEN QUESTIONS
            </div>
            <p className="text-purple-900 mt-1 text-[12px]">
              Things left unresolved that still need an answer (e.g. <em>"Should we deploy on Vercel or AWS?"</em>).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#eff6ff] border border-blue-200">
            <div className="font-bold text-blue-950 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3525cd]"></span>
              4. ACTION ITEMS
            </div>
            <p className="text-blue-900 mt-1 text-[12px]">
              Concrete tasks with <code>task</code>, <code>owner</code>, <code>deadline</code>, and <code>source_sentence</code>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#dae2fd]">
            <h4 className="font-bold text-[#0b1c30] text-[12px] uppercase tracking-wide">
              Critical Extraction Rules
            </h4>
            <ul className="list-disc pl-4 mt-1.5 space-y-1 text-[12px] text-[#565e74]">
              <li>Never infer or fabricate owners or deadlines; missing fields are flagged as null.</li>
              <li>Every item includes a verbatim unmodified <code>source_sentence</code> for auditability.</li>
              <li>Ambiguous statements default to <strong>SUGGESTION</strong> unless confirmed.</li>
            </ul>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-10 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white text-[13px] font-semibold transition-colors shadow-sm"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
