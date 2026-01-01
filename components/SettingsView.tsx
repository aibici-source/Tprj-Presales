
import React, { useState, useEffect } from 'react';
import { BantWeights } from '../types';

interface SettingsViewProps {
  initialWeights: BantWeights;
  onSave: (weights: BantWeights) => void;
  onCancel: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ initialWeights, onSave, onCancel }) => {
  const [weights, setWeights] = useState<BantWeights>(initialWeights);
  const [error, setError] = useState<string | null>(null);

  const total = weights.budget + weights.authority + weights.need + weights.timeline + weights.competition;

  const handleChange = (name: keyof BantWeights, value: string) => {
    const numValue = parseInt(value) || 0;
    if (numValue > 30) {
      setError('각 항목의 최고점은 30점을 초과할 수 없습니다.');
      return;
    }
    setError(null);
    setWeights(prev => ({ ...prev, [name]: numValue }));
  };

  const handleSave = () => {
    if (total !== 100) {
      setError('항목 배점의 총합은 반드시 100점이어야 합니다.');
      return;
    }
    onSave(weights);
  };

  const inputGroupClass = "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between";
  const inputClass = "w-20 px-3 py-2 text-right font-black text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none";

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="text-center">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">배점 설정 관리</h2>
        <p className="text-slate-500 font-medium mt-2">BANT 평가 항목별 가중치를 조정하여 비즈니스 환경에 최적화하세요.</p>
      </header>

      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-indigo-700">현재 총점</p>
          <p className="text-xs text-indigo-500">총합은 반드시 100이어야 합니다.</p>
        </div>
        <div className={`text-4xl font-black ${total === 100 ? 'text-indigo-600' : 'text-rose-500'}`}>
          {total} <span className="text-lg">/ 100</span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-700 text-sm font-bold flex items-center gap-3">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div className={inputGroupClass}>
          <div className="flex items-center gap-4">
            <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">B</span>
            <div>
              <p className="font-bold text-slate-900">Budget (예산)</p>
              <p className="text-xs text-slate-400">구체적인 예산 책정 여부 가중치</p>
            </div>
          </div>
          <input 
            type="number" 
            max={30}
            value={weights.budget} 
            onChange={(e) => handleChange('budget', e.target.value)}
            className={inputClass}
          />
        </div>

        <div className={inputGroupClass}>
          <div className="flex items-center gap-4">
            <span className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">A</span>
            <div>
              <p className="font-bold text-slate-900">Authority (권한)</p>
              <p className="text-xs text-slate-400">의사결정권자 영업라인 확보 가중치</p>
            </div>
          </div>
          <input 
            type="number" 
            max={30}
            value={weights.authority} 
            onChange={(e) => handleChange('authority', e.target.value)}
            className={inputClass}
          />
        </div>

        <div className={inputGroupClass}>
          <div className="flex items-center gap-4">
            <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">N</span>
            <div>
              <p className="font-bold text-slate-900">Needs (니즈)</p>
              <p className="text-xs text-slate-400">페인포인트 명확성 및 해결가능성 가중치</p>
            </div>
          </div>
          <input 
            type="number" 
            max={30}
            value={weights.need} 
            onChange={(e) => handleChange('need', e.target.value)}
            className={inputClass}
          />
        </div>

        <div className={inputGroupClass}>
          <div className="flex items-center gap-4">
            <span className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">T</span>
            <div>
              <p className="font-bold text-slate-900">Timeline (시기)</p>
              <p className="text-xs text-slate-400">도입 시기 구체성 가중치</p>
            </div>
          </div>
          <input 
            type="number" 
            max={30}
            value={weights.timeline} 
            onChange={(e) => handleChange('timeline', e.target.value)}
            className={inputClass}
          />
        </div>

        <div className={inputGroupClass}>
          <div className="flex items-center gap-4">
            <span className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">C</span>
            <div>
              <p className="font-bold text-slate-900">Competition (경쟁)</p>
              <p className="text-xs text-slate-400">수주 가능성 및 경쟁 현황 가중치</p>
            </div>
          </div>
          <input 
            type="number" 
            max={30}
            value={weights.competition} 
            onChange={(e) => handleChange('competition', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
        >
          취소
        </button>
        <button
          onClick={handleSave}
          className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
        >
          설정 저장하기
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
