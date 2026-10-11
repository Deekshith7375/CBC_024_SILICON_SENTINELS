import React from 'react';
import { 
  User, 
  Store, 
  Scan, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Boxes,
  Cpu,
  Layers,
  Clock
} from 'lucide-react';

export default function Hero({ 
  onOpenCustomerLogin, 
  onOpenShopLogin, 
  onScrollToDemo 
}) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-brand-50/40 via-white to-slate-50">
      {/* Background radial glow & geometric grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-brand-400/15 via-brand-300/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Highlight Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-brand-200/80 shadow-sm text-xs font-medium text-slate-700 hover:border-brand-300 transition-colors">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand-100 text-brand-600">
              <Sparkles className="w-3 h-3" />
            </span>
            <span className="font-semibold text-brand-900">Next-Gen Return Protection:</span>
            <span className="text-slate-600">OpenCV Vision Verification + Dynamic Inventory Control</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 98.7% Precision
            </span>
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.12]">
            Visual AI Return & Exchange Management for{' '}
            <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 bg-clip-text text-transparent">
              Modern Retailers
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto font-normal">
            Take item photos upon return or exchange. Our <strong className="text-slate-900 font-semibold">OpenCV computer vision engine</strong> compares 
            incoming items against pristine catalog references, detects scratches or wear, verifies genuine reasons, 
            and automatically executes shop policies with <strong className="text-slate-900 font-semibold">live inventory stock reservation</strong>.
          </p>

          {/* TWO MAIN AUTHENTICATION BUTTONS AS REQUESTED */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
            {/* Customer Login CTA */}
            <button
              id="hero-btn-customer-login"
              onClick={onOpenCustomerLogin}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-base hover:from-brand-500 hover:to-brand-600 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <User className="w-5 h-5" />
              <span>Customer Login & Return Portal</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            {/* Shop Owner Login CTA */}
            <button
              id="hero-btn-shop-login"
              onClick={onOpenShopLogin}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-slate-900 text-white font-bold text-base hover:bg-slate-800 shadow-lg shadow-slate-900/15 hover:shadow-slate-900/25 transition-all duration-200 transform hover:-translate-y-0.5 border border-slate-800"
            >
              <Store className="w-5 h-5 text-amber-400" />
              <span>Shop Owner Login & Console</span>
            </button>
          </div>

          {/* Interactive Demo Scroll Trigger */}
          <div className="mt-5">
            <button
              onClick={onScrollToDemo}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800 hover:underline transition-colors"
            >
              <Scan className="w-4 h-4" />
              <span>Explore Interactive OpenCV Live Comparison Demo Below</span>
              <span className="text-xs bg-brand-100 text-brand-800 px-2 py-0.5 rounded-full font-mono">
                Interactive
              </span>
            </button>
          </div>
        </div>

        {/* Feature Cards Grid (3 Core Pillars) */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Vision Condition Engine */}
          <div className="relative p-6 rounded-2xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl hover:border-brand-300 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all">
              <Scan className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-slate-900">
                OpenCV Visual Comparison
              </h3>
              <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                CV2 Core
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Analyzes Structural Similarity (SSIM), keypoint matching, and contour defect mapping against catalog reference images to stop used or damaged item fraud.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Edge & Scratch Contour Detection</span>
            </div>
          </div>

          {/* Card 2: Business Rules Engine */}
          <div className="relative p-6 rounded-2xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl hover:border-brand-300 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-slate-900">
                Automated Shop Rules
              </h3>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Zero Friction
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Enforces shop-specific return windows, allowed reasons, and duplicate request blocking. Configurable auto-approval or staff sign-off.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Window & Duplicate Verification</span>
            </div>
          </div>

          {/* Card 3: Inventory Reservation */}
          <div className="relative p-6 rounded-2xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl hover:border-brand-300 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <Boxes className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-slate-900">
                Smart Stock & Exchange
              </h3>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                Live Sync
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Instantly verifies replacement product inventory. Reserves exchange units immediately or suggests seamless refunds when out of stock.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Real-time Warehouse Reservation</span>
            </div>
          </div>

        </div>

        {/* Live Metrics Ticker */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-brand-950 text-white shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="border-r border-slate-800 last:border-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-400 font-mono">
                98.7%
              </div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">
                Visual Defect Precision
              </div>
            </div>
            <div className="border-r border-slate-800 last:border-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
                &lt; 3.2s
              </div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">
                Automated Decision Time
              </div>
            </div>
            <div className="border-r border-slate-800 last:border-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono">
                100%
              </div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">
                Exchange Stock Reserved
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                $0
              </div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1">
                Fraudulent Return Payout
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
