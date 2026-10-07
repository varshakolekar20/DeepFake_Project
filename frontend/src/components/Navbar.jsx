import React, { useState } from 'react';
import { Shield, Sun, Moon, Cpu, Activity, History, Menu, X, Sparkles, Home as HomeIcon } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, isDark, setIsDark, apiHealthy, historyCount = 0, onOpenHistory }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'analyze', label: 'Analyze Media' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'benchmarks', label: 'Model Benchmarks' },
    { id: 'faq', label: 'FAQ & Viva' }
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-navy-950/85 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo and Brand */}
        <div 
          onClick={() => setActivePage('home')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-500 group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-teal-500 to-cyan-400 bg-clip-text text-transparent">
                DeepGuard
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-500 border border-teal-500/30 font-mono font-bold">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block tracking-wide">
              Explainable Neural Media Forensics
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activePage === item.id
                  ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* History Drawer Trigger */}
          <button
            onClick={onOpenHistory}
            className="relative p-2 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-500 transition-colors"
            title="View Past Scans"
            aria-label="View Analysis History"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-teal-500 text-navy-950 font-bold text-[9px] flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {/* Health Status Pill */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${apiHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-slate-600 dark:text-slate-400 text-[11px]">
              {apiHealthy ? 'Engine Online' : 'Connecting Engine...'}
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-500 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-1 bg-white/95 dark:bg-navy-950/95 border-b border-slate-200 dark:border-slate-800 animate-fade-in">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
                activePage === item.id
                  ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{item.label}</span>
              {activePage === item.id && <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />}
            </button>
          ))}
          
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-2 text-xs font-mono text-slate-500">
            <span>Inference Status:</span>
            <span className={apiHealthy ? 'text-emerald-500 font-bold' : 'text-amber-500'}>
              {apiHealthy ? 'Engine Active' : 'Connecting...'}
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
