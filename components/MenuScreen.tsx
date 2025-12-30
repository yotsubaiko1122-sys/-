
import React, { useMemo, useEffect, useState } from 'react';
import { getProgress, isMastered } from '../services/storage';
// CHAPTERS is exported from services/wordData.ts, not types.ts
import { LearningProgress, StudySet } from '../types';
import { CHAPTERS } from '../services/wordData';

interface MenuScreenProps {
  onStartQuiz: (ids: number[], mode: 'normal' | 'weak' | 'intensive', label: string) => void;
  onShowHistory: () => void;
}

const MenuScreen: React.FC<MenuScreenProps> = ({ onStartQuiz, onShowHistory }) => {
  const [progress, setProgress] = useState<LearningProgress>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['s1']));

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const toggleSection = (sectionId: string) => {
    const next = new Set(expandedSections);
    if (next.has(sectionId)) next.delete(sectionId);
    else next.add(sectionId);
    setExpandedSections(next);
  };

  const getSetStats = (set: StudySet) => {
    const ids: number[] = [];
    for (let i = set.range[0]; i <= set.range[1]; i++) ids.push(i);
    
    let masteredCount = 0;
    let learningCount = 0;
    let intensiveCount = 0;
    
    ids.forEach(id => {
      const score = progress[id] || 0;
      if (isMastered(score)) masteredCount++;
      else if (score > 0) learningCount++;
      else if (score < 0) intensiveCount++;
    });

    return {
      ids,
      masteredCount,
      learningCount,
      intensiveCount,
      total: ids.length,
      masteredPct: (masteredCount / ids.length) * 100
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 flex flex-col min-h-screen bg-stone-50">
      <div className="text-center mb-8 pt-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-stone-800 mb-2 tracking-tighter">
          日本史一問一答
        </h1>
        <div className="inline-block px-4 py-1 bg-primary text-white text-sm font-bold rounded-full mb-4">
          標準コース
        </div>
        <div className="flex justify-center gap-4">
          <button 
            onClick={onShowHistory}
            className="text-sm font-bold text-stone-600 hover:text-primary transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            学習状況
          </button>
        </div>
      </div>

      {CHAPTERS.map(chapter => (
        <div key={chapter.id} className="mb-8">
          <div className="flex items-center gap-3 mb-6">
             <div className="h-px flex-grow bg-stone-300"></div>
             <h2 className="text-xl font-black text-stone-500 uppercase tracking-widest px-2">{chapter.title}</h2>
             <div className="h-px flex-grow bg-stone-300"></div>
          </div>

          <div className="space-y-4">
            {chapter.sections.map(section => (
              <div key={section.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <button 
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 text-xs font-bold">
                      {section.id.replace('s', '')}
                    </div>
                    <h3 className="text-lg font-bold text-stone-800">{section.title}</h3>
                  </div>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 text-stone-400 transition-transform ${expandedSections.has(section.id) ? 'rotate-180' : ''}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {expandedSections.has(section.id) && (
                  <div className="px-6 pb-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.sets.map(set => {
                      const stats = getSetStats(set);
                      return (
                        <div key={set.id} className="p-4 border border-stone-100 rounded-xl bg-stone-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col group">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-stone-800 leading-tight mb-1">{set.title}</h4>
                              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">問{set.range[0]} ～ 問{set.range[1]} ({stats.total}問)</p>
                            </div>
                            {stats.masteredPct === 100 && (
                               <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">完了</span>
                            )}
                          </div>

                          <div className="w-full bg-stone-200 h-1.5 rounded-full mb-4 overflow-hidden">
                            <div className="h-full bg-green-500 transition-all duration-700" style={{ width: `${stats.masteredPct}%` }}></div>
                          </div>

                          <div className="flex gap-2 mt-auto">
                            <button
                              onClick={() => onStartQuiz(stats.ids, 'normal', set.title)}
                              className="flex-1 py-2 text-xs font-bold bg-primary text-white rounded-lg hover:bg-stone-800 transition-colors shadow-sm"
                            >
                              開始
                            </button>
                            <button
                              disabled={stats.total === stats.masteredCount}
                              onClick={() => onStartQuiz(stats.ids, 'weak', set.title)}
                              className="flex-1 py-2 text-xs font-bold border border-amber-200 text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-30"
                            >
                              弱点
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div className="h-20 flex-shrink-0"></div>
    </div>
  );
};

export default MenuScreen;
