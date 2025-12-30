
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ResultScreenProps {
  score: number;
  total: number;
  onRetry: () => void;
  onReturnToMenu: () => void;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ score, total, onRetry, onReturnToMenu }) => {
  const percentage = Math.round((score / total) * 100);
  
  const data = [
    { name: 'Correct', value: score },
    { name: 'Incorrect', value: total - score },
  ];

  const COLORS = ['#22c55e', '#e7e5e4']; // Green-500 and Stone-200

  let message = "繰り返し復習して定着させましょう！";
  let messageColor = "text-stone-500";

  if (score === total) {
    message = "完璧です！このセットをマスターしました！㊗️";
    messageColor = "text-green-600";
  } else if (percentage >= 80) {
    message = "合格点です！間違えた箇所を確認しましょう！📝";
    messageColor = "text-amber-600";
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto p-6 min-h-[80vh]">
      <div className="bg-white w-full rounded-3xl shadow-xl p-8 text-center border border-stone-100">
        <h2 className="text-2xl font-bold text-stone-800 mb-6">学習完了</h2>
        
        <div className="h-64 w-full relative flex items-center justify-center mb-6">
           <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute flex flex-col items-center justify-center">
             <span className="text-5xl font-extrabold text-stone-800">{score}</span>
             <span className="text-sm text-stone-400 font-bold tracking-widest mt-1">正解 / {total}問</span>
          </div>
        </div>

        <p className={`text-lg font-bold mb-8 ${messageColor}`}>
          {message}
        </p>

        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-primary hover:bg-stone-800 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all duration-200 active:scale-95"
          >
            この範囲をもう一度
          </button>
          
          <button
            onClick={onReturnToMenu}
            className="w-full bg-white hover:bg-stone-50 text-stone-600 font-semibold py-4 px-6 rounded-2xl border border-stone-200 transition-all duration-200 active:scale-95"
          >
            メニューに戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
