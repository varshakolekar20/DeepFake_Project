import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import HowItWorks from './pages/HowItWorks';
import Performance from './pages/Performance';
import Faq from './pages/Faq';
import AnalysisHistory from './components/AnalysisHistory';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('deepguard_theme');
    return saved !== null ? saved === 'dark' : true;
  });
  const [apiHealthy, setApiHealthy] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('deepguard_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Sync theme with HTML class & localStorage
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('deepguard_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('deepguard_theme', 'light');
    }
  }, [isDark]);

  // Persist history to localStorage
  const handleSaveHistory = (entry) => {
    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, 30); // Keep last 30 scans
      try {
        localStorage.setItem('deepguard_history', JSON.stringify(updated));
      } catch (e) {
        console.warn("Storage quota exceeded", e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('deepguard_history');
    } catch (e) {}
  };

  // Health poll check
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/health');
        if (res.ok) {
          setApiHealthy(true);
        } else {
          setApiHealthy(false);
        }
      } catch (e) {
        setApiHealthy(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 text-slate-800 dark:text-slate-100 transition-colors selection:bg-teal-500 selection:text-navy-950">
      
      {/* Navigation Bar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        isDark={isDark}
        setIsDark={setIsDark}
        apiHealthy={apiHealthy}
        historyCount={history.length}
        onOpenHistory={() => setHistoryModalOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {activePage === 'home' && <Home onNavigateAnalyze={() => setActivePage('analyze')} />}
        {activePage === 'analyze' && <Analyze onSaveHistory={handleSaveHistory} />}
        {activePage === 'how-it-works' && <HowItWorks onNavigateAnalyze={() => setActivePage('analyze')} />}
        {activePage === 'benchmarks' && <Performance />}
        {activePage === 'faq' && <Faq />}
      </main>

      {/* Local Session History Drawer */}
      <AnalysisHistory
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
        onSelectHistoryItem={(item) => {
          setActivePage('analyze');
        }}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-8 bg-white/50 dark:bg-navy-950/50 backdrop-blur-sm text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          DeepGuard — Explainable Deepfake & AI Media Detection
        </p>
        <p className="text-[11px] font-mono">
          Final Year Project in Computer Technology • Powered by PyTorch, EfficientNet-B0 & Grad-CAM
        </p>
      </footer>

    </div>
  );
}
