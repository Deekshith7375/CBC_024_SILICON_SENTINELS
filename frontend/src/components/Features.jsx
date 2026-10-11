import React from 'react';
import { 
  Scan, 
  ShieldAlert, 
  Boxes, 
  Layers, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Cpu
} from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className="py-20 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for Small Retailers. Powered by CV Intelligence.
          </h2>
          <p className="mt-3 text-slate-600 text-base">
            Why retail shops lose up to 15% of annual revenue on return abuse—and how ReturnSphere stops it.
          </p>
        </div>

        {/* Side-by-side comparison: Old Way vs ReturnSphere AI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          
          {/* Traditional Manual Returns */}
          <div className="p-8 rounded-3xl bg-white border border-rose-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm uppercase tracking-wider">
              <XCircle className="w-5 h-5" /> Traditional Manual Returns
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              High Fraud, Delayed Refunds, Frustrated Customers
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✗</span>
                <span>Customers return scratched or heavily worn goods after weekend use ("wardrobing").</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✗</span>
                <span>Staff manually inspect items days after receipt, causing long delays and disputes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✗</span>
                <span>Exchanges fail because desired replacement size was sold out before return arrived.</span>
              </li>
            </ul>
          </div>

          {/* ReturnSphere AI System */}
          <div className="p-8 rounded-3xl bg-white border border-emerald-300 shadow-md ring-1 ring-emerald-500/20 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-wider">
              <CheckCircle2 className="w-5 h-5" /> ReturnSphere Visual AI
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Pre-Shipment Photo Inspection + Real-Time Stock Hold
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>OpenCV compares item image to reference standard before return label is even generated.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Zero friction for honest buyers: pristine items auto-approved in under 3 seconds.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Exchanges immediately decrement and hold replacement inventory from the warehouse.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
}
