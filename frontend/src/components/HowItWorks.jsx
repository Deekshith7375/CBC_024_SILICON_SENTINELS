import React from 'react';
import { 
  Camera, 
  Scan, 
  ShieldCheck, 
  Boxes, 
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: Camera,
      title: "1. Capture & Submit",
      desc: "Customer selects their order, chooses Return or Exchange, and snaps an item photo with their smartphone.",
      badge: "Customer Portal"
    },
    {
      step: "02",
      icon: Scan,
      title: "2. OpenCV Visual Audit",
      desc: "Algorithm compares item photo against baseline catalog reference. Calculates SSIM score, edge disruption, and detects surface wear.",
      badge: "Computer Vision"
    },
    {
      step: "03",
      icon: ShieldCheck,
      title: "3. Rule & Window Verification",
      desc: "Validates against shop return window (e.g. 14 days), checks allowed reasons, and eliminates duplicate pending claims.",
      badge: "Policy Engine"
    },
    {
      step: "04",
      icon: Boxes,
      title: "4. Stock Hold & Decision",
      desc: "If exchange: immediately locks replacement inventory in warehouse. If pristine return: issues instant refund or queues for merchant.",
      badge: "Live Inventory"
    }
  ];

  return (
    <section id="problem-solution" className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            End-to-End Autonomous Pipeline
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How ReturnSphere Verifies Returns in Under 4 Seconds
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            No more manual back-and-forth emails. No more customer disputes or accepting damaged goods.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, index) => {
            const Icon = s.icon;
            return (
              <div 
                key={index}
                className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 hover:bg-white hover:shadow-xl transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-brand-600/40 group-hover:text-brand-600 transition-colors">
                    {s.step}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-mono">
                    {s.badge}
                  </span>
                </div>

                <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-200 text-brand-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
