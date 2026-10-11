import React, { useState, useEffect } from 'react';
import CustomerDashboard from './components/CustomerDashboard';
import ShopDashboard from './components/ShopDashboard';
import { INITIAL_SHOPS, INITIAL_REQUESTS } from './data/mockData';
import { registerUser, loginUser, syncGoogleUser, getDatabaseStatus } from './services/api';
import { 
  ArrowUpRight, 
  ArrowRight, 
  Repeat, 
  Check, 
  Shirt, 
  MessageSquare, 
  Package, 
  GitFork, 
  FileText, 
  ListChecks, 
  Boxes, 
  ArrowLeftRight,
  User,
  Store,
  X,
  CheckCircle2,
  LayoutDashboard
} from 'lucide-react';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'customer_dashboard'
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [shopModalOpen, setShopModalOpen] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Customer Email/Password Authentication & Sign Up Mode
  const [customerAuthMode, setCustomerAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Shop Owner Email/Password & Google Authentication
  const [shopAuthMode, setShopAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [shopEmail, setShopEmail] = useState('');
  const [shopPassword, setShopPassword] = useState('');
  const [shopStoreName, setShopStoreName] = useState('');
  const [shopOwnerName, setShopOwnerName] = useState('');
  const [showShopGoogleChooser, setShowShopGoogleChooser] = useState(false);
  const [currentShop, setCurrentShop] = useState(null);
  const [requestsList, setRequestsList] = useState(INITIAL_REQUESTS);

  // Interactive toggle for the floating demo card
  const [selectedSize, setSelectedSize] = useState('Sage / L');
  const [dbStatus, setDbStatus] = useState(null);

  useEffect(() => {
    getDatabaseStatus().then(st => {
      if (st) setDbStatus(st);
    }).catch(() => {});
  }, []);

  const handleSelectGoogleAccount = async (name, email) => {
    setLoginMessage(`Authenticated with Google as ${name}!`);
    try {
      const res = await syncGoogleUser({ name, email, role: 'customer' });
      setCurrentUser(res.user);
    } catch {
      setCurrentUser({ name, email, provider: 'google', role: 'customer' });
    }
    setTimeout(() => {
      setLoginMessage('');
      setShowGoogleChooser(false);
      setCustomerModalOpen(false);
      setView('customer_dashboard'); // Lands directly in Customer Dashboard
    }, 900);
  };

  const handleCustomerAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (customerAuthMode === 'signup') {
        const displayName = authName.trim() || 'Jamie Lee';
        const res = await registerUser({
          name: displayName,
          email: authEmail,
          password: authPassword || 'customer123',
          role: 'customer'
        });
        setCurrentUser(res.user);
        setLoginMessage(`Account saved to MongoDB! Welcome, ${res.user.name}!`);
      } else {
        const res = await loginUser({
          email: authEmail,
          password: authPassword,
          role: 'customer'
        });
        setCurrentUser(res.user);
        setLoginMessage('Signed in with MongoDB account!');
      }
    } catch (err) {
      console.warn("Auth fallback:", err.message);
      const displayName = authName.trim() || (authEmail ? authEmail.split('@')[0] : 'Jamie Lee');
      setCurrentUser({ name: displayName, email: authEmail, role: 'customer', provider: 'email' });
      setLoginMessage(customerAuthMode === 'signup' ? `Account created! Welcome, ${displayName}!` : 'Signed in successfully!');
    }
    setTimeout(() => {
      setLoginMessage('');
      setCustomerModalOpen(false);
      setAuthName('');
      setAuthEmail('');
      setAuthPassword('');
      setView('customer_dashboard');
    }, 900);
  };

  const handleSelectShopGoogleAccount = async (ownerName, email, storeName) => {
    setLoginMessage(`Authenticated with Google as ${ownerName}!`);
    try {
      const res = await syncGoogleUser({ name: ownerName, email, role: 'shop_owner', storeName });
      const shopObj = INITIAL_SHOPS.find(s => s.name === storeName) || {
        id: res.user.shop_id || `shop_${Date.now()}`,
        name: storeName,
        owner: ownerName,
        email: email,
        category: 'Retail & Consumer Goods',
        policy: INITIAL_SHOPS[0].policy,
        provider: 'google'
      };
      setCurrentShop(shopObj);
    } catch {
      const shopObj = INITIAL_SHOPS.find(s => s.name === storeName) || {
        id: `shop_${Date.now()}`,
        name: storeName,
        owner: ownerName,
        email: email,
        category: 'Retail & Consumer Goods',
        policy: INITIAL_SHOPS[0].policy,
        provider: 'google'
      };
      setCurrentShop(shopObj);
    }
    setTimeout(() => {
      setLoginMessage('');
      setShowShopGoogleChooser(false);
      setShopModalOpen(false);
      setView('shop_dashboard');
    }, 900);
  };

  const handleShopAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      if (shopAuthMode === 'signup') {
        const storeName = shopStoreName.trim() || 'Apex Retail Store';
        const ownerName = shopOwnerName.trim() || (shopEmail ? shopEmail.split('@')[0] : 'Store Owner');
        const res = await registerUser({
          name: ownerName,
          email: shopEmail,
          password: shopPassword || 'shopowner123',
          role: 'shop_owner',
          storeName: storeName,
          shopId: `shop_${Date.now()}`
        });
        setCurrentShop({
          id: res.user.shop_id || `shop_${Date.now()}`,
          name: res.user.store_name,
          owner: res.user.name,
          email: res.user.email,
          category: 'Apparel & Lifestyle',
          policy: INITIAL_SHOPS[0].policy
        });
        setLoginMessage(`Store saved to MongoDB! Welcome, ${storeName}!`);
      } else {
        const res = await loginUser({
          email: shopEmail,
          password: shopPassword,
          role: 'shop_owner'
        });
        const existing = INITIAL_SHOPS.find(s => s.name.toLowerCase().includes('apex')) || INITIAL_SHOPS[0];
        setCurrentShop({
          ...existing,
          name: res.user.store_name || existing.name,
          owner: res.user.name,
          email: res.user.email
        });
        setLoginMessage('Signed in with MongoDB Shop Owner account!');
      }
    } catch (err) {
      console.warn("Shop auth fallback:", err.message);
      const storeName = shopStoreName.trim() || 'Apex Retail Store';
      const ownerName = shopOwnerName.trim() || (shopEmail ? shopEmail.split('@')[0] : 'Store Owner');
      const shopObj = {
        id: `shop_${Date.now()}`,
        name: storeName,
        owner: ownerName,
        email: shopEmail || 'owner@apexretail.com',
        category: 'Apparel & Lifestyle',
        policy: INITIAL_SHOPS[0].policy
      };
      setCurrentShop(shopObj);
      setLoginMessage(shopAuthMode === 'signup' ? `Store registered! Welcome, ${storeName}!` : 'Signed in as Shop Owner!');
    }
    setTimeout(() => {
      setLoginMessage('');
      setShopModalOpen(false);
      setShopEmail('');
      setShopPassword('');
      setShopStoreName('');
      setShopOwnerName('');
      setView('shop_dashboard');
    }, 900);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('landing');
  };

  const handleShopLogout = () => {
    setCurrentShop(null);
    setView('landing');
  };

  // If customer is on the dashboard view, render CustomerDashboard
  if (view === 'customer_dashboard') {
    return (
      <CustomerDashboard
        currentUser={currentUser || { name: 'Jamie Lee', email: 'jamie.lee@example.com' }}
        onLogout={handleLogout}
        onBackToLanding={() => setView('landing')}
      />
    );
  }

  // If shop owner is on dashboard view, render ShopDashboard
  if (view === 'shop_dashboard') {
    return (
      <ShopDashboard
        currentShop={currentShop || INITIAL_SHOPS[0]}
        onBackToHome={() => setView('landing')}
        requests={requestsList}
        onUpdateRequestStatus={(reqId, newStatus) => {
          setRequestsList(prev => prev.map(r => r.id === reqId ? { ...r, status: newStatus } : r));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* 1. Header / Navbar */}
      <header className="bg-[#faf9f6] border-b border-slate-200/70 sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Repeat className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900">
              ReturnSphere
            </span>
          </div>

          {/* Login Buttons & Authenticated State */}
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('customer_dashboard')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs shadow-sm hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer"
                  title="Open Customer Dashboard"
                >
                  {currentUser.provider === 'google' ? (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  ) : (
                    <User className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span className="font-semibold text-slate-800">{currentUser.name}</span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">Customer</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="text-xs text-slate-500 hover:text-rose-600 font-medium px-1.5 py-1"
                >
                  Sign Out
                </button>
              </div>
            )}

            {currentShop && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setView('shop_dashboard')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs shadow-sm hover:border-slate-800 hover:bg-slate-50 transition-all cursor-pointer"
                  title="Open Shop Owner Dashboard"
                >
                  <Store className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-semibold text-slate-800">{currentShop.name}</span>
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">Owner</span>
                </button>
                <button
                  onClick={handleShopLogout}
                  className="text-xs text-slate-500 hover:text-rose-600 font-medium px-1.5 py-1"
                >
                  Sign Out
                </button>
              </div>
            )}

            {!currentUser && (
              <button
                id="nav-customer-login"
                onClick={() => setCustomerModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              >
                Customer Login
              </button>
            )}

            {!currentShop && (
              <button
                id="nav-shop-login"
                onClick={() => setShopModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
              >
                Shop Owner Login
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-12 pb-20 sm:pt-16 sm:pb-24 border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Hero Copy */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Top Tag */}
              <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600 tracking-wider uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span>BUILT FOR THE NEXT STEP IN COMMERCE</span>
              </div>

              {/* Big Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.08]">
                Returns,<br />
                without the<br />
                runaround.
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-slate-600 max-w-lg leading-relaxed">
                Turn return policies and available stock into a clear next step. A simpler way for customers to find the right fit—and shops to stay in control.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  id="hero-customer-login"
                  onClick={() => {
                    if (currentUser) {
                      setView('customer_dashboard');
                    } else {
                      setCustomerModalOpen(true);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-sm transition-all"
                >
                  <span>{currentUser ? 'Go to Customer Dashboard' : 'Customer Login'}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  id="hero-shop-login"
                  onClick={() => {
                    if (currentShop) {
                      setView('shop_dashboard');
                    } else {
                      setShopModalOpen(true);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-semibold text-sm hover:bg-slate-50 shadow-sm transition-all"
                >
                  <span>{currentShop ? 'Go to Shop Dashboard' : 'Shop Owner Login'}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {/* Hackathon Concept Note */}
              <p className="text-xs text-slate-400 font-normal pt-2">
                24-hour hackathon concept • One connected return & exchange flow
              </p>
            </div>

            {/* Right Column: Hero Floating Card UI Mockup */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6 space-y-5">
                
                {/* Card Top Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Repeat className="w-3.5 h-3.5 text-slate-500" />
                    <span>Exchange workspace</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    DEMO DATA
                  </span>
                </div>

                {/* Exchange Request Title Row */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    EXCHANGE REQUEST • RF-1042
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <h3 className="text-base font-bold text-slate-900">
                      A better fit, on its way.
                    </h3>
                    <ArrowLeftRight className="w-4 h-4 text-blue-600 stroke-[2.2]" />
                  </div>
                </div>

                {/* Product Item Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-600">
                      <Shirt className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        Everyday Tee
                      </h4>
                      <div className="text-xs text-slate-500 font-medium">
                        Sage / M <span className="text-slate-400">→</span> Sage / L
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Order #2086 • Delivered 3 days ago
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-sm text-slate-900">
                    $32.00
                  </div>
                </div>

                {/* 01 Policy Validation */}
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="text-emerald-600 font-mono text-[11px]">01</span>
                    <span>Policy validation</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>Within return window</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">8 of 30 days</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>Product & condition eligible</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">Unworn • tags on</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>Proof of purchase matched</span>
                      </div>
                      <span className="text-slate-400 text-[11px]">Order #2086</span>
                    </div>
                  </div>
                </div>

                {/* 02 Live Stock Check */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-mono text-[11px]">02</span>
                      <span>Live stock check</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-normal">
                      Simulated inventory
                    </span>
                  </div>

                  {/* Stock Input Pill */}
                  <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 flex items-center justify-between bg-white text-xs">
                    <span className="font-semibold text-slate-800">{selectedSize}</span>
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      8 available
                    </span>
                  </div>
                </div>

                {/* Bottom Card Action: Eligible for exchange */}
                <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-blue-950">
                        Eligible for exchange
                      </div>
                      <div className="text-[11px] text-blue-700">
                        Ready for shop review and stock reservation
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Section 2: "THE RETURNS PROBLEM" */}
      <section className="py-20 bg-[#faf9f6]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Header */}
          <div className="space-y-2 mb-10">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
              THE RETURNS PROBLEM
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Returns are slow.<br />
              Rules and stock get in the way.
            </h2>
          </div>

          {/* 3 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="p-7 rounded-2xl bg-[#f5f4ef] border border-slate-200/50 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <MessageSquare className="w-5 h-5 text-blue-600 mb-4 stroke-[1.8]" />
                <h3 className="font-bold text-base text-slate-900 mb-2">
                  Rules are unclear
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                  Customers ask. Teams check. Rules are repeated.
                </p>
              </div>
              <a 
                href="#how-it-works" 
                className="text-xs font-semibold text-teal-700 flex items-center gap-1.5 hover:underline"
              >
                <span>→</span> Show the rules once
              </a>
            </div>

            {/* Card 2 */}
            <div className="p-7 rounded-2xl bg-[#f5f4ef] border border-slate-200/50 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <Package className="w-5 h-5 text-blue-600 mb-4 stroke-[1.8]" />
                <h3 className="font-bold text-base text-slate-900 mb-2">
                  Stock is unknown
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                  Exchanges fail when the right item is out of stock.
                </p>
              </div>
              <a 
                href="#how-it-works" 
                className="text-xs font-semibold text-teal-700 flex items-center gap-1.5 hover:underline"
              >
                <span>→</span> Show what is in stock
              </a>
            </div>

            {/* Card 3 */}
            <div className="p-7 rounded-2xl bg-[#f5f4ef] border border-slate-200/50 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <GitFork className="w-5 h-5 text-blue-600 mb-4 stroke-[1.8]" />
                <h3 className="font-bold text-base text-slate-900 mb-2">
                  Next steps are unclear
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
                  Requests get lost because nobody knows what happens next.
                </p>
              </div>
              <a 
                href="#how-it-works" 
                className="text-xs font-semibold text-teal-700 flex items-center gap-1.5 hover:underline"
              >
                <span>→</span> Show the next step
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Section 3: "HOW IT WORKS" (Mint Sage Tint Background) */}
      <section id="how-it-works" className="py-20 bg-[#edf5ee] border-t border-emerald-100/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          {/* Header */}
          <div className="space-y-2 mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
              HOW IT WORKS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              One request.<br />
              A clear path to resolution.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed pt-1">
              Business rules decide what's possible. Inventory decides what's available. ReturnSphere brings them into the same conversation.
            </p>
          </div>

          {/* Stepper Grid (4 Steps) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Step 01 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="hidden lg:block text-slate-400 font-bold text-sm">›</span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 mb-1">01</div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1.5">
                  Start a request
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Find the order, choose the item, and tell the shop what didn't work.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <ListChecks className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="hidden lg:block text-slate-400 font-bold text-sm">›</span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 mb-1">02</div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1.5">
                  Validate the policy
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Check the window, eligibility, condition, and proof of purchase.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Boxes className="w-5 h-5 stroke-[2]" />
                </div>
                <span className="hidden lg:block text-slate-400 font-bold text-sm">›</span>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 mb-1">03</div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1.5">
                  Check available stock
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Match the preferred size and color, or surface an available alternative.
                </p>
              </div>
            </div>

            {/* Step 04 */}
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <ArrowLeftRight className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 mb-1">04</div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-1.5">
                  Resolve with clarity
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Send the request for review and keep both sides updated on the next step.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-12 text-slate-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-100">
            
            {/* Logo and Tagline */}
            <div className="md:col-span-6 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Repeat className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  ReturnSphere
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                Clear policies. Available options.<br />
                A better way to move forward.
              </p>
            </div>

            {/* Links Columns */}
            <div className="md:col-span-3 space-y-2.5 text-xs">
              <div className="font-bold text-slate-900">Explore</div>
              <div><a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it works</a></div>
              <div><span className="text-slate-500">Business rules</span></div>
              <div><span className="text-slate-500">Inventory-aware exchanges</span></div>
            </div>

            <div className="md:col-span-3 space-y-2.5 text-xs">
              <div className="font-bold text-slate-900">Choose your experience</div>
              <div>
                <button 
                  onClick={() => setCustomerModalOpen(true)}
                  className="hover:text-blue-600 transition-colors"
                >
                  Customer Login
                </button>
              </div>
              <div>
                <button 
                  onClick={() => setShopModalOpen(true)}
                  className="hover:text-blue-600 transition-colors"
                >
                  Shop Owner Login
                </button>
              </div>
            </div>

          </div>

          {/* Subfooter */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>ReturnSphere • 24-hour hackathon concept</div>
            <div>Illustrative UI and demo data. Login buttons are conceptual entry points.</div>
          </div>
        </div>
      </footer>

      {/* --- CUSTOMER LOGIN MODAL WITH GOOGLE AUTHENTICATION --- */}
      {customerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <button 
              onClick={() => {
                setCustomerModalOpen(false);
                setShowGoogleChooser(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
              <User className="w-5 h-5" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">
              {customerAuthMode === 'signin' ? 'Customer Sign In' : 'Customer Sign Up'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              {customerAuthMode === 'signin' 
                ? 'Sign in with your Google account or email & password.' 
                : 'Create an account to start managing your returns and exchanges.'}
            </p>

            {loginMessage && (
              <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> 
                <span>{loginMessage}</span>
              </div>
            )}

            {/* Google Account Chooser State */}
            {showGoogleChooser ? (
              <div className="space-y-3 py-1 animate-fadeIn">
                <div className="text-center pb-2 border-b border-slate-100">
                  {/* Google 4-Color Logo */}
                  <svg className="w-6 h-6 mx-auto mb-1.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <p className="text-xs font-semibold text-slate-800">Choose a Google Account</p>
                  <p className="text-[11px] text-slate-400">to continue to ReturnSphere</p>
                </div>

                {/* Account 1: Customer 1 (Bag in Clothes & Bags Store) */}
                <button
                  type="button"
                  onClick={() => handleSelectGoogleAccount('Alex Morgan', 'alex.morgan@gmail.com')}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex items-center gap-3 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    A
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 flex items-center justify-between">
                      <span>Alex Morgan</span>
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Bag Return</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">alex.morgan@gmail.com</div>
                  </div>
                </button>

                {/* Account 2: Customer 2 (Phone in Mobile & Accessories Store) */}
                <button
                  type="button"
                  onClick={() => handleSelectGoogleAccount('Jamie Lee', 'jamie.lee@gmail.com')}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 flex items-center gap-3 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    J
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 flex items-center justify-between">
                      <span>Jamie Lee</span>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Phone Exchange</span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">jamie.lee@gmail.com</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShowGoogleChooser(false)}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 pt-1"
                >
                  ← Back to email login
                </button>
              </div>
            ) : (
              <>
                {/* 1. Official Google Sign-In Button */}
                <button
                  type="button"
                  onClick={() => setShowGoogleChooser(true)}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-700 font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2.5 active:scale-95"
                >
                  {/* Google 4-Color Logo */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>
                    {customerAuthMode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
                  </span>
                </button>

                {/* Divider */}
                <div className="relative my-4 flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-2.5 text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                    or with email
                  </span>
                </div>

                {/* Email & Password Form */}
                <form onSubmit={handleCustomerAuthSubmit} className="space-y-3">
                  {/* Full Name for Sign Up */}
                  {customerAuthMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="e.g. Alex Morgan"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <input 
                      type="password" 
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    {customerAuthMode === 'signin' ? 'Sign In with Email' : 'Create Account'}
                  </button>
                </form>

                {/* Toggle Between Sign In and Sign Up */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
                  {customerAuthMode === 'signin' ? (
                    <>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerAuthMode('signup');
                          setLoginMessage('');
                        }}
                        className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Sign Up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerAuthMode('signin');
                          setLoginMessage('');
                        }}
                        className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Sign In
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- SHOP OWNER LOGIN / SIGN UP MODAL --- */}
      {shopModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 p-6 animate-scaleUp">
            
            {/* Close Button */}
            <button 
              onClick={() => {
                setShopModalOpen(false);
                setShowShopGoogleChooser(false);
                setLoginMessage('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Icon */}
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-3">
              <Store className="w-5 h-5 text-amber-400" />
            </div>

            {/* Modal Title & Subtitle */}
            <h3 className="text-lg font-bold text-slate-900">
              {shopAuthMode === 'signin' ? 'Shop Owner Login' : 'Register Your Store'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              {shopAuthMode === 'signin' 
                ? 'Access store settings, review requests, and manage inventory.' 
                : 'Create your merchant portal to automate returns and exchanges.'}
            </p>

            {/* Success Message Banner */}
            {loginMessage && (
              <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{loginMessage}</span>
              </div>
            )}

            {/* Google Account Chooser State for Shop Owner */}
            {showShopGoogleChooser ? (
              <div className="space-y-3 py-1 animate-fadeIn">
                <div className="text-center pb-2 border-b border-slate-100">
                  <svg className="w-6 h-6 mx-auto mb-1.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <p className="text-xs font-semibold text-slate-800">Choose a Merchant Google Account</p>
                  <p className="text-[11px] text-slate-400">to continue to ReturnSphere Merchant</p>
                </div>

                {/* Shop Owner 1: Clothes & Bags Store */}
                <button
                  type="button"
                  onClick={() => handleSelectShopGoogleAccount('Elena Rostova', 'clothes.bags@returnsphere.com', 'Everyday Clothes & Bags')}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-slate-800 hover:bg-slate-50 flex items-center gap-3 transition-all text-left group"
                >
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    👗
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 flex items-center justify-between">
                      <span>Elena Rostova</span>
                      <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Clothes & Bags</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium truncate">Everyday Clothes & Bags</div>
                    <div className="text-[10px] text-slate-400 truncate font-mono">clothes.bags@returnsphere.com</div>
                  </div>
                </button>

                {/* Shop Owner 2: Mobile & Accessories Store */}
                <button
                  type="button"
                  onClick={() => handleSelectShopGoogleAccount('Marcus Vance', 'mobile.tech@returnsphere.com', 'Apex Mobile & Accessories')}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-slate-800 hover:bg-slate-50 flex items-center gap-3 transition-all text-left group"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    📱
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 flex items-center justify-between">
                      <span>Marcus Vance</span>
                      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Mobile & Tech</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium truncate">Apex Mobile & Accessories</div>
                    <div className="text-[10px] text-slate-400 truncate font-mono">mobile.tech@returnsphere.com</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShowShopGoogleChooser(false)}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 pt-1"
                >
                  ← Back to email login
                </button>
              </div>
            ) : (
              <>
                {/* 1. Official Google Sign-In Button */}
                <button
                  type="button"
                  onClick={() => setShowShopGoogleChooser(true)}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-700 font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2.5 active:scale-95"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>
                    {shopAuthMode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
                  </span>
                </button>

                {/* Divider */}
                <div className="relative my-4 flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-2.5 text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                    or with email
                  </span>
                </div>

                {/* Email & Password Form (with Store Name & Owner Name for Sign Up) */}
                <form onSubmit={handleShopAuthSubmit} className="space-y-3">
                  {shopAuthMode === 'signup' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Store / Business Name</label>
                        <input 
                          type="text" 
                          value={shopStoreName}
                          onChange={(e) => setShopStoreName(e.target.value)}
                          required
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                          placeholder="e.g. Apex Electronics & Sound"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Owner Name</label>
                        <input 
                          type="text" 
                          value={shopOwnerName}
                          onChange={(e) => setShopOwnerName(e.target.value)}
                          required
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                          placeholder="e.g. Marcus Vance"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {shopAuthMode === 'signup' ? 'Business Email Address' : 'Email Address'}
                    </label>
                    <input 
                      type="email" 
                      value={shopEmail}
                      onChange={(e) => setShopEmail(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      placeholder="owner@apexretail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <input 
                      type="password" 
                      value={shopPassword}
                      onChange={(e) => setShopPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    {shopAuthMode === 'signin' ? 'Sign In as Shop Owner' : 'Create Merchant Account'}
                  </button>
                </form>

                {/* Toggle Between Sign In and Sign Up */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
                  {shopAuthMode === 'signin' ? (
                    <>
                      Don't have a merchant account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setShopAuthMode('signup');
                          setLoginMessage('');
                        }}
                        className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Sign Up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have a merchant account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setShopAuthMode('signin');
                          setLoginMessage('');
                        }}
                        className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Sign In
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
