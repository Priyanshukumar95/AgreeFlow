import React, { useState, useRef, useEffect } from 'react';
import { INITIAL_SAMPLE_NOTES } from '../sampleData';

interface PasteNotesScreenProps {
  rawNotes: string;
  setRawNotes: (notes: string) => void;
  onAnalyze: (notes: string) => Promise<void>;
  isLoading: boolean;
  onNavigateToAnalysis: () => void;
}

export const PasteNotesScreen: React.FC<PasteNotesScreenProps> = ({
  rawNotes,
  setRawNotes,
  onAnalyze,
  isLoading,
  onNavigateToAnalysis,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charLength = rawNotes.length;

  const handleSampleNotes = () => {
    setRawNotes(INITIAL_SAMPLE_NOTES);
    setErrorMsg(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleClear = () => {
    setRawNotes('');
    setErrorMsg(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const appendSnippet = (tag: string) => {
    const prefix = rawNotes.trim().length > 0 ? '\n\n' : '';
    setRawNotes(rawNotes + `${prefix}### ${tag}\n- `);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size < 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const header = `[Imported transcript: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]\n\n`;
        setRawNotes(header + text);
        setErrorMsg(null);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file contents.');
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    const notesToProcess = rawNotes.trim() ? rawNotes : INITIAL_SAMPLE_NOTES;
    if (!rawNotes.trim()) {
      setRawNotes(INITIAL_SAMPLE_NOTES);
    }
    setErrorMsg(null);
    try {
      await onAnalyze(notesToProcess);
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis failed. Please try again.');
    }
  };

  // Shortcut Cmd+Enter / Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (!isLoading) {
          handleSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rawNotes, isLoading]);

  return (
    <div className="flex flex-col w-full pb-28 max-w-xl mx-auto px-4 pt-3">
      {/* Interactive Ambient Header Banner */}
      <div className="flex flex-col items-center text-center pt-2">
        {/* Top Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2dfff] text-[#0f0069] text-[12px] font-semibold shadow-xs transition-all hover:scale-105 active:scale-95 cursor-default">
          <span
            className="material-symbols-outlined text-[15px] text-[#3525cd]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <span>AI Meeting Intelligence</span>
        </div>

        {/* Main Display Title */}
        <h1 className="mt-3 text-[24px] sm:text-[28px] font-bold text-[#0b1c30] tracking-tight leading-tight max-w-[360px]">
          Turn messy meeting notes into clear actions
        </h1>

        {/* Subtitle description */}
        <p className="mt-2 text-[13px] text-[#565e74] max-w-[340px] leading-relaxed">
          Drop raw notes, transcripts, or chaotic bullet points. AgreeFlow detects decisions, tasks, and gaps automatically.
        </p>
      </div>

      {/* Primary Workspace Input Card */}
      <div className="mt-5 w-full bg-white rounded-2xl shadow-sm border border-[#c7c4d8]/50 p-4 flex flex-col transition-all">
        {/* Toolbar Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#eff4ff]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSampleNotes}
              type="button"
              className="h-8 px-2.5 rounded-lg bg-[#eff4ff] text-[#3525cd] hover:bg-[#e5eeff] text-[13px] font-medium flex items-center gap-1.5 transition-colors active:scale-95 border border-[#dae2fd]"
            >
              <span className="material-symbols-outlined text-[16px]">
                magic_button
              </span>
              <span>Sample Notes</span>
            </button>
            <button
              onClick={handleClear}
              type="button"
              className="h-8 px-2 rounded-lg text-[#565e74] hover:text-[#0b1c30] hover:bg-[#eff4ff] text-[13px] font-medium flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">
                clear_all
              </span>
              <span>Clear</span>
            </button>
          </div>

          {/* Character Count */}
          <div className="flex items-center gap-1 text-[#565e74] font-mono text-[12px]">
            <span
              className={`font-semibold ${
                charLength > 7000 ? 'text-[#ba1a1a]' : 'text-[#464555]'
              }`}
            >
              {charLength.toLocaleString()}
            </span>
            <span className="text-[#565e74]/60">/ 8,000</span>
          </div>
        </div>

        {/* Main Input Textarea Area */}
        <div className="relative w-full mt-3 rounded-xl bg-[#eff4ff]/60 p-3 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-[#4f46e5]/20 focus-within:border-[#4f46e5]/40 border border-transparent">
          <textarea
            ref={textareaRef}
            value={rawNotes}
            onChange={(e) => setRawNotes(e.target.value)}
            maxLength={8000}
            rows={7}
            placeholder={`Paste your meeting notes here…\n\ne.g. "Dave agreed to ship the Stripe billing migration by next Friday. Sarah asked if we have legal sign-off on terms? Let's also look into QA automation."`}
            className="w-full bg-transparent resize-none outline-none text-[14px] text-[#0b1c30] placeholder:text-[#565e74]/50 leading-relaxed min-h-[148px]"
          />

          {/* Quick Tag Suggestion Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 no-scrollbar border-t border-[#dae2fd]/40">
            <button
              type="button"
              onClick={() => appendSnippet('Sprint Retro Key Agreements')}
              className="shrink-0 px-2 py-1 rounded-md bg-[#e5eeff] text-[#464555] text-[11px] font-medium hover:bg-[#e2dfff] hover:text-[#3525cd] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[13px]">add</span>
              Sprint Retro
            </button>
            <button
              type="button"
              onClick={() => appendSnippet('Roadmap & Launch Sync')}
              className="shrink-0 px-2 py-1 rounded-md bg-[#e5eeff] text-[#464555] text-[11px] font-medium hover:bg-[#e2dfff] hover:text-[#3525cd] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[13px]">add</span>
              Roadmap Call
            </button>
            <button
              type="button"
              onClick={() => appendSnippet('Architectural & Backend Sync')}
              className="shrink-0 px-2 py-1 rounded-md bg-[#e5eeff] text-[#464555] text-[11px] font-medium hover:bg-[#e2dfff] hover:text-[#3525cd] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[13px]">add</span>
              Arch Sync
            </button>
          </div>
        </div>

        {/* File Attachment Bar */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <label className="min-h-[44px] px-3 rounded-xl bg-[#f8f9ff] hover:bg-[#eff4ff] active:bg-[#e5eeff] flex items-center gap-2.5 cursor-pointer transition-colors flex-1 border border-[#c7c4d8]/40">
            <span className="material-symbols-outlined text-[20px] text-[#3525cd]">
              attach_file
            </span>
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-medium text-[#0b1c30]">
                Upload transcript or audio
              </span>
              <span className="text-[11px] text-[#565e74]">
                .txt, .md, .docx, .vtt
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.docx,.vtt,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <span className="shrink-0 text-[11px] px-2.5 py-1.5 rounded-lg bg-[#eff4ff] text-[#565e74] font-medium border border-[#dae2fd]/50">
            Max 10MB
          </span>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-xl bg-[#ffdad6] text-[#93000a] text-[13px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button Area */}
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full min-h-[48px] px-4 rounded-xl bg-[#4f46e5] hover:bg-[#3525cd] text-white font-semibold text-[15px] shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-75 disabled:pointer-events-none"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span>{isLoading ? 'Analyzing Notes...' : 'Analyze Meeting'}</span>
              <span
                className={`material-symbols-outlined text-[20px] ${isLoading ? 'animate-spin' : ''}`}
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {isLoading ? 'progress_activity' : 'auto_awesome'}
              </span>
            </span>
            <span className="relative z-10 hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-white/20 text-white text-[11px] font-mono ml-2 tracking-wider">
              ⌘ + ↵
            </span>
            {/* Sheen effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
          </button>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-1 text-center text-[13px] text-[#3525cd] font-medium">
              <span className="material-symbols-outlined text-[16px] animate-spin">
                progress_activity
              </span>
              <span>Parsing conversational logic, decisions & assignees...</span>
            </div>
          )}
        </div>
      </div>

      {/* Real-Time Visual Value Preview (What AgreeFlow extracts) */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#3525cd] animate-pulse"></div>
            <h2 className="text-[16px] font-semibold text-[#0b1c30]">
              What AgreeFlow extracts
            </h2>
          </div>
          <span className="text-[12px] font-medium text-[#565e74]">
            Structured Schema
          </span>
        </div>

        {/* Preview stack */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#c7c4d8]/40 space-y-2.5">
          {/* Decision Preview */}
          <div className="p-3 rounded-xl bg-[#ecfdf5] border border-[#a7f3d0] flex flex-col gap-1 transition-all">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Decision</span>
              </div>
              <span className="text-[11px] text-[#565e74] font-mono">10:14 AM</span>
            </div>
            <p className="text-[14px] text-[#0b1c30] font-semibold mt-0.5">
              Stripe billing migration approved for Q3 rollout
            </p>
            <span className="text-[12px] text-[#565e74]">
              Agreed by Dave, Rachel & Product Lead
            </span>
          </div>

          {/* Action Item Preview */}
          <div className="p-3 rounded-xl bg-[#eff6ff] border border-[#bfdbfe] flex flex-col gap-1 transition-all">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dae2fd] text-[#131b2e] text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3525cd]"></span>
                <span>Action Item</span>
              </div>
              <span className="text-[11px] text-[#565e74] font-mono">Due: Friday</span>
            </div>
            <p className="text-[14px] text-[#0b1c30] font-semibold mt-0.5">
              Ship mock sandbox endpoints to partner integrations
            </p>
            <div className="flex items-center gap-1.5 text-[#565e74] text-[12px]">
              <span className="material-symbols-outlined text-[14px]">person</span>
              <span>Assigned to Marcus</span>
            </div>
          </div>

          {/* Open Question Preview */}
          <div className="p-3 rounded-xl bg-[#f5f3ff] border border-[#ddd6fe] flex flex-col gap-1 transition-all">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e1e0ff] text-[#07006c] text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3130c0]"></span>
                <span>Open Question</span>
              </div>
              <span className="text-[11px] text-[#565e74] font-medium">High Priority</span>
            </div>
            <p className="text-[14px] text-[#0b1c30] font-semibold mt-0.5">
              Do we have formal legal sign-off on revised EEA customer terms?
            </p>
            <span className="text-[12px] text-[#565e74]">
              Raised by Sarah (Legal ping pending)
            </span>
          </div>

          {/* Missing Context Warning Preview */}
          <div className="p-3 rounded-xl bg-[#fffbeb] border border-[#fde68a] text-[#78350f] flex flex-col gap-1 transition-all">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e] text-[11px] font-semibold">
                <span>⚠️</span>
                <span>Missing Context</span>
              </div>
              <span className="text-[11px] text-[#b45309] font-medium">Review Required</span>
            </div>
            <p className="text-[14px] text-[#78350f] font-semibold mt-0.5">
              Owner missing on security QA penetration audit
            </p>
            <span className="text-[12px] text-[#92400e]/80">
              Task detected without identifiable assignee
            </span>
          </div>
        </div>
      </div>

      {/* Social Proof Footer Info */}
      <div className="mt-5 mb-2">
        <button
          onClick={onNavigateToAnalysis}
          type="button"
          className="w-full rounded-2xl bg-[#eff4ff] hover:bg-[#e5eeff] border border-[#dae2fd] p-3.5 flex items-center justify-between gap-3 text-left transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e2dfff] flex items-center justify-center text-[#3525cd] shrink-0">
              <span className="material-symbols-outlined text-[22px]">bolt</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-[#0b1c30] leading-tight">
                Instant Action Plan
              </span>
              <span className="text-[12px] text-[#565e74] leading-snug">
                Synced directly into Jira, Linear & Slack
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#565e74] text-[20px] shrink-0">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
};
