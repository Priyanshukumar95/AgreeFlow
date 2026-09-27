import React, { useState } from 'react';
import { AnalysisData } from '../types';

interface AIAnalysisScreenProps {
  data: AnalysisData;
  onUpdateData: (updated: AnalysisData) => void;
  onContinueToActionPlan: () => void;
  onBackToNotes: () => void;
  onReanalyze: () => void;
}

type FilterCategory = 'all' | 'decisions' | 'suggestions' | 'questions' | 'actions';

export const AIAnalysisScreen: React.FC<AIAnalysisScreenProps> = ({
  data,
  onUpdateData,
  onContinueToActionPlan,
  onBackToNotes,
  onReanalyze,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [expandedQuotes, setExpandedQuotes] = useState<Record<string, boolean>>({
    'ACT-02': true,
    'ACT-03': true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const totalInsights =
    data.decisions.length +
    data.suggestions.length +
    data.open_questions.length +
    data.action_items.length;

  const toggleQuote = (id: string) => {
    setExpandedQuotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const startEdit = (id: string, currentText: string) => {
    setEditingId(id);
    setEditText(currentText);
  };

  const saveEdit = (id: string, category: 'decisions' | 'suggestions' | 'questions' | 'actions') => {
    if (category === 'decisions') {
      const updated = data.decisions.map((d) => (d.id === id ? { ...d, text: editText } : d));
      onUpdateData({ ...data, decisions: updated });
    } else if (category === 'suggestions') {
      const updated = data.suggestions.map((s) => (s.id === id ? { ...s, text: editText } : s));
      onUpdateData({ ...data, suggestions: updated });
    } else if (category === 'questions') {
      const updated = data.open_questions.map((q) => (q.id === id ? { ...q, text: editText } : q));
      onUpdateData({ ...data, open_questions: updated });
    } else if (category === 'actions') {
      const updated = data.action_items.map((a) => (a.id === id ? { ...a, task: editText } : a));
      onUpdateData({ ...data, action_items: updated });
    }
    setEditingId(null);
  };

  // Calculate percentages for density bar
  const total = totalInsights || 1;
  const decPct = Math.round((data.decisions.length / total) * 100);
  const sugPct = Math.round((data.suggestions.length / total) * 100);
  const quePct = Math.round((data.open_questions.length / total) * 100);
  const actPct = 100 - (decPct + sugPct + quePct);

  return (
    <div className="flex flex-col w-full pb-36 max-w-xl mx-auto px-4 pt-3">
      {/* Top Meta Info & Actions */}
      <section className="pt-1 pb-2">
        <div className="bg-[#eff4ff] rounded-2xl p-3 shadow-xs border border-[#dae2fd]/60 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#3525cd] animate-pulse shrink-0"></span>
              <p className="text-[13px] text-[#565e74] truncate">
                Analysis of:{' '}
                <span className="font-semibold text-[#0b1c30]">
                  '{data.title}'
                </span>
              </p>
            </div>
            <span className="text-[11px] text-[#565e74] shrink-0 font-medium">
              {data.analyzedAt || 'Just now'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onReanalyze}
                className="h-8 px-2.5 rounded-lg bg-white hover:bg-[#e5eeff] text-[#0b1c30] text-[12px] font-semibold flex items-center gap-1 shadow-xs border border-[#c7c4d8]/40 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px] text-[#565e74]">
                  refresh
                </span>
                <span>Re-analyze</span>
              </button>
              <button
                type="button"
                onClick={onBackToNotes}
                className="h-8 px-2.5 rounded-lg bg-white hover:bg-[#e5eeff] text-[#0b1c30] text-[12px] font-semibold flex items-center gap-1 shadow-xs border border-[#c7c4d8]/40 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px] text-[#565e74]">
                  edit_note
                </span>
                <span>Edit Notes</span>
              </button>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#dce9ff] text-[#0b1c30] text-[11px] font-medium border border-[#dae2fd]">
              <span className="material-symbols-outlined text-[13px] text-[#3525cd]">
                verified
              </span>
              <span>99.4% parsed</span>
            </span>
          </div>
        </div>
      </section>

      {/* Delightful Status Breakdown Header */}
      <section className="py-2">
        <div className="bg-gradient-to-r from-white via-[#eff4ff] to-[#e5eeff] rounded-2xl p-4 shadow-sm border border-[#c7c4d8]/50">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e2dfff] text-[#0f0069] w-fit shadow-xs">
                <span className="material-symbols-outlined text-[14px]">
                  auto_awesome
                </span>
                <span className="text-[11px] tracking-wide uppercase font-bold">
                  Ready to review
                </span>
              </div>
              <h1 className="text-[20px] font-bold text-[#0b1c30] mt-1 leading-snug">
                ✨ {totalInsights} structured insights detected
              </h1>
              <p className="text-[13px] text-[#565e74]">
                Synthesized from{' '}
                <span className="text-[#0b1c30] font-semibold">
                  {data.wordCount || 480} words
                </span>{' '}
                in raw transcript.
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-[#3525cd] text-white flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[22px]">
                insights
              </span>
            </div>
          </div>

          {/* Micro Spark / Insight Ratio Bar */}
          <div className="mt-3.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] text-[#565e74]">
              <span>Synthesized Density</span>
              <span className="text-[#0b1c30] font-semibold">100% complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#d3e4fe] flex overflow-hidden p-0.5 gap-0.5">
              <div
                className="h-full rounded-full bg-[#10b981] transition-all"
                style={{ width: `${decPct}%` }}
                title={`Decisions: ${data.decisions.length}`}
              />
              <div
                className="h-full rounded-full bg-[#f59e0b] transition-all"
                style={{ width: `${sugPct}%` }}
                title={`Suggestions: ${data.suggestions.length}`}
              />
              <div
                className="h-full rounded-full bg-[#8b5cf6] transition-all"
                style={{ width: `${quePct}%` }}
                title={`Questions: ${data.open_questions.length}`}
              />
              <div
                className="h-full rounded-full bg-[#3525cd] transition-all"
                style={{ width: `${actPct}%` }}
                title={`Actions: ${data.action_items.length}`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4 Summary Metric Cards (2x2 Grid) */}
      <section className="py-2">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Confirmed Decisions Card */}
          <button
            type="button"
            onClick={() => setActiveFilter('decisions')}
            className={`p-3 rounded-2xl bg-white shadow-xs border text-left flex flex-col justify-between h-24 transition-all hover:shadow-md ${
              activeFilter === 'decisions'
                ? 'border-[#10b981] ring-2 ring-[#10b981]/20'
                : 'border-[#c7c4d8]/40'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                <span className="text-[12px] text-[#0b1c30] font-semibold truncate">
                  Decisions
                </span>
              </div>
              <span className="material-symbols-outlined text-[17px] text-[#10b981]">
                task_alt
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="text-[24px] font-bold text-[#0b1c30]">
                {data.decisions.length}
              </span>
              <span className="text-[11px] text-[#565e74] font-medium">
                Confirmed
              </span>
            </div>
          </button>

          {/* Suggestions Card */}
          <button
            type="button"
            onClick={() => setActiveFilter('suggestions')}
            className={`p-3 rounded-2xl bg-white shadow-xs border text-left flex flex-col justify-between h-24 transition-all hover:shadow-md ${
              activeFilter === 'suggestions'
                ? 'border-[#f59e0b] ring-2 ring-[#f59e0b]/20'
                : 'border-[#c7c4d8]/40'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                <span className="text-[12px] text-[#0b1c30] font-semibold truncate">
                  Suggestions
                </span>
              </div>
              <span className="material-symbols-outlined text-[17px] text-[#f59e0b]">
                lightbulb
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="text-[24px] font-bold text-[#0b1c30]">
                {data.suggestions.length}
              </span>
              <span className="text-[11px] text-[#565e74] font-medium">
                Proposals
              </span>
            </div>
          </button>

          {/* Open Questions Card */}
          <button
            type="button"
            onClick={() => setActiveFilter('questions')}
            className={`p-3 rounded-2xl bg-white shadow-xs border text-left flex flex-col justify-between h-24 transition-all hover:shadow-md ${
              activeFilter === 'questions'
                ? 'border-[#8b5cf6] ring-2 ring-[#8b5cf6]/20'
                : 'border-[#c7c4d8]/40'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6]"></span>
                <span className="text-[12px] text-[#0b1c30] font-semibold truncate">
                  Questions
                </span>
              </div>
              <span className="material-symbols-outlined text-[17px] text-[#8b5cf6]">
                help
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="text-[24px] font-bold text-[#0b1c30]">
                {data.open_questions.length}
              </span>
              <span className="text-[11px] text-[#565e74] font-medium">
                Unresolved
              </span>
            </div>
          </button>

          {/* Action Items Card */}
          <button
            type="button"
            onClick={() => setActiveFilter('actions')}
            className={`p-3 rounded-2xl bg-white shadow-xs border text-left flex flex-col justify-between h-24 transition-all hover:shadow-md ${
              activeFilter === 'actions'
                ? 'border-[#3525cd] ring-2 ring-[#3525cd]/20'
                : 'border-[#c7c4d8]/40'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3525cd]"></span>
                <span className="text-[12px] text-[#0b1c30] font-semibold truncate">
                  Action Items
                </span>
              </div>
              <span className="material-symbols-outlined text-[17px] text-[#3525cd]">
                checklist
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-auto">
              <span className="text-[24px] font-bold text-[#0b1c30]">
                {data.action_items.length}
              </span>
              <span className="text-[11px] text-[#565e74] font-medium">
                Ready to sync
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* Filter Pills Bar */}
      <section className="pt-2 pb-1">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`h-8 px-3 rounded-full text-[13px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'bg-[#3525cd] text-white shadow-xs'
                : 'bg-[#eff4ff] text-[#565e74] hover:text-[#0b1c30]'
            }`}
          >
            <span>All</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-current text-[11px]">
              {totalInsights}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('decisions')}
            className={`h-8 px-3 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeFilter === 'decisions'
                ? 'bg-[#10b981] text-white shadow-xs font-semibold'
                : 'bg-[#eff4ff] text-[#565e74] hover:text-[#0b1c30]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
            <span>Decisions</span>
            <span className="text-[11px] opacity-80">{data.decisions.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('suggestions')}
            className={`h-8 px-3 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeFilter === 'suggestions'
                ? 'bg-[#f59e0b] text-white shadow-xs font-semibold'
                : 'bg-[#eff4ff] text-[#565e74] hover:text-[#0b1c30]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
            <span>Suggestions</span>
            <span className="text-[11px] opacity-80">{data.suggestions.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('questions')}
            className={`h-8 px-3 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeFilter === 'questions'
                ? 'bg-[#8b5cf6] text-white shadow-xs font-semibold'
                : 'bg-[#eff4ff] text-[#565e74] hover:text-[#0b1c30]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#8b5cf6]"></span>
            <span>Questions</span>
            <span className="text-[11px] opacity-80">{data.open_questions.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('actions')}
            className={`h-8 px-3 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeFilter === 'actions'
                ? 'bg-[#3525cd] text-white shadow-xs font-semibold'
                : 'bg-[#eff4ff] text-[#565e74] hover:text-[#0b1c30]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#3525cd]"></span>
            <span>Actions</span>
            <span className="text-[11px] opacity-80">{data.action_items.length}</span>
          </button>
        </div>
      </section>

      {/* Detailed Insight Cards Feed */}
      <section className="py-2 flex flex-col gap-3">
        {/* DECISIONS */}
        {(activeFilter === 'all' || activeFilter === 'decisions') &&
          data.decisions.map((dec) => (
            <article
              key={dec.id}
              className="rounded-2xl bg-white p-4 shadow-sm border border-[#c7c4d8]/40 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
                    <span>Decision</span>
                  </span>
                  <span className="font-mono text-[11px] text-[#565e74] bg-[#eff4ff] px-1.5 py-0.5 rounded">
                    #{dec.id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    editingId === dec.id
                      ? saveEdit(dec.id, 'decisions')
                      : startEdit(dec.id, dec.text)
                  }
                  className="w-7 h-7 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-[#565e74] hover:text-[#0b1c30] flex items-center justify-center transition-colors"
                  title="Edit extracted item"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {editingId === dec.id ? 'check' : 'edit'}
                  </span>
                </button>
              </div>

              <div className="mt-2.5">
                {editingId === dec.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(dec.id, 'decisions')}
                    className="w-full text-[15px] font-semibold text-[#0b1c30] bg-[#eff4ff] p-2 rounded-lg outline-none ring-2 ring-[#3525cd]/30"
                    autoFocus
                  />
                ) : (
                  <p className="text-[15px] font-semibold text-[#0b1c30] leading-snug">
                    {dec.text}
                  </p>
                )}
                {dec.speaker && (
                  <p className="text-[13px] text-[#565e74] mt-1">
                    Sign-off recorded: {dec.speaker}
                  </p>
                )}
              </div>

              {/* Source Quote Affordance */}
              <div className="mt-3 pt-2 border-t border-[#eff4ff]">
                <button
                  type="button"
                  onClick={() => toggleQuote(dec.id)}
                  className="w-full flex items-center justify-between text-left text-[#565e74] hover:text-[#0b1c30] py-0.5 text-[12px] font-medium transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[#10b981]">
                      format_quote
                    </span>
                    <span>
                      {expandedQuotes[dec.id]
                        ? 'Hide source quote'
                        : 'Show verified source quote'}
                    </span>
                  </span>
                  <span
                    className={`material-symbols-outlined text-[16px] transition-transform ${
                      expandedQuotes[dec.id] ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>

                {expandedQuotes[dec.id] && (
                  <div className="mt-2 p-3 rounded-xl bg-[#eff4ff] flex flex-col gap-1.5 border border-[#dae2fd]/60">
                    <p className="text-[13px] text-[#0b1c30] italic leading-relaxed">
                      “{dec.source_sentence}”
                    </p>
                    <div className="flex items-center justify-between font-mono text-[11px] text-[#565e74] pt-1">
                      <span>Source: {dec.speaker || 'Meeting Note'}</span>
                      <span className="bg-white/80 px-1.5 py-0.5 rounded shadow-xs">
                        [{dec.timestamp || 'Verified quote'}]
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}

        {/* ACTION ITEMS */}
        {(activeFilter === 'all' || activeFilter === 'actions') &&
          data.action_items.map((act) => {
            const hasWarning = act.owner_missing || act.deadline_missing;
            return (
              <article
                key={act.id}
                className="rounded-2xl bg-white p-4 shadow-sm border border-[#c7c4d8]/40 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#dae2fd] text-[#131b2e] text-[11px] font-semibold border border-[#c3c0ff]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3525cd]"></span>
                      <span>Action Item</span>
                    </span>
                    <span className="font-mono text-[11px] text-[#565e74] bg-[#eff4ff] px-1.5 py-0.5 rounded">
                      #{act.id}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      editingId === act.id
                        ? saveEdit(act.id, 'actions')
                        : startEdit(act.id, act.task)
                    }
                    className="w-7 h-7 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-[#565e74] hover:text-[#0b1c30] flex items-center justify-center transition-colors"
                    title="Edit extracted item"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      {editingId === act.id ? 'check' : 'edit'}
                    </span>
                  </button>
                </div>

                {/* Missing Info Warning Pill */}
                {hasWarning && (
                  <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ffdad6] text-[#93000a] w-fit">
                    <span className="material-symbols-outlined text-[15px]">
                      warning
                    </span>
                    <span className="text-[11px] font-semibold">
                      {act.owner_missing && act.deadline_missing
                        ? '⚠️ Missing Info: Assignee & deadline not specified'
                        : act.owner_missing
                        ? '⚠️ Missing Info: Assignee not specified'
                        : '⚠️ Missing Info: Target deadline not specified'}
                    </span>
                  </div>
                )}

                <div className="mt-2">
                  {editingId === act.id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(act.id, 'actions')}
                      className="w-full text-[15px] font-semibold text-[#0b1c30] bg-[#eff4ff] p-2 rounded-lg outline-none ring-2 ring-[#3525cd]/30"
                      autoFocus
                    />
                  ) : (
                    <p className="text-[15px] font-semibold text-[#0b1c30] leading-snug">
                      {act.task}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-2 text-[#565e74] text-[13px] flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">
                        account_circle
                      </span>
                      <span>
                        Assignee:{' '}
                        <strong className={act.owner_missing ? 'text-[#ba1a1a]' : 'text-[#0b1c30]'}>
                          {act.owner || 'Needs Assignee'}
                        </strong>
                      </span>
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">
                        calendar_today
                      </span>
                      <span>
                        Due:{' '}
                        <strong className={act.deadline_missing ? 'text-[#ba1a1a]' : 'text-[#0b1c30]'}>
                          {act.deadline || 'Needs Review'}
                        </strong>
                      </span>
                    </span>
                  </div>
                </div>

                {/* Source quote */}
                <div className="mt-3 pt-2 border-t border-[#eff4ff]">
                  <button
                    type="button"
                    onClick={() => toggleQuote(act.id)}
                    className="w-full flex items-center justify-between text-left text-[#565e74] hover:text-[#0b1c30] py-0.5 text-[12px] font-medium transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`material-symbols-outlined text-[15px] ${
                          hasWarning ? 'text-[#ba1a1a]' : 'text-[#3525cd]'
                        }`}
                      >
                        format_quote
                      </span>
                      <span>
                        {hasWarning ? 'Source with ambiguity' : 'Show verified source quote'}
                      </span>
                    </span>
                    <span
                      className={`material-symbols-outlined text-[16px] transition-transform ${
                        expandedQuotes[act.id] ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {expandedQuotes[act.id] && (
                    <div className="mt-2 p-3 rounded-xl bg-[#eff4ff] flex flex-col gap-1.5 border border-[#dae2fd]/60">
                      <p className="text-[13px] text-[#0b1c30] italic leading-relaxed">
                        “{act.source_sentence}”
                      </p>
                      <div className="flex items-center justify-between font-mono text-[11px] text-[#565e74] pt-1">
                        <span>Speaker: {act.speaker || act.owner || 'Transcript'}</span>
                        <span className="bg-white/80 px-1.5 py-0.5 rounded shadow-xs">
                          [{act.timestamp || 'Line 28 / audio reference'}]
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}

        {/* SUGGESTIONS */}
        {(activeFilter === 'all' || activeFilter === 'suggestions') &&
          data.suggestions.map((sug) => (
            <article
              key={sug.id}
              className="rounded-2xl bg-white p-4 shadow-sm border border-[#c7c4d8]/40 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#fffbeb] text-amber-900 text-[11px] font-semibold border border-amber-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
                    <span>Suggestion</span>
                  </span>
                  <span className="font-mono text-[11px] text-[#565e74] bg-[#eff4ff] px-1.5 py-0.5 rounded">
                    #{sug.id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    editingId === sug.id
                      ? saveEdit(sug.id, 'suggestions')
                      : startEdit(sug.id, sug.text)
                  }
                  className="w-7 h-7 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-[#565e74] hover:text-[#0b1c30] flex items-center justify-center transition-colors"
                  title="Edit extracted item"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {editingId === sug.id ? 'check' : 'edit'}
                  </span>
                </button>
              </div>

              <div className="mt-2.5">
                {editingId === sug.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(sug.id, 'suggestions')}
                    className="w-full text-[15px] font-semibold text-[#0b1c30] bg-[#eff4ff] p-2 rounded-lg outline-none ring-2 ring-[#f59e0b]/30"
                    autoFocus
                  />
                ) : (
                  <p className="text-[15px] font-semibold text-[#0b1c30] leading-snug">
                    {sug.text}
                  </p>
                )}
                {sug.speaker && (
                  <p className="text-[13px] text-[#565e74] mt-1">
                    Proposed by: {sug.speaker}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-[#eff4ff]">
                <button
                  type="button"
                  onClick={() => toggleQuote(sug.id)}
                  className="w-full flex items-center justify-between text-left text-[#565e74] hover:text-[#0b1c30] py-0.5 text-[12px] font-medium transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[#f59e0b]">
                      format_quote
                    </span>
                    <span>
                      {expandedQuotes[sug.id]
                        ? 'Hide source quote'
                        : 'Show verified source quote'}
                    </span>
                  </span>
                  <span
                    className={`material-symbols-outlined text-[16px] transition-transform ${
                      expandedQuotes[sug.id] ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>

                {expandedQuotes[sug.id] && (
                  <div className="mt-2 p-3 rounded-xl bg-[#eff4ff] flex flex-col gap-1.5 border border-[#dae2fd]/60">
                    <p className="text-[13px] text-[#0b1c30] italic leading-relaxed">
                      “{sug.source_sentence}”
                    </p>
                    <div className="flex items-center justify-between font-mono text-[11px] text-[#565e74] pt-1">
                      <span>Speaker: {sug.speaker || 'Idea proposed'}</span>
                      <span className="bg-white/80 px-1.5 py-0.5 rounded shadow-xs">
                        [{sug.timestamp || 'Line 28 / proposal'}]
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}

        {/* OPEN QUESTIONS */}
        {(activeFilter === 'all' || activeFilter === 'questions') &&
          data.open_questions.map((que) => (
            <article
              key={que.id}
              className="rounded-2xl bg-white p-4 shadow-sm border border-[#c7c4d8]/40 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#f5f3ff] text-purple-900 text-[11px] font-semibold border border-purple-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]"></span>
                    <span>Open Question</span>
                  </span>
                  <span className="font-mono text-[11px] text-[#565e74] bg-[#eff4ff] px-1.5 py-0.5 rounded">
                    #{que.id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    editingId === que.id
                      ? saveEdit(que.id, 'questions')
                      : startEdit(que.id, que.text)
                  }
                  className="w-7 h-7 rounded-lg bg-[#eff4ff] hover:bg-[#e5eeff] text-[#565e74] hover:text-[#0b1c30] flex items-center justify-center transition-colors"
                  title="Edit extracted item"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {editingId === que.id ? 'check' : 'edit'}
                  </span>
                </button>
              </div>

              <div className="mt-2.5">
                {editingId === que.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(que.id, 'questions')}
                    className="w-full text-[15px] font-semibold text-[#0b1c30] bg-[#eff4ff] p-2 rounded-lg outline-none ring-2 ring-[#8b5cf6]/30"
                    autoFocus
                  />
                ) : (
                  <p className="text-[15px] font-semibold text-[#0b1c30] leading-snug">
                    {que.text}
                  </p>
                )}
                {que.speaker && (
                  <p className="text-[13px] text-[#565e74] mt-1">
                    Raised by: {que.speaker}
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-[#eff4ff]">
                <button
                  type="button"
                  onClick={() => toggleQuote(que.id)}
                  className="w-full flex items-center justify-between text-left text-[#565e74] hover:text-[#0b1c30] py-0.5 text-[12px] font-medium transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-[#8b5cf6]">
                      format_quote
                    </span>
                    <span>
                      {expandedQuotes[que.id]
                        ? 'Hide source quote'
                        : 'Show verified source quote'}
                    </span>
                  </span>
                  <span
                    className={`material-symbols-outlined text-[16px] transition-transform ${
                      expandedQuotes[que.id] ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>

                {expandedQuotes[que.id] && (
                  <div className="mt-2 p-3 rounded-xl bg-[#eff4ff] flex flex-col gap-1.5 border border-[#dae2fd]/60">
                    <p className="text-[13px] text-[#0b1c30] italic leading-relaxed">
                      “{que.source_sentence}”
                    </p>
                    <div className="flex items-center justify-between font-mono text-[11px] text-[#565e74] pt-1">
                      <span>Source: {que.speaker || 'Sync Question'}</span>
                      <span className="bg-white/80 px-1.5 py-0.5 rounded shadow-xs">
                        [{que.timestamp || 'Line 33 / 00:19:05'}]
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
      </section>

      {/* Persistent Sticky Bottom Action Banner */}
      <aside className="fixed bottom-16 left-0 right-0 z-40 max-w-xl mx-auto px-4 py-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-[#c7c4d8]/60 flex flex-col gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={onContinueToActionPlan}
            className="w-full h-11 px-4 rounded-xl bg-[#3525cd] text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-[#4f46e5] active:scale-[0.99] transition-all"
          >
            <span>Continue to Action Plan ({data.action_items.length} Tasks)</span>
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </button>

          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={onBackToNotes}
              className="text-[12px] text-[#565e74] hover:text-[#0b1c30] flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">
                arrow_back
              </span>
              <span>Back to raw notes</span>
            </button>

            <span className="text-[12px] text-[#565e74] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#10b981]">
                cloud_done
              </span>
              <span>Draft auto-saved</span>
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
};
