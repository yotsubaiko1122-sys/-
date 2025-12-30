

import { Word, LearningProgress } from '../types';
import { RAW_DATA_STRING } from './wordData';
import { isMastered } from './storage';

/**
 * Parses the raw tab-separated data into Word objects
 */
export const parseData = (): Word[] => {
  const lines = RAW_DATA_STRING.trim().split('\n');
  // Explicitly typing the map return to Word | null fixes the type predicate assignment error
  return lines.map((line): Word | null => {
    const parts = line.split('\t');
    if (parts.length >= 3) {
      return {
        id: parseInt(parts[0], 10),
        en: parts[1],
        ja: parts[2],
        explanation: parts[3] || "" // 4th column is explanation
      };
    }
    return null;
  }).filter((item): item is Word => item !== null);
};

/**
 * Fisher-Yates shuffle algorithm
 */
export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Gets words by specific ID range
 */
export const getWordsByIds = (allWords: Word[], startId: number, endId: number): Word[] => {
  return allWords.filter(w => w.id >= startId && w.id <= endId);
};

/**
 * Generates the final quiz list based on configuration
 */
export const generateQuizList = (
  allWords: Word[], 
  targetIds: number[],
  mode: 'normal' | 'weak' | 'intensive',
  progress: LearningProgress
): Word[] => {
  let candidateWords = allWords.filter(w => targetIds.includes(w.id));
  
  if (mode === 'intensive') {
    // Filter strictly negative scores (Troubled items)
    candidateWords = candidateWords.filter(w => (progress[w.id] || 0) < 0);
    candidateWords.sort((a, b) => (progress[a.id] || 0) - (progress[b.id] || 0));
    
  } else if (mode === 'weak') {
    // Unmastered (Score < 3)
    candidateWords = candidateWords.filter(w => !isMastered(progress[w.id] || 0));
    candidateWords.sort((a, b) => (progress[a.id] || 0) - (progress[b.id] || 0));
  } else {
    // Normal mode: Shuffle
    candidateWords = shuffleArray(candidateWords);
  }

  return candidateWords;
};
