
import React, { useState, useEffect } from 'react';
import { BantData, BantWeights } from '../types';

interface BantFormProps {
  onSubmit: (data: BantData) => void;
  onCancel: () => void;
  isLoading: boolean;
  weights: BantWeights;
  initialData?: BantData;
}

const BantForm: React.FC<BantFormProps> = ({ onSubmit, onCancel, isLoading, weights, initialData }) => {
  const [formData, setFormData] = useState<BantData>({
    projectName: '',
    customerName: '',
    dealSize: '',
    budget: '',
    authority: '',
    need: '',
    timeline: '',
    competition: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none bg-white text-slate-900 placeholder:text-slate-400 text-sm md:text-base";
  const labelWrapperClass = "flex items-center justify-between w-full mb-3 gap-2 flex-wrap";

  // BANT 항목 렌더링 헬퍼 함수
  const renderBantItem = (
    key: keyof BantData, 
    label: string, 
    letter: string, 
    weight: number, 
    colorClass: string,
    placeholder: string
  ) => {
    const colorConfigs: Record<string, string> = {
      blue: "bg-blue-600 bg-blue-50 text-blue-700 border-blue-100",
      purple: "bg-purple-600 bg-purple-50 text-purple-700 border-purple-100",
      emerald: "bg-emerald-600 bg-emerald-50 text-emerald-700 border-emerald-100",
      orange: "bg-orange-600 bg-orange-50 text-orange-700 border-orange-100",
      rose: "bg-rose-600 bg-rose-50 text-rose-700 border-rose-100"
    };
    const [mainColor, bgCol, textCol, borderCol] = colorConfigs[colorClass].split(' ');

    return (
      <div className="group bg-slate-50/50 p-5 md:p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all hover:bg-white hover:shadow-md">
        <div className={labelWrapperClass}>
          <div className="flex items-center gap-2">
            <span className={`${mainColor} text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black uppercase shadow-sm`}>{letter}</span>
            <span className="text-base font-black text-slate-900">{label}</span>
          </div>
          <div className={`${bgCol} ${textCol} ${borderCol} px-3 py-1 rounded-full text-[11px] font-black border`}>
            배점: {weight}점
          </div>
        </div>
        <textarea
          required
          name={key}
          rows={2}
          value={formData[key as keyof BantData] as string}
          onChange={handleChange}
          placeholder={placeholder}
          className={inputClass}
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 기본 정보 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600 ml-1">
            <i className="fas fa-building text-indigo-500 w-4 text-center"></i> 고객사
          </label>
          <input
            required
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="예: (주)에이아이솔루션"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600 ml-1">
            <i className="fas fa-project-diagram text-indigo-500 w-4 text-center"></i> 프로젝트명
          </label>
          <input
            required
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            placeholder="예: 클라우드 인프라 고도화"
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-600 ml-1">
            <i className="fas fa-hand-holding-usd text-indigo-500 w-4 text-center"></i> 예상 규모
          </label>
          <input
            required
            name="dealSize"
            value={formData.dealSize}
            onChange={handleChange}
            placeholder="예: 2억원"
            className={inputClass}
          />
        </div>
      </div>

      <div className="h-px bg-slate-100 w-full"></div>

      {/* BANT 평가 항목 섹션 */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-2">
          <i className="fas fa-clipboard-check text-indigo-600"></i> BANT 세부 현황 입력
        </h3>

        {renderBantItem('budget', 'Budget (예산)', 'B', weights.budget, 'blue', '구체적인 예산이 책정되었나요?')}
        {renderBantItem('authority', 'Authority (권한)', 'A', weights.authority, 'purple', '의사결정권자(Key Man)와 소통 채널이 확보되었나요?')}
        {renderBantItem('need', 'Needs (니즈)', 'N', weights.need, 'emerald', '고객의 Pain Point가 명확하며 우리가 해결 가능한가요?')}
        {renderBantItem('timeline', 'Timeline (시기)', 'T', weights.timeline, 'orange', '도입 시기가 6개월 이내로 구체적인가요?')}
        {renderBantItem('competition', 'Competition (경쟁)', 'C', weights.competition, 'rose', '실질적 수주 가능성 및 경쟁사 현황은 어떠한가요?')}
      </div>

      {/* 하단 버튼 섹션 */}
      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:flex-1 py-4 px-6 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
        >
          목록으로 돌아가기
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full sm:flex-[2] py-4 px-6 rounded-2xl font-black text-white shadow-xl transition-all flex items-center justify-center gap-3 text-lg ${
            isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95'
          }`}
        >
          {isLoading ? (
            <><i className="fas fa-circle-notch animate-spin"></i> 분석 중...</>
          ) : (
            <><i className="fas fa-shield-check"></i> {initialData ? '업데이트 정보로 재검증' : '영업 품질 검증 시작'}</>
          )}
        </button>
      </div>
    </form>
  );
};

export default BantForm;
