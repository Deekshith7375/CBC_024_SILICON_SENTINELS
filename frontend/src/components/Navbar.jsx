import React from 'react';
import { 
  Scan, 
  User, 
  Store, 
  ShieldCheck, 
  Cpu, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Navbar({ 
  activeView, 
  setActiveView, 
  onOpenCustomerLogin, 
  onOpenShopLogin,
  currentUser,
  currentShop,
  onLogout
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
      {/* Top Hackathon Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-900 to-slate-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold text-brand-300">24H HACKATHON LIVE:</span>
            <span className="text-slate-200 hidden sm:inline">
              OpenCV Computer Vision + Automated Retail Policy & Stock Allocation
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-300 text-[11px]">
            <span className="hidden md:inline bg-white/10 px-2 py-0.5 rounded text-white font-mono">
              FastAPI • OpenCV 4.10 • React
            </span>
            <span className="text-emerald-400 font-medium">System Ready</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveView('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-400 text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200">
              <Scan className="w-6 h-6 stroke-[2.2]" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                  ReturnSphere
                </span>
                <span className="bg-brand-100 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Vision AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Automated Visual Returns & Exchange System
              </p>
            </div>
          </div>

          {/* Navigation Links (When on landing page) */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
            <button 
              onClick={() => setActiveView('landing')}
              className={`px-3 py-2 rounded-lg transition-colors ${activeView === 'landing' ? 'text-brand-600 font-semibold bg-brand-50' : 'hover:text-slate-900 hover:bg-slate-100'}`}
            >
              Overview
            </button>
            <a 
              href="#scanner-demo"
              onClick={() => setActiveView('landing')}
              className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Live OpenCV Demo
            </a>
            <a 
              href="#problem-solution"
              onClick={() => setActiveView('landing')}
              className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              How It Works
            </a>
            <a 
              href="#features"
              onClick={() => setActiveView('landing')}
              className="px-3 py-2 rounded-lg hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Business Engine
            </a>
          </nav>

          {/* Active View Quick Switcher Tabs (For seamless hackathon judging) */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveView('landing')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeView === 'landing' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'hover:text-slate-900'
              }`}
            >
              Landing Page
            </button>
            <button
              onClick={() => setActiveView('customer')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activeView === 'customer' 
                  ? 'bg-brand-600 text-white shadow-sm' 
                  : 'hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Customer View
            </button>
            <button
              onClick={() => setActiveView('shop')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                activeView === 'shop' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              Shop Owner View
            </button>
          </div>

          {/* Login Buttons Requested by User */}
          <div className="flex items-center gap-2.5">
            {/* If someone is logged in */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-xs bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {currentUser.customer_name}
                </span>
                <button 
                  onClick={onLogout}
                  className="text-xs text-slate-500 hover:text-rose-600 px-2 py-1"
                >
                  Sign Out
                </button>
              </div>
            ) : currentShop ? (
              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-900 text-white px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-amber-400" />
                  {currentShop.name}
                </span>
                <button 
                  onClick={onLogout}
                  className="text-xs text-slate-500 hover:text-rose-600 px-2 py-1"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                {/* 1. Customer Login Button */}
                <button
                  id="btn-customer-login"
                  onClick={onOpenCustomerLogin}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 hover:border-slate-400 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                >
                  <User className="w-4 h-4 text-brand-600" />
                  <span>Customer Login</span>
                </button>

                {/* 2. Shop Owner Login Button */}
                <button
                  id="btn-shop-login"
                  onClick={onOpenShopLogin}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white font-semibold text-xs sm:text-sm hover:from-slate-800 hover:to-slate-700 transition-all shadow-md shadow-slate-900/10 active:scale-95 border border-slate-800"
                >
                  <Store className="w-4 h-4 text-brand-400" />
                  <span>Shop Owner Login</span>
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
