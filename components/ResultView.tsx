
import React from 'react';
import { BantEvaluation, SalesProject, BantWeights } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';

interface ResultViewProps {
  evaluation: BantEvaluation;
  project: SalesProject;
  weights: BantWeights;
  onReset: () => void;
  onRevalidate: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ evaluation, project, weights, onReset, onRevalidate }) => {
  
  // 항목명에 따른 정확한 배점 매칭 로직
  const getWeightForItem = (item: string) => {
    const text = item.toLowerCase();
    if (text.includes('budget') || text.includes('예산')) return weights.budget;
    if (text.includes('authority') || text.includes('권한')) return weights.authority;
    if (text.includes('need') || text.includes('니즈')) return weights.need;
    if (text.includes('timeline') || text.includes('시기')) return weights.timeline;
    if (text.includes('competition') || text.includes('경쟁')) return weights.competition;
    return 20;
  };

  const radarData = evaluation.detailedScores.map(ds => {
    const max = getWeightForItem(ds.item);
    return {
      subject: ds.item,
      A: ds.score,
      fullMark: max
    };
  });

  const getVerdictStyles = (verdict: string) => {
    switch (verdict) {
      case 'GO':
        return { label: '적극 지원', description: '수주 가능성이 매우 높음', accent: 'bg-emerald-600' };
      case 'NURTURE':
        return { label: '제한적 지원', description: '온라인 미팅/표준 데모 시연 1회 제한', accent: 'bg-amber-600' };
      default:
        return { label: '지원 불가', description: '자료만 제공하며 추후 기회 모니터링', accent: 'bg-rose-600' };
    }
  };

  const styles = getVerdictStyles(evaluation.verdict);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* 1. 최종 판정 헤더 */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <div className={`${styles.accent} px-8 py-6 text-white flex justify-between items-center`}>
          <div>
            <div className="flex items-center gap-3">
               <h2 className="text-2xl font-black">{styles.label}</h2>
               <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold border border-white/30 tracking-widest uppercase">
                 {evaluation.verdict}
               </span>
            </div>
            <p className="text-white/90 font-medium mt-1 text-sm">{styles.description}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-5 py-2 rounded-2xl text-center border border-white/30 min-w-[100px]">
            <span className="block text-[10px] font-bold uppercase tracking-wider opacity-80">최종 점수</span>
            <span className="text-3xl font-black">{evaluation.overallScore}</span>
          </div>
        </div>
        
        <div className="p-8 space-y-10">
          <div className="flex flex-col md:flex-row gap-4 text-xs font-bold text-slate-500">
            <span>고객사: <span className="text-slate-900">{project.customerName}</span></span>
            <span className="hidden md:block text-slate-300">|</span>
            <span>프로젝트: <span className="text-slate-900">{project.name}</span></span>
          </div>

          {/* 종합 평가 */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-inner">
            <h4 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
              <i className="fas fa-quote-left text-indigo-400"></i> 종합 전략 평가
            </h4>
            <div className="text-slate-700 leading-relaxed font-semibold">
              {evaluation.summaryEvaluation.replace('[종합 평가 및 제안]', '').trim()}
            </div>
          </div>

          {/* 항목별 상세 분석 카드 */}
          <div className="space-y-4">
            <h4 className="text-slate-900 font-bold flex items-center gap-2">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span> 항목별 상세 분석
            </h4>
            <div className="grid grid-cols-1 gap-4">
              {evaluation.detailedScores.map((ds, idx) => {
                const max = getWeightForItem(ds.item);
                return (
                  <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-lg">{ds.item}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          배점: {max}점
                        </span>
                        <span className="text-xl font-black text-indigo-600">
                          {ds.score}<span className="text-xs text-slate-400 font-medium ml-1">점</span>
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <span className="w-1 h-auto bg-indigo-200 rounded-full shrink-0"></span>
                        <p className="text-sm text-slate-700 font-medium">{ds.reasoning}</p>
                      </div>
                      <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                        <p className="text-xs text-amber-800 italic font-medium">{ds.analysis}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. 시각화 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-chart-radar text-indigo-500"></i> 역량 밸런스 분석
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                <PolarRadiusAxis domain={[0, 30]} tick={false} axisLine={false} />
                <Radar name="성숙도" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-4 italic">
            * 각 축은 해당 항목에 설정된 배점 대비 달성 수준을 나타냅니다.
          </p>
        </div>

        <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
          <h3 className="text-lg font-bold text-rose-800 mb-4 flex items-center gap-2">
            <i className="fas fa-exclamation-triangle"></i> 주요 리스크 요인
          </h3>
          <div className="space-y-3">
            {evaluation.riskFactors.map((risk, i) => (
              <div key={i} className="bg-white p-4 rounded-xl flex gap-3 text-rose-700 text-sm font-semibold shadow-sm border border-rose-50 items-start">
                <i className="fas fa-bolt text-rose-400 mt-1"></i>
                <span>{risk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 데이터 요약 테이블 */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-table text-indigo-500"></i> 검증 결과 요약표
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="px-6 py-4 border-b">평가항목</th>
                <th className="px-6 py-4 border-b text-center">배점 (최대)</th>
                <th className="px-6 py-4 border-b text-center">획득 점수</th>
                <th className="px-6 py-4 border-b">진척도</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evaluation.detailedScores.map((ds, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{ds.item}</td>
                  <td className="px-6 py-4 text-center font-bold text-slate-400">배점: {getWeightForItem(ds.item)}점</td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-black text-indigo-600 text-lg">{ds.score}</span><span className="text-xs text-slate-400 ml-0.5">점</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                      {ds.progress}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
        <button onClick={onReset} className="px-8 py-4 bg-slate-200 text-slate-700 rounded-2xl font-black hover:bg-slate-300 transition-all shadow-md">
          목록으로 돌아가기
        </button>
        <button onClick={onRevalidate} className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3">
          <i className="fas fa-sync-alt"></i> 정보 업데이트 및 재검증
        </button>
      </div>
    </div>
  );
};

export default ResultView;
