import React, { useState } from 'react';
import { AnalysisData, ActionItem, SuggestionItem, OpenQuestionItem } from '../types';
import { TEAM_MEMBERS } from '../sampleData';

interface ActionPlanScreenProps {
  data: AnalysisData;
  onUpdateData: (updated: AnalysisData) => void;
  showToast: (msg: string) => void;
}

type TaskFilter = 'all' | 'assigned' | 'attention';

export const ActionPlanScreen: React.FC<ActionPlanScreenProps> = ({
  data,
  onUpdateData,
  showToast,
}) => {
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState<string | null>(null);

  // Accordion drawer states
  const [decisionsOpen, setDecisionsOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [questionsOpen, setQuestionsOpen] = useState(false);

  // Active owner/deadline popup menus
  const [activeOwnerMenu, setActiveOwnerMenu] = useState<string | null>(null);
  const [activeDeadlineMenu, setActiveDeadlineMenu] = useState<string | null>(null);
  const [activeCardMenu, setActiveCardMenu] = useState<string | null>(null);

  // Source quote expansion states
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({
    'ACT-01': true,
  });

  // Quick task input
  const [quickTaskText, setQuickTaskText] = useState('');

  // Count attention items
  const attentionItems = data.action_items.filter((item) => item.owner_missing || item.deadline_missing);
  const assignedItems = data.action_items.filter((item) => !item.owner_missing);

  const toggleSource = (id: string) => {
    setExpandedSources((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleComplete = (id: string) => {
    const updated = data.action_items.map((item) => {
      if (item.id === id) {
        const next = !item.completed;
        showToast(next ? 'Task marked complete' : 'Task marked active');
        return { ...item, completed: next };
      }
      return item;
    });
    onUpdateData({ ...data, action_items: updated });
  };

  const updateTaskTitle = (id: string, newTitle: string) => {
    const updated = data.action_items.map((item) =>
      item.id === id ? { ...item, task: newTitle } : item
    );
    onUpdateData({ ...data, action_items: updated });
  };

  const setTaskOwner = (id: string, ownerName: string | null) => {
    const updated = data.action_items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          owner: ownerName,
          owner_missing: !ownerName,
        };
      }
      return item;
    });
    onUpdateData({ ...data, action_items: updated });
    setActiveOwnerMenu(null);
    showToast(ownerName ? `Assigned to ${ownerName}` : 'Task unassigned');
  };

  const setTaskDeadline = (id: string, deadlineText: string | null) => {
    const updated = data.action_items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          deadline: deadlineText,
          deadline_missing: !deadlineText,
        };
      }
      return item;
    });
    onUpdateData({ ...data, action_items: updated });
    setActiveDeadlineMenu(null);
    showToast(deadlineText ? `Deadline scheduled: ${deadlineText}` : 'Deadline cleared');
  };

  const promptCustomDeadline = (id: string, current: string | null) => {
    const val = prompt('Enter custom deadline (e.g. Aug 30, Tomorrow 5 PM):', current || '');
    if (val !== null) {
      setTaskDeadline(id, val.trim() ? val.trim() : null);
    }
  };

  const handleCreateTask = () => {
    const text = quickTaskText.trim();
    if (!text) return;
    const newTask: ActionItem = {
      id: `ACT-0${data.action_items.length + 1}`,
      task: text,
      owner: 'Marcus K.',
      deadline: 'Tomorrow, 5 PM',
      owner_missing: false,
      deadline_missing: false,
      source_sentence: 'Manually added to sprint plan during review',
      speaker: 'You',
      timestamp: 'Just now',
      completed: false,
    };
    onUpdateData({
      ...data,
      action_items: [...data.action_items, newTask],
    });
    setQuickTaskText('');
    showToast('Task added to sprint plan');
  };

  const convertSuggestionToTask = (sug: SuggestionItem) => {
    const newTask: ActionItem = {
      id: `ACT-0${data.action_items.length + 1}`,
      task: sug.text,
      owner: sug.speaker || null,
      deadline: 'Next Sprint',
      owner_missing: !sug.speaker,
      deadline_missing: false,
      source_sentence: sug.source_sentence,
      speaker: sug.speaker,
      timestamp: sug.timestamp,
      completed: false,
    };
    const updatedSuggestions = data.suggestions.map((s) =>
      s.id === sug.id ? { ...s, addedToTasks: true } : s
    );
    onUpdateData({
      ...data,
      suggestions: updatedSuggestions,
      action_items: [...data.action_items, newTask],
    });
    showToast(`Converted "${sug.text.slice(0, 24)}..." to task`);
  };

  const resolveQuestion = (queId: string) => {
    const updatedQuestions = data.open_questions.map((q) =>
      q.id === queId ? { ...q, resolved: true } : q
    );
    onUpdateData({ ...data, open_questions: updatedQuestions });
    showToast('Question marked as resolved');
  };

  const deleteTask = (id: string) => {
    const updated = data.action_items.filter((a) => a.id !== id);
    onUpdateData({ ...data, action_items: updated });
    setActiveCardMenu(null);
    showToast('Task removed');
  };

  const duplicateTask = (task: ActionItem) => {
    const duplicated: ActionItem = {
      ...task,
      id: `ACT-0${data.action_items.length + 1}`,
      task: `${task.task} (Copy)`,
    };
    onUpdateData({
      ...data,
      action_items: [...data.action_items, duplicated],
    });
    setActiveCardMenu(null);
    showToast('Task duplicated');
  };

  const handleExport = (target: string) => {
    setExportMenuOpen(false);
    if (target === 'Markdown') {
      const md = `# Action Plan: ${data.title}\n\n## Action Items\n` +
        data.action_items
          .map(
            (a) =>
              `- [${a.completed ? 'x' : ' '}] **${a.task}** (Owner: ${a.owner || 'Unassigned'}, Due: ${a.deadline || 'Unscheduled'})\n  > "${a.source_sentence}"`
          )
          .join('\n\n');
      navigator.clipboard?.writeText(md);
      showToast('Markdown copied to clipboard!');
    } else if (target === 'CSV') {
      const csv = 'ID,Task,Owner,Deadline,Completed,Source\n' +
        data.action_items
          .map(
            (a) =>
              `"${a.id}","${a.task.replace(/"/g, '""')}","${a.owner || ''}","${a.deadline || ''}",${a.completed || false},"${a.source_sentence.replace(/"/g, '""')}"`
          )
          .join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agreeflow-actions-${Date.now()}.csv`;
      a.click();
      showToast('CSV downloaded');
    } else {
      setSyncModalOpen(target);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    showToast('Collaboration link copied to clipboard!');
  };

  // Filter tasks
  const visibleTasks = data.action_items.filter((item) => {
    if (filter === 'assigned') return !item.owner_missing;
    if (filter === 'attention') return item.owner_missing || item.deadline_missing;
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-36 max-w-xl mx-auto px-4 pt-3">
      {/* Top Document Header Bar */}
      <div className="pt-1 pb-3 flex flex-col gap-2.5 bg-[#eff4ff] p-3.5 rounded-2xl border border-[#dae2fd]/60">
        {/* Breadcrumb & Stage Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#565e74] text-[11px]">
            <span>Workspace</span>
            <span className="material-symbols-outlined text-[13px] text-[#777587]">
              chevron_right
            </span>
            <span className="truncate max-w-[80px]">Q3 Sync</span>
            <span className="material-symbols-outlined text-[13px] text-[#777587]">
              chevron_right
            </span>
            <span className="font-semibold text-[#3525cd]">Stage 3: Action Plan</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-[#0b1c30] shadow-xs border border-[#dae2fd]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-[11px] text-[#565e74] font-medium">
              Auto-saved
            </span>
          </div>
        </div>

        {/* Title & Action Buttons */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-[#e2dfff] text-[#0f0069] text-[11px] font-bold">
                Sprint Ready
              </span>
              <span className="text-[#565e74] text-[11px] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">
                  lock_open
                </span>{' '}
                Editable
              </span>
            </div>
            <h1 className="text-[20px] font-bold text-[#0b1c30] tracking-tight mt-1 truncate">
              Action Plan: {data.title}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="h-8 px-2.5 rounded-lg bg-white text-[#0b1c30] text-[12px] font-semibold flex items-center gap-1 hover:bg-[#e5eeff] transition-colors shadow-xs border border-[#c7c4d8]/40"
              >
                <span className="material-symbols-outlined text-[16px] text-[#3525cd]">
                  file_download
                </span>
                <span>Export</span>
                <span className="material-symbols-outlined text-[14px]">
                  expand_more
                </span>
              </button>

              {exportMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-white shadow-xl border border-[#c7c4d8]/60 p-1.5 z-40 flex flex-col gap-0.5">
                  <button
                    onClick={() => handleExport('Linear')}
                    className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-[#eff4ff] flex items-center gap-2 text-[#0b1c30] text-[13px] font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#3525cd]">
                      view_kanban
                    </span>{' '}
                    Linear Issues
                  </button>
                  <button
                    onClick={() => handleExport('Jira')}
                    className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-[#eff4ff] flex items-center gap-2 text-[#0b1c30] text-[13px] font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#4f46e5]">
                      splitscreen
                    </span>{' '}
                    Jira Backlog
                  </button>
                  <button
                    onClick={() => handleExport('Notion')}
                    className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-[#eff4ff] flex items-center gap-2 text-[#0b1c30] text-[13px] font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#565e74]">
                      table_chart
                    </span>{' '}
                    Notion Database
                  </button>
                  <button
                    onClick={() => handleExport('Markdown')}
                    className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-[#eff4ff] flex items-center gap-2 text-[#0b1c30] text-[13px] font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#565e74]">
                      terminal
                    </span>{' '}
                    Markdown / PR
                  </button>
                  <button
                    onClick={() => handleExport('CSV')}
                    className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-[#eff4ff] flex items-center gap-2 text-[#0b1c30] text-[13px] font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#565e74]">
                      grid_on
                    </span>{' '}
                    CSV File
                  </button>
                </div>
              )}
            </div>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="h-8 px-2.5 rounded-lg bg-[#3525cd] text-white text-[12px] font-semibold flex items-center gap-1 hover:bg-[#4f46e5] transition-colors shadow-xs"
            >
              <span>Share</span>
              <span className="material-symbols-outlined text-[14px]">
                north_east
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Synthesis Memory Drawers (Intelligence Carryover) */}
      <div className="py-2.5 flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] text-[#565e74] uppercase tracking-wider font-bold">
            Synthesis Memory
          </span>
          <span className="font-mono text-[11px] text-[#565e74]">
            {data.decisions.length + data.suggestions.length + data.open_questions.length} contextual logs
          </span>
        </div>

        {/* 1. Confirmed Decisions Drawer */}
        <div className="rounded-xl bg-white shadow-xs border border-[#c7c4d8]/40 overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setDecisionsOpen(!decisionsOpen)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-[#eff4ff] transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="text-[13px] font-semibold text-emerald-900 truncate">
                Confirmed Decisions ({data.decisions.length})
              </span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Locked
              </span>
            </div>
            <span
              className={`material-symbols-outlined text-[18px] text-emerald-800 transition-transform ${
                decisionsOpen ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          {decisionsOpen && (
            <div className="px-3 pb-3 pt-1 flex flex-col gap-2 bg-white">
              {data.decisions.map((dec) => (
                <div
                  key={dec.id}
                  className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 flex flex-col gap-0.5"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-emerald-700">
                      check_circle
                    </span>
                    <span className="text-[13px] font-semibold text-emerald-950">
                      {dec.text}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-800 pl-5">
                    {dec.speaker ? `Agreed by ${dec.speaker}` : 'Agreed unanimously'} • {dec.timestamp || 'Verified in sync'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Suggestions Drawer */}
        <div className="rounded-xl bg-white shadow-xs border border-[#c7c4d8]/40 overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setSuggestionsOpen(!suggestionsOpen)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-[#eff4ff] transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
              <span className="text-[13px] font-semibold text-amber-900 truncate">
                Suggestions & Ideas ({data.suggestions.length})
              </span>
              <span className="px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                Optional
              </span>
            </div>
            <span
              className={`material-symbols-outlined text-[18px] text-amber-800 transition-transform ${
                suggestionsOpen ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          {suggestionsOpen && (
            <div className="px-3 pb-3 pt-1 flex flex-col gap-2 bg-white">
              {data.suggestions.map((sug) => (
                <div
                  key={sug.id}
                  className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-100 flex items-start justify-between gap-2"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-medium text-amber-950">
                      {sug.text}
                    </span>
                    <span className="font-mono text-[11px] text-amber-800">
                      {sug.speaker ? `Suggested by ${sug.speaker}` : 'Idea proposed'}
                    </span>
                  </div>
                  {sug.addedToTasks ? (
                    <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#eff4ff] text-[#565e74] text-[11px] font-semibold">
                      Added ✓
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => convertSuggestionToTask(sug)}
                      className="shrink-0 px-2.5 py-1 rounded-md bg-amber-200 text-amber-950 text-[11px] font-bold hover:bg-amber-300 transition-colors shadow-xs active:scale-95"
                    >
                      + Add to tasks
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Open Questions Drawer */}
        <div className="rounded-xl bg-white shadow-xs border border-[#c7c4d8]/40 overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setQuestionsOpen(!questionsOpen)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-[#eff4ff] transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
              <span className="text-[13px] font-semibold text-purple-900 truncate">
                Open Questions ({data.open_questions.length})
              </span>
              <span className="px-2 py-0.2 rounded-full bg-purple-100 text-purple-900 text-[10px] font-bold">
                Requires Input
              </span>
            </div>
            <span
              className={`material-symbols-outlined text-[18px] text-purple-800 transition-transform ${
                questionsOpen ? 'rotate-180' : ''
              }`}
            >
              expand_more
            </span>
          </button>

          {questionsOpen && (
            <div className="px-3 pb-3 pt-1 flex flex-col gap-2 bg-white">
              {data.open_questions.map((que) => (
                <div
                  key={que.id}
                  className={`p-2.5 rounded-lg bg-purple-50/70 border border-purple-100 flex items-center justify-between gap-2 transition-opacity ${
                    que.resolved ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className={`text-[13px] font-medium text-purple-950 truncate ${que.resolved ? 'line-through' : ''}`}>
                      {que.text}
                    </span>
                    <span className="font-mono text-[11px] text-purple-800">
                      {que.speaker ? `Raised by ${que.speaker}` : 'Inquiry'}
                    </span>
                  </div>
                  {que.resolved ? (
                    <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#eff4ff] text-[#565e74] text-[11px] font-semibold">
                      Resolved ✓
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => resolveQuestion(que.id)}
                      className="shrink-0 px-2.5 py-1 rounded-md bg-purple-200 text-purple-900 text-[11px] font-bold hover:bg-purple-300 transition-colors shadow-xs active:scale-95"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Action Task Section */}
      <div className="pt-3 flex flex-col gap-2.5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#3525cd]">
                playlist_add_check
              </span>
              <h2 className="text-[17px] font-bold text-[#0b1c30]">Action Items</h2>
              <span className="px-2 py-0.2 rounded-full bg-[#dce9ff] text-[#0b1c30] text-[11px] font-bold">
                {data.action_items.length}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#565e74] text-[11px]">
              <span className="material-symbols-outlined text-[15px]">touch_app</span>
              <span>Tap fields to edit</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`h-7 px-3 rounded-full text-[12px] font-semibold transition-colors whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-[#3525cd] text-white shadow-xs'
                  : 'bg-[#eff4ff] text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              All ({data.action_items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('assigned')}
              className={`h-7 px-3 rounded-full text-[12px] font-semibold transition-colors whitespace-nowrap ${
                filter === 'assigned'
                  ? 'bg-[#3525cd] text-white shadow-xs'
                  : 'bg-[#eff4ff] text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              Assigned ({assignedItems.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('attention')}
              className={`h-7 px-3 rounded-full text-[12px] font-semibold transition-colors flex items-center gap-1 whitespace-nowrap ${
                filter === 'attention'
                  ? 'bg-[#ba1a1a] text-white shadow-xs'
                  : 'bg-[#ffdad6] text-[#93000a] hover:brightness-95'
              }`}
            >
              <span>Needs Attention</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#ba1a1a] text-white text-[10px] font-bold">
                {attentionItems.length} ⚠️
              </span>
            </button>
          </div>
        </div>

        {/* Task Cards Stream */}
        <div className="flex flex-col gap-2.5">
          {visibleTasks.map((task) => {
            const hasWarning = task.owner_missing || task.deadline_missing;
            return (
              <div
                key={task.id}
                className="group rounded-2xl bg-white p-3.5 shadow-sm border border-[#c7c4d8]/40 hover:shadow-md transition-all flex flex-col gap-2.5"
              >
                {/* Task Top Row: Checkbox + Title + More menu */}
                <div className="flex items-start gap-2.5">
                  <button
                    type="button"
                    onClick={() => toggleComplete(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 border ${
                      task.completed
                        ? 'bg-[#3525cd] border-[#3525cd] text-white'
                        : 'bg-[#eff4ff] border-[#c7c4d8] text-transparent hover:border-[#3525cd]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px] font-bold">
                      check
                    </span>
                  </button>

                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={task.task}
                      onChange={(e) => updateTaskTitle(task.id, e.target.value)}
                      className={`w-full bg-transparent text-[14px] font-semibold text-[#0b1c30] focus:bg-[#eff4ff] focus:px-2 focus:py-1 focus:rounded-md outline-none transition-all truncate ${
                        task.completed ? 'line-through text-[#565e74]' : ''
                      }`}
                    />
                  </div>

                  {/* 3-dot menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveCardMenu(activeCardMenu === task.id ? null : task.id)
                      }
                      className="text-[#565e74] hover:text-[#0b1c30] p-1 rounded hover:bg-[#eff4ff] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        more_vert
                      </span>
                    </button>

                    {activeCardMenu === task.id && (
                      <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white shadow-xl border border-[#c7c4d8]/60 p-1 z-30 flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => duplicateTask(task)}
                          className="px-2 py-1 text-left rounded-lg hover:bg-[#eff4ff] text-[12px] font-medium text-[#0b1c30] flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            content_copy
                          </span>
                          Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          className="px-2 py-1 text-left rounded-lg hover:bg-[#ffdad6] text-[12px] font-medium text-[#ba1a1a] flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            delete
                          </span>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata Chips Row: Owner + Deadline + Source quote button */}
                <div className="flex items-center flex-wrap gap-2 pl-7.5">
                  {/* Owner Selector Chip */}
                  <div className="relative">
                    {task.owner_missing ? (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveOwnerMenu(
                            activeOwnerMenu === task.id ? null : task.id
                          )
                        }
                        className="h-6 px-2.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[11px] font-bold flex items-center gap-1 shadow-2xs hover:brightness-95 transition-all"
                      >
                        <span>⚠️ Owner missing — assign someone</span>
                        <span className="material-symbols-outlined text-[13px]">
                          expand_more
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveOwnerMenu(
                            activeOwnerMenu === task.id ? null : task.id
                          )
                        }
                        className="h-6 px-2 rounded-md bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] text-[11px] font-medium flex items-center gap-1.5 transition-colors border border-[#dae2fd]"
                      >
                        <span className="w-4 h-4 rounded-full bg-[#3525cd] text-white font-bold text-[9px] flex items-center justify-center">
                          {task.owner
                            ? task.owner.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                            : '?'}
                        </span>
                        <span className="font-semibold">{task.owner}</span>
                        <span className="material-symbols-outlined text-[12px] text-[#565e74]">
                          expand_more
                        </span>
                      </button>
                    )}

                    {/* Owner Dropdown */}
                    {activeOwnerMenu === task.id && (
                      <div className="absolute left-0 mt-1 w-44 rounded-xl bg-white shadow-xl border border-[#c7c4d8]/60 p-1.5 z-30 flex flex-col gap-0.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold text-[#565e74] uppercase tracking-wider">
                          Assign team member:
                        </span>
                        {TEAM_MEMBERS.map((m) => (
                          <button
                            key={m.name}
                            type="button"
                            onClick={() => setTaskOwner(task.id, m.name)}
                            className="px-2 py-1 text-left rounded-lg hover:bg-[#eff4ff] text-[12px] font-medium text-[#0b1c30] flex items-center gap-2"
                          >
                            <span
                              className={`w-4 h-4 rounded-full ${m.color} text-white font-bold text-[9px] flex items-center justify-center`}
                            >
                              {m.initials}
                            </span>
                            <span>{m.name}</span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setTaskOwner(task.id, null)}
                          className="px-2 py-1 text-left rounded-lg hover:bg-[#ffdad6] text-[12px] font-medium text-[#ba1a1a] flex items-center gap-2 mt-1 border-t border-[#eff4ff]"
                        >
                          <span className="w-4 h-4 rounded-full bg-[#ba1a1a] text-white font-bold text-[9px] flex items-center justify-center">
                            ?
                          </span>
                          <span>Mark Unassigned</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Deadline Selector Chip */}
                  <div className="relative">
                    {task.deadline_missing ? (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveDeadlineMenu(
                            activeDeadlineMenu === task.id ? null : task.id
                          )
                        }
                        className="h-6 px-2.5 rounded-full bg-[#fef3c7] text-[#92400e] text-[11px] font-bold flex items-center gap-1 shadow-2xs hover:brightness-95 transition-all"
                      >
                        <span>⚠️ Deadline missing — set date</span>
                        <span className="material-symbols-outlined text-[13px]">
                          expand_more
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setActiveDeadlineMenu(
                            activeDeadlineMenu === task.id ? null : task.id
                          )
                        }
                        className="h-6 px-2 rounded-md bg-[#eff4ff] hover:bg-[#e5eeff] text-[#565e74] hover:text-[#0b1c30] text-[11px] font-medium flex items-center gap-1 transition-colors border border-[#dae2fd]"
                      >
                        <span>📅</span>
                        <span className="font-semibold text-[#0b1c30]">
                          {task.deadline}
                        </span>
                        <span className="material-symbols-outlined text-[12px] text-[#565e74]">
                          expand_more
                        </span>
                      </button>
                    )}

                    {/* Deadline Dropdown */}
                    {activeDeadlineMenu === task.id && (
                      <div className="absolute left-0 mt-1 w-44 rounded-xl bg-white shadow-xl border border-[#c7c4d8]/60 p-1.5 z-30 flex flex-col gap-0.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold text-[#565e74] uppercase tracking-wider">
                          Schedule deadline:
                        </span>
                        <button
                          type="button"
                          onClick={() => setTaskDeadline(task.id, 'Today, 5:00 PM')}
                          className="px-2 py-1 text-left rounded-lg hover:bg-[#eff4ff] text-[12px] font-medium text-[#0b1c30]"
                        >
                          Today, 5:00 PM
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskDeadline(task.id, 'Tomorrow, 5:00 PM')}
                          className="px-2 py-1 text-left rounded-lg hover:bg-[#eff4ff] text-[12px] font-medium text-[#0b1c30]"
                        >
                          Tomorrow, 5:00 PM
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskDeadline(task.id, 'Next Friday')}
                          className="px-2 py-1 text-left rounded-lg hover:bg-[#eff4ff] text-[12px] font-medium text-[#0b1c30]"
                        >
                          Next Friday
                        </button>
                        <button
                          type="button"
                          onClick={() => setTaskDeadline(task.id, 'End of Sprint')}
                          className="px-2 py-1 text-left rounded-lg hover:bg-[#eff4ff] text-[12px] font-medium text-[#0b1c30]"
                        >
                          End of Sprint
                        </button>
                        <button
                          type="button"
                          onClick={() => promptCustomDeadline(task.id, task.deadline)}
                          className="px-2 py-1 text-left rounded-lg hover:bg-[#eff4ff] text-[12px] font-medium text-[#3525cd] border-t border-[#eff4ff] mt-1"
                        >
                          Custom Date...
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Source Quote Button */}
                  <button
                    type="button"
                    onClick={() => toggleSource(task.id)}
                    className="h-6 px-2 rounded-md bg-[#eff4ff] hover:bg-[#e2dfff] text-[#3525cd] text-[11px] font-semibold flex items-center gap-1 transition-colors ml-auto border border-[#dae2fd]/60"
                  >
                    <span className="material-symbols-outlined text-[13px]">
                      format_quote
                    </span>
                    <span>{expandedSources[task.id] ? 'Hide' : 'Source'}</span>
                  </button>
                </div>

                {/* Left-Accented Source Quote Block */}
                {expandedSources[task.id] && (
                  <div className="ml-7.5 p-2.5 rounded-xl bg-[#eff4ff] border-l-2 border-[#3525cd] flex flex-col gap-1 transition-all">
                    <div className="flex items-center gap-1.5 text-[#565e74]">
                      <span className="material-symbols-outlined text-[13px] text-[#3525cd]">
                        record_voice_over
                      </span>
                      <span className="font-mono text-[11px] font-semibold text-[#0b1c30]">
                        {task.speaker || task.owner || 'Meeting Sync'} @ {task.timestamp || 'verified quote'}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#464555] italic leading-relaxed">
                      “{task.source_sentence}”
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Inline Add New Task Affordance (Linear Style) */}
        <div className="mt-1 rounded-2xl bg-white p-2 shadow-xs border border-[#c7c4d8]/50 flex items-center gap-2 hover:bg-[#eff4ff]/60 transition-colors">
          <span className="material-symbols-outlined text-[20px] text-[#3525cd] shrink-0 pl-1.5">
            add_circle
          </span>
          <input
            type="text"
            value={quickTaskText}
            onChange={(e) => setQuickTaskText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTask()}
            placeholder="Type new task and press Enter..."
            className="w-full bg-transparent text-[13px] text-[#0b1c30] outline-none placeholder:text-[#565e74]/60"
          />
          <button
            type="button"
            onClick={handleCreateTask}
            className="shrink-0 px-3 py-1 rounded-lg bg-[#e2dfff] text-[#0f0069] text-[12px] font-bold hover:bg-[#3525cd] hover:text-white transition-colors"
          >
            Create
          </button>
        </div>

        {/* Integrations & Bulk Push Grid */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] text-[#565e74] font-bold uppercase tracking-wider">
              Sync To Workspace
            </span>
            <span className="font-mono text-[11px] text-[#565e74]">
              1-Click Dispatch
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleExport('Linear')}
              className="p-3 rounded-2xl bg-white hover:bg-[#eff4ff] shadow-xs border border-[#c7c4d8]/40 flex flex-col items-center justify-center gap-1.5 transition-all text-center group active:scale-98"
            >
              <span className="w-8 h-8 rounded-xl bg-[#e2dfff] flex items-center justify-center text-[#3525cd] group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[18px]">
                  view_kanban
                </span>
              </span>
              <span className="text-[12px] font-bold text-[#0b1c30]">Linear</span>
              <span className="font-mono text-[10px] text-[#565e74]">
                Push {data.action_items.length} issues
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleExport('Jira')}
              className="p-3 rounded-2xl bg-white hover:bg-[#eff4ff] shadow-xs border border-[#c7c4d8]/40 flex flex-col items-center justify-center gap-1.5 transition-all text-center group active:scale-98"
            >
              <span className="w-8 h-8 rounded-xl bg-[#dae2fd] flex items-center justify-center text-[#4f46e5] group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[18px]">
                  splitscreen
                </span>
              </span>
              <span className="text-[12px] font-bold text-[#0b1c30]">Jira</span>
              <span className="font-mono text-[10px] text-[#565e74]">
                Sync Backlog
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleExport('Notion')}
              className="p-3 rounded-2xl bg-white hover:bg-[#eff4ff] shadow-xs border border-[#c7c4d8]/40 flex flex-col items-center justify-center gap-1.5 transition-all text-center group active:scale-98"
            >
              <span className="w-8 h-8 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#0b1c30] group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[18px]">
                  menu_book
                </span>
              </span>
              <span className="text-[12px] font-bold text-[#0b1c30]">Notion</span>
              <span className="font-mono text-[10px] text-[#565e74]">
                Embed Board
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Warning / Resolution Banner (Fixed above bottom navigation) */}
      <div className="fixed bottom-20 left-3 right-3 max-w-xl mx-auto z-40">
        {attentionItems.length > 0 ? (
          <div className="p-3 rounded-2xl bg-[#0b1c30] text-white shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md border border-white/10 transition-all">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[20px] text-amber-400 shrink-0 animate-pulse">
                warning
              </span>
              <span className="text-[12px] font-medium truncate text-[#f8f9ff]">
                {attentionItems.length} item{attentionItems.length > 1 ? 's need' : ' needs'} owner or deadline resolution before export
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFilter('attention')}
              className="shrink-0 px-3 py-1 rounded-xl bg-amber-400 text-[#131b2e] text-[12px] font-bold hover:bg-amber-300 transition-colors shadow-sm active:scale-95"
            >
              Review Now
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-700 text-white shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md border border-emerald-500/30 transition-all">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-[20px] text-emerald-200 shrink-0">
                check_circle
              </span>
              <span className="text-[12px] font-semibold truncate text-white">
                All task metadata resolved! Ready for 1-click export.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleExport('Linear')}
              className="shrink-0 px-3 py-1 rounded-xl bg-white text-emerald-950 text-[12px] font-bold hover:bg-emerald-50 transition-colors shadow-sm active:scale-95"
            >
              Export Now
            </button>
          </div>
        )}
      </div>

      {/* Sync/Export Modal */}
      {syncModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-[#c7c4d8]/40 flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#eff4ff] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#e2dfff] flex items-center justify-center text-[#3525cd]">
                  <span className="material-symbols-outlined text-[20px]">
                    cloud_sync
                  </span>
                </span>
                <div>
                  <h3 className="text-[16px] font-bold text-[#0b1c30]">
                    Export to {syncModalOpen}
                  </h3>
                  <p className="text-[11px] text-[#565e74]">
                    Syncing {data.action_items.length} actionable items
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSyncModalOpen(null)}
                className="w-8 h-8 rounded-full hover:bg-[#eff4ff] flex items-center justify-center text-[#565e74]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {data.action_items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl bg-[#eff4ff] border border-[#dae2fd]/60 text-[12px] flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="font-semibold text-[#0b1c30]">{item.task}</div>
                    <div className="text-[11px] text-[#565e74] mt-0.5">
                      Assignee: {item.owner || 'Unassigned'} • Due: {item.deadline || 'None'}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-[#3525cd] bg-white px-1.5 py-0.5 rounded shadow-2xs">
                    #{idx + 1}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSyncModalOpen(null);
                  showToast(`Successfully pushed to ${syncModalOpen}!`);
                }}
                className="flex-1 h-11 rounded-xl bg-[#3525cd] hover:bg-[#4f46e5] text-white font-semibold text-[13px] transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>Dispatch to {syncModalOpen}</span>
              </button>
              <button
                type="button"
                onClick={() => setSyncModalOpen(null)}
                className="h-11 px-4 rounded-xl bg-[#eff4ff] hover:bg-[#e5eeff] text-[#565e74] font-semibold text-[13px] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
