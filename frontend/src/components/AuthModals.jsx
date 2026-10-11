import React, { useState } from 'react';
import { 
  User, 
  Store, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  KeyRound, 
  PackageCheck
} from 'lucide-react';
import { DEMO_ORDERS, INITIAL_SHOPS } from '../data/mockData';

export function CustomerLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [orderId, setOrderId] = useState('ORD-9821');
  const [email, setEmail] = useState('alex.morgan@example.com');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleManualLogin = (e) => {
    e.preventDefault();
    const foundOrder = DEMO_ORDERS.find(
      o => o.order_id.toLowerCase() === orderId.trim().toLowerCase()
    );
    if (foundOrder) {
      onLoginSuccess(foundOrder);
      onClose();
    } else {
      // Allow fallback login with custom data
      onLoginSuccess({
        order_id: orderId || "ORD-CUSTOM",
        customer_name: "Customer (" + orderId + ")",
        customer_email: email,
        shop_id: "shop_apex",
        product_id: "prod_1",
        purchase_date: "2026-10-04",
        product_name: "AuraLex ANC Wireless Headphones",
        price: 199.99,
        image: "/assets/headphones-ref.jpg"
      });
      onClose();
    }
  };

  const handleQuickDemo = (demoOrder) => {
    onLoginSuccess(demoOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-br from-brand-600 to-brand-700 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold text-white mb-2">
            <User className="w-3.5 h-3.5" />
            Customer Portal Access
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight">
            Customer Login
          </h3>
          <p className="text-xs text-brand-100 mt-1">
            Track, return, or exchange items with instant OpenCV condition inspection.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* 1-Click Demo Buttons for Fast Hackathon Review */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>1-Click Hackathon Demo Profiles</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {DEMO_ORDERS.slice(0, 2).map((order) => (
                <button
                  key={order.order_id}
                  onClick={() => handleQuickDemo(order)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-sm text-slate-900 group-hover:text-brand-700">
                      {order.customer_name} • #{order.order_id}
                    </div>
                    <div className="text-xs text-slate-500">
                      Purchased: {order.product_name}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-brand-600 bg-brand-100 px-2.5 py-1 rounded-lg group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    Login
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 font-semibold uppercase">Or Enter Order ID</span>
          </div>

          {/* Form */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Order ID / Reference #
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. ORD-9821"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-mono text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.morgan@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Access Return & Exchange Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export function ShopLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [selectedShopId, setSelectedShopId] = useState('shop_apex');
  const [accessCode, setAccessCode] = useState('ADMIN2026');

  if (!isOpen) return null;

  const handleShopLogin = (e) => {
    e.preventDefault();
    const foundShop = INITIAL_SHOPS.find(s => s.id === selectedShopId) || INITIAL_SHOPS[0];
    onLoginSuccess(foundShop);
    onClose();
  };

  const handleQuickShop = (shop) => {
    onLoginSuccess(shop);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-amber-300 mb-2">
            <Store className="w-3.5 h-3.5" />
            Merchant Console
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight">
            Shop Owner Login
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Manage policies, audit OpenCV inspection verdicts, and view live stock holds.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Quick Demo Stores */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Select Store Workspace</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {INITIAL_SHOPS.map((shop) => (
                <button
                  key={shop.id}
                  onClick={() => handleQuickShop(shop)}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-sm text-slate-900 group-hover:text-brand-600 flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-slate-500 group-hover:text-brand-600" />
                      {shop.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Policy: {shop.policy.return_window_days}-Day Window • {shop.policy.requires_approval ? 'Manual Review' : 'Auto-Approve'}
                    </div>
                  </div>
                  <span className="text-xs font-semibold bg-slate-900 text-white px-3 py-1.5 rounded-lg group-hover:bg-brand-600 transition-colors">
                    Enter
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 font-semibold uppercase">Or Enter Merchant PIN</span>
          </div>

          {/* Form */}
          <form onSubmit={handleShopLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Staff Passcode
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm font-mono"
                  required
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Launch Merchant Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
