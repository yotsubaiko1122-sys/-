
export interface Word {
  id: number;
  en: string; // This is the Question text in our Nihonshi context
  ja: string; // This is the Answer text in our Nihonshi context
  explanation?: string; // Optional brief commentary
}

export enum AppStatus {
  MENU = 'MENU',
  QUIZ = 'QUIZ',
  RESULT = 'RESULT',
  HISTORY = 'HISTORY',
}

export interface LearningProgress {
  [wordId: number]: number; // score
}

export interface QuizConfig {
  mode: 'normal' | 'weak' | 'intensive';
  selectedIds: number[];
  label: string;
}

export interface StudySet {
  id: string;
  title: string;
  range: [number, number]; // [startId, endId] inclusive
}

export interface Section {
  id: string;
  title: string;
  sets: StudySet[];
}

export interface Chapter {
  id: string;
  title: string;
  sections: Section[];
}
