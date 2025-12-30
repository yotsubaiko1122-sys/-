
import React, { useMemo, useState } from 'react';
import { Word } from '../types';
import { getProgress, isMastered } from '../services/storage';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface HistoryScreenProps {
  allWords: Word[];
  onReturnToMenu: () => void;
}

type TabType = 'weak' | 'learning' | 'mastered';

const HistoryScreen: React.FC<HistoryScreenProps> = ({ allWords, onReturnToMenu }) => {
  const [activeTab, setActiveTab] = useState<TabType>('weak');

  const { stats, categorizedWords } = useMemo(() => {
    const progress = getProgress();
    const weak: (Word & { score: number })[] = [];
    const learning: (Word & { score: number })[] = [];
    const mastered: (Word & { score: number })[] = [];
    let masteredCount = 0;
    let learningCount = 0;
    let weakCount = 0;

    allWords.forEach(word => {
      const score = progress[word.id] || 0;
      const wordWithScore = { ...word, score };
      if (isMastered(score)) {
        mastered.push(wordWithScore);
        masteredCount++;
      } else if (score > 0) {
        learning.push(wordWithScore);
        learningCount++;
      } else if (score < 0) {
        weak.push(wordWithScore);
        weakCount++;
      }
    });

    weak.sort((a, b) => a.score - b.score);
    learning.sort((a, b) => b.score - a.score);
    mastered.sort((a, b) => a.id - b.id);

    return {
      stats: {
        mastered: masteredCount,
        learning: learningCount,
        weak: weakCount,
        untouched: allWords.length - (masteredCount + learningCount + weakCount)
      },
      categorizedWords: { weak, learning, mastered }
    };
  }, [allWords]);

  const currentList = categorizedWords[activeTab];
  const handlePrint = () => window.print();

  const chartData = [
    { name: '習得完了', value: stats.mastered, color: '#22c55e' },
    { name: '学習中', value: stats.learning, color: '#f59e0b' },
    { name: '未着手', value: stats.untouched, color: '#e2e8f0' },
    { name: '苦手', value: stats.weak, color: '#ef4444' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 h-screen flex flex-col bg-stone-50 print:bg-white print:h-auto print:p-0 print:block">
      <div className="flex items-center justify-between mb-4 flex-shrink-0 print:hidden">
        <h2 className="text-2xl font-extrabold text-stone-800">学習履歴詳細</h2>
        <div className="flex gap-2">
          <button onClick={handlePrint} className="bg-stone-100 border border-stone-200 hover:bg-stone-200 text-stone-700 font-bold py-2 px-4 rounded-full shadow-sm text-sm">印刷</button>
          <button onClick={onReturnToMenu} className="bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 font-bold py-2 px-4 rounded-full shadow-sm text-sm">戻る</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 flex-shrink-0 print:hidden">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between md:col-span-1">
          <div className="w-24 h-24 relative">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={25} outerRadius={40} paddingAngle={2} dataKey="value" stroke="none">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-grow pl-4">
            <div className="text-xs text-stone-500 font-bold mb-1">総進捗</div>
            <div className="text-3xl font-extrabold text-stone-800">{Math.round((stats.mastered / allWords.length) * 100)}%</div>
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-3 gap-2">
          <div className="bg-green-50 p-3 rounded-2xl border border-green-100 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-green-600 mb-1">習得</span>
            <span className="text-2xl font-extrabold text-green-700">{stats.mastered}</span>
          </div>
          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-amber-600 mb-1">学習中</span>
            <span className="text-2xl font-extrabold text-amber-700">{stats.learning}</span>
          </div>
          <div className="bg-red-50 p-3 rounded-2xl border border-red-100 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-red-600 mb-1">苦手</span>
            <span className="text-2xl font-extrabold text-red-700">{stats.weak}</span>
          </div>
        </div>
      </div>

      <div className="flex p-1 bg-white rounded-xl border border-stone-200 mb-4 flex-shrink-0 print:hidden">
        {['weak', 'learning', 'mastered'].map((t) => (
          <button key={t} onClick={() => setActiveTab(t as TabType)} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === t ? 'bg-stone-100 text-stone-700' : 'text-stone-400'}`}>
            {t === 'weak' ? '苦手' : t === 'learning' ? '学習中' : '習得済み'}
          </button>
        ))}
      </div>

      <div className="flex-grow overflow-y-auto bg-white rounded-2xl shadow-sm border border-stone-200 p-2 print:overflow-visible">
        {currentList.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-stone-400 p-8 text-center">
            <p className="font-bold">データがありません</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50 print:divide-stone-300">
            <div className="flex p-2 border-b border-stone-400 font-bold text-xs text-stone-600">
              <div className="w-12">ID</div>
              <div className="flex-1">問題</div>
              <div className="w-32">解答</div>
            </div>
            {currentList.map((word) => (
              <div key={word.id} className="p-3 md:p-4 flex items-center hover:bg-stone-50 group print:break-inside-avoid">
                <div className="w-12 text-xs font-mono text-stone-400 flex-shrink-0">{word.id}</div>
                <div className="flex-grow min-w-0 pr-4">
                  <span className="text-sm md:text-base text-stone-800 line-clamp-2">{word.en}</span>
                </div>
                <div className="w-32 flex-shrink-0 text-sm font-bold text-stone-700">{word.ja}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryScreen;
