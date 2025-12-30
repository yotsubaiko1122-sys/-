
import React, { useState, useEffect } from 'react';
import { AppStatus, Word, QuizConfig } from './types';
import { parseData, generateQuizList } from './services/quizLogic';
import { getProgress } from './services/storage';
import MenuScreen from './components/MenuScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import HistoryScreen from './components/HistoryScreen';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.MENU);
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [currentQuizList, setCurrentQuizList] = useState<Word[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [quizLabel, setQuizLabel] = useState("");
  
  const [lastConfig, setLastConfig] = useState<QuizConfig | null>(null);

  useEffect(() => {
    setAllWords(parseData());
  }, []);

  const startQuiz = (ids: number[], mode: 'normal' | 'weak' | 'intensive', label: string) => {
    const progress = getProgress();
    const quizItems = generateQuizList(allWords, ids, mode, progress);
    
    if (quizItems.length === 0) {
      let message = "学習対象の問題がありません。";
      if (mode === 'weak') message += "（すべて習得済みです！）";
      if (mode === 'intensive') message += "（苦手な問題はありません！）";
      alert(message);
      return;
    }

    setCurrentQuizList(quizItems);
    setQuizLabel(label);
    setLastConfig({ mode, selectedIds: ids, label });
    setCurrentScore(0);
    setStatus(AppStatus.QUIZ);
  };

  const handleQuizComplete = (score: number) => {
    setCurrentScore(score);
    setStatus(AppStatus.RESULT);
  };

  const handleReturnToMenu = () => {
    setStatus(AppStatus.MENU);
    setCurrentQuizList([]);
    setCurrentScore(0);
  };

  const handleRetry = () => {
    if (lastConfig) {
      startQuiz(lastConfig.selectedIds, lastConfig.mode, lastConfig.label);
    }
  };

  const handleShowHistory = () => {
    setStatus(AppStatus.HISTORY);
  };

  return (
    <main className="flex-grow flex flex-col bg-stone-50 relative overflow-hidden min-h-screen font-sans">
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-amber-100/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-stone-200/50 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full flex-grow flex items-center justify-center overflow-y-auto">
        {status === AppStatus.MENU && (
          <MenuScreen
            onStartQuiz={startQuiz}
            onShowHistory={handleShowHistory}
          />
        )}

        {status === AppStatus.QUIZ && (
          <QuizScreen
            quizList={currentQuizList}
            fullWordList={allWords}
            onComplete={handleQuizComplete}
            onReturnToMenu={handleReturnToMenu}
          />
        )}

        {status === AppStatus.RESULT && (
          <ResultScreen
            score={currentScore}
            total={currentQuizList.length}
            onRetry={handleRetry}
            onReturnToMenu={handleReturnToMenu}
          />
        )}

        {status === AppStatus.HISTORY && (
          <HistoryScreen
            allWords={allWords}
            onReturnToMenu={handleReturnToMenu}
          />
        )}
      </div>
    </main>
  );
};

export default App;
