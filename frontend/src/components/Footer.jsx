import React from 'react';
import { Scan, Code, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
          
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600 text-white">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base">ReturnSphere</span>
              <span className="text-brand-400 font-bold ml-1 text-xs">AI</span>
              <p className="text-xs text-slate-500">Autonomous Retail Return & Exchange Intelligence</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <span className="bg-slate-900 text-slate-300 px-3 py-1 rounded-lg border border-slate-800">
              Frontend: React + Vite + Tailwind CSS
            </span>
            <span className="bg-slate-900 text-slate-300 px-3 py-1 rounded-lg border border-slate-800">
              Vision Core: OpenCV (cv2)
            </span>
            <span className="bg-slate-900 text-slate-300 px-3 py-1 rounded-lg border border-slate-800">
              Backend: Python FastAPI + MongoDB
            </span>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 ReturnSphere AI • Built for 24-Hour Hackathon Challenge</p>
          <p className="flex items-center gap-1">
            Engineered with Computer Vision & Automated Business Logic
          </p>
        </div>
      </div>
    </footer>
  );
}
