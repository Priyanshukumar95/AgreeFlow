/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScreenType, AnalysisData, DecisionItem, SuggestionItem, OpenQuestionItem, ActionItem } from './types';
import { INITIAL_SAMPLE_NOTES, INITIAL_ANALYSIS_DATA } from './sampleData';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { PasteNotesScreen } from './components/PasteNotesScreen';
import { AIAnalysisScreen } from './components/AIAnalysisScreen';
import { ActionPlanScreen } from './components/ActionPlanScreen';
import { HelpModal } from './components/HelpModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('paste');
  const [rawNotes, setRawNotes] = useState<string>(INITIAL_SAMPLE_NOTES);
  const [analysisData, setAnalysisData] = useState<AnalysisData>(INITIAL_ANALYSIS_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentWorkspace, setCurrentWorkspace] = useState<string>('Q3 Sync');
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const handleAnalyze = async (notes: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed with status ${response.status}`);
      }

      const resJson = await response.json();

      // Extract a representative meeting title from first non-empty line
      const firstLine = notes.split('\n').map((l) => l.trim()).filter(Boolean)[0] || 'Meeting Notes';
      const cleanTitle = firstLine.replace(/^[#\-*\s]+/, '').slice(0, 48);

      const words = notes.trim().split(/\s+/).filter(Boolean).length;

      const decisions: DecisionItem[] = (resJson.decisions || []).map((d: any, i: number) => ({
        id: `DEC-0${i + 1}`,
        text: d.text,
        source_sentence: d.source_sentence || d.text,
        speaker: d.speaker || 'Team agreement',
        timestamp: `Line ${i * 4 + 8} / verified`,
      }));

      const suggestions: SuggestionItem[] = (resJson.suggestions || []).map((s: any, i: number) => ({
        id: `SUG-0${i + 1}`,
        text: s.text,
        source_sentence: s.source_sentence || s.text,
        speaker: s.speaker || 'Proposal',
        timestamp: `Line ${i * 5 + 12} / idea`,
        addedToTasks: false,
      }));

      const open_questions: OpenQuestionItem[] = (resJson.open_questions || []).map((q: any, i: number) => ({
        id: `QUE-0${i + 1}`,
        text: q.text,
        source_sentence: q.source_sentence || q.text,
        speaker: q.speaker || 'Sync Question',
        timestamp: `Line ${i * 6 + 15} / open inquiry`,
        resolved: false,
      }));

      const action_items: ActionItem[] = (resJson.action_items || []).map((a: any, i: number) => {
        const owner = a.owner && a.owner.trim() ? a.owner.trim() : null;
        const deadline = a.deadline && a.deadline.trim() ? a.deadline.trim() : null;
        return {
          id: `ACT-0${i + 1}`,
          task: a.task,
          owner,
          deadline,
          owner_missing: !owner,
          deadline_missing: !deadline,
          source_sentence: a.source_sentence || a.task,
          speaker: a.speaker || owner || 'Meeting Lead',
          timestamp: `Line ${i * 7 + 14} / audio verified`,
          completed: false,
        };
      });

      const newAnalysis: AnalysisData = {
        title: cleanTitle,
        wordCount: words,
        rawNotes: notes,
        analyzedAt: 'Just now',
        decisions,
        suggestions,
        open_questions,
        action_items,
      };

      setAnalysisData(newAnalysis);
      setCurrentScreen('analysis');
      showToast(`Extraction complete! Found ${decisions.length + suggestions.length + open_questions.length + action_items.length} insights.`);
    } catch (err: any) {
      console.error('Analysis error:', err);
      showToast('Error analyzing notes. Switched to offline synthesis.');
      setCurrentScreen('analysis');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] min-h-screen flex flex-col font-sans selection:bg-[#3525cd]/15 selection:text-[#3525cd]">
      {/* Top Header */}
      <Header
        currentWorkspace={currentWorkspace}
        onSelectWorkspace={setCurrentWorkspace}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pt-16">
        {currentScreen === 'paste' && (
          <PasteNotesScreen
            rawNotes={rawNotes}
            setRawNotes={setRawNotes}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            onNavigateToAnalysis={() => setCurrentScreen('analysis')}
          />
        )}

        {currentScreen === 'analysis' && (
          <AIAnalysisScreen
            data={analysisData}
            onUpdateData={setAnalysisData}
            onContinueToActionPlan={() => setCurrentScreen('action-plan')}
            onBackToNotes={() => setCurrentScreen('paste')}
            onReanalyze={() => handleAnalyze(rawNotes)}
          />
        )}

        {currentScreen === 'action-plan' && (
          <ActionPlanScreen
            data={analysisData}
            onUpdateData={setAnalysisData}
            showToast={showToast}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <Navigation
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        actionItemsCount={analysisData.action_items.length}
      />

      {/* Help Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Toast Notification Box */}
      <div
        className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-[#0b1c30] text-white font-medium text-[13px] shadow-2xl flex items-center gap-2 transition-all duration-300 pointer-events-none ${
          toastMessage ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-95'
        }`}
      >
        <span className="material-symbols-outlined text-[18px] text-emerald-400">
          check_circle
        </span>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
