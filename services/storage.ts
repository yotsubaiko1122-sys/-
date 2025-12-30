
import { LearningProgress } from '../types';

const CURRENT_VERSION_KEY = 'nihonshi_history_v1';
const TIMESTAMPS_KEY = 'nihonshi_timestamps_v1';

type ProgressTimestamps = {
  [wordId: number]: number;
};

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const getProgress = (): LearningProgress => {
  try {
    let progress: LearningProgress = {};
    let timestamps: ProgressTimestamps = {};
    let needsSave = false;

    const currentDataStr = localStorage.getItem(CURRENT_VERSION_KEY);
    if (currentDataStr) {
      progress = JSON.parse(currentDataStr);
    }

    const timestampStr = localStorage.getItem(TIMESTAMPS_KEY);
    if (timestampStr) {
      timestamps = JSON.parse(timestampStr);
    } else {
      const now = Date.now();
      Object.keys(progress).forEach(key => {
        timestamps[parseInt(key)] = now;
      });
      if (Object.keys(progress).length > 0) needsSave = true;
    }

    const now = Date.now();
    let decayApplied = false;

    Object.keys(progress).forEach((key) => {
      const id = parseInt(key);
      const score = progress[id];
      const lastTime = timestamps[id] || now;
      
      if (score > 0) {
        const elapsed = now - lastTime;
        const weeksPassed = Math.floor(elapsed / ONE_WEEK_MS);

        if (weeksPassed >= 1) {
          const newScore = Math.max(0, score - weeksPassed);
          if (newScore !== score) {
            progress[id] = newScore;
            timestamps[id] = now; 
            decayApplied = true;
          }
        }
      }
    });

    if (needsSave || decayApplied) {
      localStorage.setItem(CURRENT_VERSION_KEY, JSON.stringify(progress));
      localStorage.setItem(TIMESTAMPS_KEY, JSON.stringify(timestamps));
    }

    return progress;
  } catch (e) {
    console.error('Failed to load progress', e);
    return {};
  }
};

export const updateWordProgress = (wordId: number, isKnown: boolean) => {
  try {
    const current = getProgress();
    const currentScore = current[wordId] || 0;
    let newScore = isKnown ? currentScore + 1 : currentScore - 1;
    const updatedProgress = { ...current, [wordId]: newScore };
    
    let timestamps: ProgressTimestamps = {};
    const timestampStr = localStorage.getItem(TIMESTAMPS_KEY);
    if (timestampStr) {
      timestamps = JSON.parse(timestampStr);
    }
    timestamps[wordId] = Date.now();

    localStorage.setItem(CURRENT_VERSION_KEY, JSON.stringify(updatedProgress));
    localStorage.setItem(TIMESTAMPS_KEY, JSON.stringify(timestamps));
  } catch (e) {
    console.error('Failed to save progress', e);
  }
};

const MASTERY_THRESHOLD = 3;
export const isMastered = (score: number): boolean => score >= MASTERY_THRESHOLD;
export const getMasteryStatus = (score: number): 'mastered' | 'learning' | 'untouched' => {
  if (score >= MASTERY_THRESHOLD) return 'mastered';
  if (score > 0) return 'learning';
  return 'untouched';
};
