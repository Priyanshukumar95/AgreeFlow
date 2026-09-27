export type ScreenType = 'paste' | 'analysis' | 'action-plan';

export interface DecisionItem {
  id: string;
  text: string;
  source_sentence: string;
  speaker?: string;
  timestamp?: string;
}

export interface SuggestionItem {
  id: string;
  text: string;
  source_sentence: string;
  speaker?: string;
  timestamp?: string;
  addedToTasks?: boolean;
}

export interface OpenQuestionItem {
  id: string;
  text: string;
  source_sentence: string;
  speaker?: string;
  timestamp?: string;
  resolved?: boolean;
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string | null;
  deadline: string | null;
  owner_missing: boolean;
  deadline_missing: boolean;
  source_sentence: string;
  speaker?: string;
  timestamp?: string;
  completed?: boolean;
}

export interface AnalysisData {
  title: string;
  wordCount: number;
  rawNotes: string;
  analyzedAt: string;
  decisions: DecisionItem[];
  suggestions: SuggestionItem[];
  open_questions: OpenQuestionItem[];
  action_items: ActionItem[];
}
