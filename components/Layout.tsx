
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (view: 'LIST' | 'SETTINGS') => void;
  currentView: string;
}

const Layout: React.FC<LayoutProps> = ({ children, onNavigate, currentView }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => onNavigate('LIST')}
            >
              <div className="bg-indigo-600 text-white p-2 rounded-lg">
                <i className="fas fa-chart-line text-xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">BANT 검증기</h1>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">영업 기회 품질 관리</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => onNavigate('LIST')}
                className={`text-sm font-semibold transition-colors ${currentView === 'LIST' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
              >
                대시보드
              </button>
              <button className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">사용 가이드</button>
              <button 
                onClick={() => onNavigate('SETTINGS')}
                className={`text-sm font-semibold transition-colors ${currentView === 'SETTINGS' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
              >
                설정
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
