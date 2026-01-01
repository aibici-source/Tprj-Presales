
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import BantForm from './components/BantForm';
import ResultView from './components/ResultView';
import SettingsView from './components/SettingsView';
import { BantData, BantEvaluation, SalesProject, EvaluationRecord, BantWeights } from './types';
import { evaluateOpportunity } from './services/geminiService';

type ViewMode = 'LIST' | 'FORM' | 'RESULT' | 'SETTINGS';

const DEFAULT_WEIGHTS: BantWeights = {
  budget: 20,
  authority: 20,
  need: 20,
  timeline: 20,
  competition: 20
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('LIST');
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<SalesProject[]>([]);
  const [weights, setWeights] = useState<BantWeights>(DEFAULT_WEIGHTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [currentEvaluation, setCurrentEvaluation] = useState<BantEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 로컬 스토리지 데이터 로드
  useEffect(() => {
    const savedProjects = localStorage.getItem('bant_projects_v2');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
    const savedWeights = localStorage.getItem('bant_weights_v2');
    if (savedWeights) {
      setWeights(JSON.parse(savedWeights));
    }
  }, []);

  // 데이터 변경 시 로컬 스토리지 업데이트
  useEffect(() => {
    localStorage.setItem('bant_projects_v2', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('bant_weights_v2', JSON.stringify(weights));
  }, [weights]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleStartNew = () => {
    setSelectedProjectId(null);
    setCurrentEvaluation(null);
    setView('FORM');
  };

  const handleSelectProject = (project: SalesProject) => {
    setSelectedProjectId(project.id);
    const lastRecord = project.records[project.records.length - 1];
    if (lastRecord) {
      setCurrentEvaluation(lastRecord.result);
      setView('RESULT');
    } else {
      setView('FORM');
    }
  };

  const handleRevalidate = () => {
    setView('FORM');
  };

  const handleValidation = async (data: BantData) => {
    setIsLoading(true);
    setError(null);
    try {
      // 설정된 배점을 서비스에 전달
      const result = await evaluateOpportunity(data, weights);
      
      const newRecord: EvaluationRecord = {
        timestamp: Date.now(),
        input: data,
        result: result
      };

      let updatedProjects = [...projects];
      let targetProjectId = selectedProjectId;

      if (targetProjectId) {
        updatedProjects = updatedProjects.map(p => {
          if (p.id === targetProjectId) {
            return {
              ...p,
              name: data.projectName,
              customerName: data.customerName,
              records: [...p.records, newRecord]
            };
          }
          return p;
        });
      } else {
        const newProject: SalesProject = {
          id: crypto.randomUUID(),
          name: data.projectName,
          customerName: data.customerName,
          createdAt: Date.now(),
          records: [newRecord]
        };
        updatedProjects = [newProject, ...updatedProjects];
        targetProjectId = newProject.id;
      }

      setProjects(updatedProjects);
      setSelectedProjectId(targetProjectId);
      setCurrentEvaluation(result);
      setView('RESULT');
    } catch (err) {
      setError('평가에 실패했습니다. 입력 내용을 확인하고 다시 시도해주세요.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWeights = (newWeights: BantWeights) => {
    setWeights(newWeights);
    setView('LIST');
  };

  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('이 영업 기회의 모든 정보를 삭제하시겠습니까?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <Layout onNavigate={(v) => setView(v)} currentView={view}>
      <div className="max-w-5xl mx-auto">
        {view === 'LIST' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">영업 기회 리스트</h2>
                <p className="text-slate-500 font-medium">관리 중인 모든 BANT 검증 영업 기회를 확인하세요.</p>
              </div>
              <button
                onClick={handleStartNew}
                className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-plus"></i> 새로운 검증 시작하기
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.length === 0 ? (
                <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                  <i className="fas fa-folder-open text-5xl mb-4 opacity-20"></i>
                  <p className="font-bold text-lg text-slate-300">등록된 영업 기회가 없습니다.</p>
                  <button 
                    onClick={handleStartNew}
                    className="mt-4 text-indigo-500 font-bold hover:underline"
                  >
                    첫 번째 검증 시작하기
                  </button>
                </div>
              ) : (
                projects.map((p) => {
                  const lastRecord = p.records[p.records.length - 1];
                  const styles = lastRecord ? (
                    lastRecord.result.verdict === 'GO' ? { bg: 'bg-emerald-50', text: 'text-emerald-700', label: '적극 지원' } :
                    lastRecord.result.verdict === 'NURTURE' ? { bg: 'bg-amber-50', text: 'text-amber-700', label: '제한적 지원' } :
                    { bg: 'bg-rose-50', text: 'text-rose-700', label: '지원 불가' }
                  ) : { bg: 'bg-slate-50', text: 'text-slate-500', label: '기록 없음' };

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProject(p)}
                      className="group relative bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${styles.bg} ${styles.text}`}>
                          {styles.label}
                        </span>
                        <button 
                          onClick={(e) => deleteProject(p.id, e)}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                        >
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                      </div>

                      <div className="mb-2">
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">{p.customerName || '알 수 없는 고객사'}</p>
                        <h3 className="font-black text-slate-900 text-lg group-hover:text-indigo-600 transition-colors truncate">
                          {p.name}
                        </h3>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-xs font-bold text-slate-400">
                          <span>최근 검증 점수</span>
                          <span className="text-slate-600">{lastRecord ? `${lastRecord.result.overallScore}점` : '-'}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-full transition-all duration-1000"
                            style={{ width: lastRecord ? `${lastRecord.result.overallScore}%` : '0%' }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-2">
                          <span>히스토리: {p.records.length}건</span>
                          <span>업데이트: {lastRecord ? new Date(lastRecord.timestamp).toLocaleDateString() : '-'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {view === 'FORM' && (
          <div className="animate-in slide-in-from-right-4 duration-500">
            <header className="text-center space-y-3 mb-8">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                {selectedProject ? '영업 기회 재검증' : '영업 기회 검증 및 자격 평가'}
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                {selectedProject 
                  ? `'${selectedProject.name}' 프로젝트의 업데이트된 정보를 입력하세요.`
                  : '기술 지원을 요청하기 전에 잠재 고객을 검증하십시오.'}
              </p>
            </header>

            {error && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center gap-3 text-rose-700 font-medium mb-6">
                <i className="fas fa-exclamation-circle text-xl"></i>
                {error}
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-10">
              <BantForm 
                onSubmit={handleValidation} 
                onCancel={() => setView('LIST')}
                isLoading={isLoading} 
                weights={weights}
                initialData={selectedProject?.records[selectedProject.records.length - 1]?.input}
              />
            </div>
          </div>
        )}

        {view === 'RESULT' && currentEvaluation && selectedProject && (
          <ResultView 
            evaluation={currentEvaluation} 
            project={selectedProject}
            weights={weights}
            onReset={() => setView('LIST')} 
            onRevalidate={handleRevalidate}
          />
        )}

        {view === 'SETTINGS' && (
          <SettingsView 
            initialWeights={weights} 
            onSave={handleSaveWeights} 
            onCancel={() => setView('LIST')} 
          />
        )}
      </div>

      <footer className="mt-24 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm font-medium pb-12">
        <p>&copy; {new Date().getFullYear()} BANT Validator Pro. AI 기반 영업 전략 파트너.</p>
      </footer>
    </Layout>
  );
};

export default App;
