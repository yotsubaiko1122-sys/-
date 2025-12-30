
import React, { useState, useRef, useCallback } from 'react';
import { Word } from '../types';
import { updateWordProgress } from '../services/storage';

interface QuizScreenProps {
  quizList: Word[];
  fullWordList: Word[];
  onComplete: (score: number) => void;
  onReturnToMenu: () => void;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ quizList, onComplete, onReturnToMenu }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDraggingVisual, setIsDraggingVisual] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentWord = quizList[currentIndex];
  const totalQuestions = quizList.length;

  const SWIPE_THRESHOLD = 80; 
  const TAP_TIMEOUT = 250; // ms to distinguish tap from drag

  const handlePointerDown = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    if (exitDirection) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    dragStartRef.current = { x: clientX, y: clientY, time: Date.now() };
    isDraggingRef.current = true;
    setIsDraggingVisual(true);
  };

  const handlePointerMove = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current || !dragStartRef.current || exitDirection) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragOffset({ x: clientX - dragStartRef.current.x, y: clientY - dragStartRef.current.y });
  };

  const processResult = useCallback((isKnown: boolean) => {
    if (currentWord) updateWordProgress(currentWord.id, isKnown);
    if (isKnown) setSessionScore(prev => prev + 1);

    setExitDirection(null);
    setDragOffset({ x: 0, y: 0 });
    dragStartRef.current = null;
    isDraggingRef.current = false;
    setIsDraggingVisual(false);
    setIsFlipped(false);

    if (currentIndex < totalQuestions - 1) setCurrentIndex(prev => prev + 1);
    else onComplete(sessionScore + (isKnown ? 1 : 0));
  }, [currentWord, currentIndex, totalQuestions, onComplete, sessionScore]);

  const triggerSwipe = (direction: 'left' | 'right') => {
    setExitDirection(direction);
    setTimeout(() => processResult(direction === 'right'), 300);
  };

  const handlePointerUp = (e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    if (!isDraggingRef.current || !dragStartRef.current || exitDirection) return;
    
    const dragDuration = Date.now() - dragStartRef.current.time;
    const dragDistance = Math.abs(dragOffset.x);

    // Distinguish between flip (tap) and swipe
    if (dragDistance < 10 && dragDuration < TAP_TIMEOUT) {
      // It's a tap
      setIsFlipped(prev => !prev);
      setDragOffset({ x: 0, y: 0 });
    } else if (dragOffset.x > SWIPE_THRESHOLD) {
      triggerSwipe('right');
    } else if (dragOffset.x < -SWIPE_THRESHOLD) {
      triggerSwipe('left');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }

    dragStartRef.current = null;
    isDraggingRef.current = false;
    setIsDraggingVisual(false);
  };

  const opacityRight = Math.min(Math.max(dragOffset.x / (SWIPE_THRESHOLD * 1.5), 0), 1);
  const opacityLeft = Math.min(Math.max(-dragOffset.x / (SWIPE_THRESHOLD * 1.5), 0), 1);

  const getCardStyle = () => {
    if (exitDirection === 'right') return { transform: 'translate(120%, 0px)', opacity: 0, transition: 'transform 0.2s ease-in, opacity 0.2s ease-in' };
    if (exitDirection === 'left') return { transform: 'translate(-120%, 0px)', opacity: 0, transition: 'transform 0.2s ease-in, opacity 0.2s ease-in' };
    return { transform: `translate(${dragOffset.x}px, 0px)`, cursor: isDraggingVisual ? 'grabbing' : 'grab', transition: isDraggingVisual ? 'none' : 'transform 0.3s ease-out' };
  };

  if (!currentWord) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-4 min-h-[85vh] overflow-hidden relative">
      <div className="w-full flex justify-between items-center mb-4 px-2" style={{ opacity: exitDirection ? 0.5 : 1 }}>
        <span className="text-stone-400 font-bold text-sm">{currentIndex + 1} / {totalQuestions}</span>
        <div className="flex-grow mx-4 bg-stone-200 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${((currentIndex) / totalQuestions) * 100}%` }}></div>
        </div>
        <button onClick={onReturnToMenu} className="text-stone-400 hover:text-stone-600 text-xs font-bold px-3 py-2 bg-stone-100 rounded-lg">
          中断する
        </button>
      </div>

      <div className="relative w-full aspect-[4/5] perspective-1000">
        <div className="absolute inset-0 flex items-center justify-between px-8 pointer-events-none z-0">
           <div className="text-4xl font-bold text-red-400 border-4 border-red-400 rounded-full w-20 h-20 flex items-center justify-center opacity-0" style={{ opacity: opacityLeft }}>✕</div>
           <div className="text-4xl font-bold text-green-500 border-4 border-green-500 rounded-full w-20 h-20 flex items-center justify-center opacity-0" style={{ opacity: opacityRight }}>◯</div>
        </div>

        <div
          ref={cardRef}
          className="absolute inset-0 w-full h-full bg-white rounded-3xl shadow-2xl border border-stone-100 z-10 select-none touch-none overflow-hidden"
          style={getCardStyle()}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center transition-transform duration-500" style={{ transformStyle: 'preserve-3d' }}>
            {/* FRONT SIDE (Question) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center backface-hidden bg-white rounded-3xl p-8"
                 style={{ backfaceVisibility: 'hidden', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.4s' }}>
              <div className="absolute top-6 left-6 text-stone-200 font-bold text-xl">{currentWord.id}</div>
              <span className="text-stone-400 text-sm font-bold uppercase tracking-widest mb-4">問題</span>
              <h2 className="text-xl md:text-2xl font-bold text-stone-800 text-center leading-relaxed break-words max-w-full">{currentWord.en}</h2>
              <div className="mt-auto text-stone-300 text-xs font-medium">タップで解答を表示</div>
            </div>

            {/* BACK SIDE (Answer + Explanation) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center backface-hidden bg-stone-50 rounded-3xl p-6"
                 style={{ backfaceVisibility: 'hidden', transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)', transition: 'transform 0.4s' }}>
              <div className="absolute top-6 left-6 text-stone-200 font-bold text-xl">{currentWord.id}</div>
              <span className="text-primary text-sm font-bold uppercase tracking-widest mb-2">解答</span>
              <h2 className="text-3xl font-extrabold text-stone-800 text-center break-words max-w-full mb-6">{currentWord.ja}</h2>
              
              {currentWord.explanation && (
                <div className="w-full bg-white/60 p-4 rounded-xl border border-stone-200 text-left">
                  <span className="text-[10px] font-black text-stone-400 uppercase tracking-tighter block mb-1">解説</span>
                  <p className="text-sm text-stone-600 leading-relaxed italic">{currentWord.explanation}</p>
                </div>
              )}
              
              <div className="mt-auto text-stone-300 text-xs font-medium">タップで問題に戻る</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex w-full justify-between items-center px-4 text-stone-500">
        <div className={`flex flex-col items-center transition-all duration-300 ${exitDirection === 'left' ? 'scale-125' : 'scale-100'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-1 ${exitDirection === 'left' ? 'bg-red-500 text-white shadow-lg' : 'bg-red-50 text-red-500'}`}>←</div>
          <span className="text-xs font-bold">まだ不安</span>
        </div>
        <div className="text-xs text-stone-400 font-medium text-center opacity-70">
          <p>タップで反転</p>
          <p>左右スワイプで仕分け</p>
        </div>
        <div className={`flex flex-col items-center transition-all duration-300 ${exitDirection === 'right' ? 'scale-125' : 'scale-100'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-1 ${exitDirection === 'right' ? 'bg-green-500 text-white shadow-lg' : 'bg-green-50 text-green-600'}`}>→</div>
          <span className="text-xs font-bold">覚えた</span>
        </div>
      </div>
    </div>
  );
};

export default QuizScreen;
