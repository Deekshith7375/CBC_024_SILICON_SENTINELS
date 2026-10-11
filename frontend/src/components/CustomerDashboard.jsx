import React, { useState, useEffect } from 'react';
import { submitReturnClaim, fetchReturns } from '../services/api';
import { 
  Repeat, 
  PackagePlus, 
  Truck, 
  History, 
  HelpCircle, 
  ChevronsUpDown, 
  Search, 
  Bell, 
  Image as ImageIcon, 
  CheckCircle2, 
  ArrowRight, 
  Send, 
  MessageSquare, 
  Package, 
  Headphones, 
  ArrowUpRight, 
  ChevronDown, 
  Info,
  LogOut,
  Upload,
  Check,
  RotateCcw,
  Mail,
  X,
  Maximize2,
  Scan,
  Camera,
  RefreshCw,
  XCircle,
  AlertTriangle
} from 'lucide-react';

const ANGLE_DEFINITIONS = [
  { key: 'front', number: 1, name: 'Angle 1 · Front View', hint: 'Full front silhouette & condition' },
  { key: 'back', number: 2, name: 'Angle 2 · Back View', hint: 'Rear panel, back pocket or neckline' },
  { key: 'detail', number: 3, name: 'Angle 3 · Detail / Defect', hint: 'Close-up of defect, zipper, buttons or stitching' },
  { key: 'label', number: 4, name: 'Angle 4 · Tag & Label', hint: 'Brand label, size tag & care instructions' }
];

const COMPANY_SUGGESTIONS = [
  { name: 'Everyday Clothes & Bags', category: 'Clothing, Apparel & Bags', icon: '👗', color: 'bg-blue-600' },
  { name: 'Apex Mobile & Accessories', category: 'Smartphones, Mobile & Tech', icon: '📱', color: 'bg-slate-900' },
];

const DEFAULT_HISTORY_ITEMS = [];

export default function CustomerDashboard({ 
  currentUser, 
  onLogout, 
  onBackToLanding 
}) {
  const isCustomer2 = currentUser?.name?.toLowerCase().includes('jamie') || currentUser?.email?.toLowerCase().includes('jamie');

  const [activeNav, setActiveNav] = useState('request'); // 'request' | 'track' | 'history'
  const [actionType, setActionType] = useState(isCustomer2 ? 'exchange' : 'return'); // 'return' | 'exchange'
  const [selectedReason, setSelectedReason] = useState(isCustomer2 ? 'Exchanging for different model' : 'Defective/Damaged');
  
  // Company input with Autocomplete
  const [companyName, setCompanyName] = useState(isCustomer2 ? 'Apex Mobile & Accessories' : 'Everyday Clothes & Bags');
  const [showCompanyAutocomplete, setShowCompanyAutocomplete] = useState(false);
  const [showAllCompanies, setShowAllCompanies] = useState(false);

  // Order ID input: strictly 8 characters with numbers and letters
  const [orderId, setOrderId] = useState(isCustomer2 ? 'AP8921PH' : 'NL20791B');
  const [orderIdError, setOrderIdError] = useState('');

  const [detailsText, setDetailsText] = useState('');
  const [customReasonText, setCustomReasonText] = useState('');
  
  // Customer image uploads state: starts completely empty — awaiting user uploaded photos
  const [customerAngles, setCustomerAngles] = useState([]);
  const [selectedAngleModal, setSelectedAngleModal] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [saveDraftNotice, setSaveDraftNotice] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProductView, setSelectedProductView] = useState('uploaded'); // 'uploaded' | 'catalog'
  const [historySortOrder, setHistorySortOrder] = useState('recent'); // 'recent' | 'oldest'
  const [selectedHistoryClaim, setSelectedHistoryClaim] = useState(null);
  const [trackClaimData, setTrackClaimData] = useState(null);
  const [customerReturnsList, setCustomerReturnsList] = useState([]);
  const [isLoadingReturns, setIsLoadingReturns] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState('');

  const loadCustomerReturns = async () => {
    try {
      setIsLoadingReturns(true);
      const email = currentUser?.email || (isCustomer2 ? 'jamie.lee@gmail.com' : 'alex.morgan@gmail.com');
      let list = [];
      
      try {
        const resByEmail = await fetchReturns(null, null, email, null);
        if (Array.isArray(resByEmail) && resByEmail.length > 0) {
          list = resByEmail;
        }
      } catch (e) {}

      if (list.length === 0 && orderId) {
        try {
          const resByOrder = await fetchReturns(null, null, null, orderId);
          if (Array.isArray(resByOrder) && resByOrder.length > 0) {
            list = resByOrder;
          }
        } catch (e) {}
      }

      // If still empty, fetch all store returns to find customer's match
      if (list.length === 0) {
        try {
          const allRes = await fetchReturns(null, null, null, null);
          if (Array.isArray(allRes)) {
            list = allRes.filter(r => 
              (r.customer_email && r.customer_email.toLowerCase() === email.toLowerCase()) ||
              (r.order_id && r.order_id.toUpperCase() === orderId.toUpperCase())
            );
          }
        } catch (e) {}
      }

      if (list.length > 0) {
        setCustomerReturnsList(list);
        setTrackClaimData(list[0]);
      }
      setLastRefreshedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn("Could not sync customer returns:", err);
    } finally {
      setIsLoadingReturns(false);
    }
  };

  useEffect(() => {
    if (isCustomer2) {
      setCompanyName('Apex Mobile & Accessories');
      setOrderId('AP8921PH');
      setActionType('exchange');
      setSelectedReason('Exchanging for different model');
    } else {
      setCompanyName('Everyday Clothes & Bags');
      setOrderId('NL20791B');
      setActionType('return');
      setSelectedReason('Defective/Damaged');
    }
  }, [currentUser, isCustomer2]);

  // Sync on mount and account switch
  useEffect(() => {
    loadCustomerReturns();
  }, [currentUser, isCustomer2, orderId]);

  // Sync on tab switch & auto-poll every 3 seconds in Track and History tabs
  useEffect(() => {
    if (activeNav === 'track' || activeNav === 'history') {
      loadCustomerReturns();
      const interval = setInterval(() => {
        loadCustomerReturns();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [activeNav]);

  // Active target product based on customer and company
  const isMobileTech = isCustomer2 || orderId === 'AP8921PH' || orderId === 'ORD-5104' || companyName.toLowerCase().includes('mobile') || companyName.toLowerCase().includes('apex');

  const resolvedProduct = isMobileTech ? {
    id: 'inv-mt-1',
    name: 'Apex Flagship Pro Smartphone · 256GB',
    shortName: 'Apex Flagship Pro Smartphone',
    specs: 'Titanium Grey · 256GB · 6.7" OLED 120Hz Display',
    price: '$899.00',
    numericPrice: 899.00,
    image: '/assets/mobile-smartphone.jpg',
    shop_id: 'shop_mobile_tech',
    store_name: 'Apex Mobile & Accessories',
    defaultAction: 'exchange',
    returningSpecs: 'Titanium Grey · 256GB',
    requestedSpecs: 'Titanium Grey · Replacement Unit'
  } : {
    id: 'inv-cb-4',
    name: 'Everyday Commute Backpack · 22L',
    shortName: 'Everyday Commute Backpack',
    specs: 'Midnight Navy · 22L · Water-resistant Ballistic Nylon',
    price: '$89.00',
    numericPrice: 89.00,
    image: '/assets/inv-everyday-backpack.jpg',
    shop_id: 'shop_clothes_bags',
    store_name: 'Everyday Clothes & Bags',
    defaultAction: 'return',
    returningSpecs: 'Midnight Navy · 22L',
    requestedSpecs: 'Full refund of $89.00'
  };

  const handleUploadAngle = (angleKey, file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const def = ANGLE_DEFINITIONS.find(d => d.key === angleKey);
    setCustomerAngles(prev => {
      const idx = prev.findIndex(a => a.key === angleKey);
      const newObj = {
        id: `angle-${angleKey}-${Date.now()}`,
        key: angleKey,
        number: def ? def.number : 1,
        angle: def ? def.name : `Angle ${angleKey}`,
        title: `${def ? def.name.split('·')[1]?.trim() : 'View'} (Customer upload)`,
        filename: file.name,
        url: url,
        file: file
      };
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newObj;
        return updated;
      }
      return [...prev, newObj];
    });
  };

  const handleMultipleFilesUpload = (files) => {
    if (!files || files.length === 0) return;
    const keys = ['front', 'back', 'detail', 'label'];
    Array.from(files).forEach((file, index) => {
      if (index < keys.length) {
        handleUploadAngle(keys[index], file);
      }
    });
  };

  const handleRemoveAngle = (angleKey) => {
    setCustomerAngles(prev => prev.filter(a => a.key !== angleKey));
  };

  const handleClearAllAngles = () => {
    setCustomerAngles([]);
  };

  // Live active claim tracked from MongoDB Atlas and merchant responses
  const activeClaim = trackClaimData || 
    customerReturnsList.find(r => r.order_id && orderId && r.order_id.toUpperCase() === orderId.toUpperCase()) ||
    (customerReturnsList.length > 0 ? customerReturnsList[0] : null);

  const activeClaimStatus = activeClaim?.status || (isSubmitted ? 'under_review' : 'under_review');
  const isClaimApproved = activeClaimStatus === 'approved' || activeClaimStatus === 'accepted';
  const isClaimRejected = activeClaimStatus === 'rejected' || activeClaimStatus === 'declined';
  const isClaimPending = !isClaimApproved && !isClaimRejected;

  const activeClaimHistory = activeClaim?.history || [];
  const latestHistoryEntry = activeClaimHistory.length > 0 ? activeClaimHistory[activeClaimHistory.length - 1] : null;
  const decisionNote = latestHistoryEntry?.note || '';

  // Effective customer angles to display (from current session or from saved database return)
  const activeCustomerAngles = customerAngles.length > 0 ? customerAngles : (
    activeClaim?.customer_image ? [{
      id: 'claim-angle-1',
      key: 'front',
      title: activeClaim.product_name || 'Customer Proof Angle',
      angle: 'Customer Uploaded Photo',
      filename: activeClaim.customer_image.split('/').pop() || 'customer_photo.jpg',
      url: activeClaim.customer_image
    }] : []
  );

  const sortedHistoryItems = [...customerReturnsList].map((ret, idx) => {
    const isEx = ret.type === 'exchange';
    let statusLabel = 'Under Review';
    let statusDetail = 'Pending store owner review';
    if (ret.status === 'approved' || ret.status === 'accepted') {
      statusLabel = isEx ? 'Exchange Approved' : 'Refund Approved';
      statusDetail = 'Accepted by Store Owner';
    } else if (ret.status === 'rejected' || ret.status === 'declined') {
      statusLabel = 'Declined';
      statusDetail = 'Rejected by Store Owner';
    }

    const dateStr = ret.created_at ? ret.created_at.split(' ').slice(0, 3).join(' ') : '11 Oct 2026';
    const timeStr = ret.created_at ? ret.created_at.split(' ').slice(3).join(' ') : 'Just now';

    return {
      id: ret.id,
      orderId: `#${ret.order_id}`,
      rawOrderId: ret.order_id,
      productTitle: ret.product_name || (ret.order_id === 'AP8921PH' ? 'Apex Flagship Pro Smartphone · 256GB' : 'Everyday Commute Backpack · 22L'),
      specs: ret.order_id === 'AP8921PH' ? 'Titanium Grey · 256GB' : 'Midnight Navy · 22L',
      image: ret.customer_image || (ret.order_id === 'AP8921PH' ? '/assets/mobile-smartphone.jpg' : '/assets/inv-everyday-backpack.jpg'),
      date: dateStr,
      time: timeStr,
      status: ret.status,
      statusType: ret.type,
      statusLabel: statusLabel,
      statusDetail: statusDetail,
      amount: ret.order_id === 'AP8921PH' ? '$899.00' : '$89.00',
      reason: ret.reason || 'Customer request',
      similarity_score: Math.round(ret.similarity_score || ret.vision_score || 85),
      inspectionNotes: ret.history?.[ret.history?.length - 1]?.note || `AI Visual Match Score: ${Math.round(ret.similarity_score || 85)}% against catalog reference standard.`,
      history: ret.history || [],
      raw: ret,
      timestamp: ret.created_at ? (new Date(ret.created_at).getTime() || (Date.now() - idx * 1000)) : (Date.now() - idx * 1000)
    };
  }).sort((a, b) => {
    return historySortOrder === 'recent' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
  });

  // Autocomplete filtering: show all companies when dropdown arrow is clicked or input is blank
  const displayedCompanies = (showAllCompanies || !companyName.trim())
    ? COMPANY_SUGGESTIONS
    : COMPANY_SUGGESTIONS.filter(c =>
        c.name.toLowerCase().includes(companyName.toLowerCase())
      );

  const handleToggleCompanyDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!showCompanyAutocomplete) {
      setShowAllCompanies(true);
      setShowCompanyAutocomplete(true);
    } else {
      setShowCompanyAutocomplete(false);
      setShowAllCompanies(false);
    }
  };

  // Order ID Validation (strictly 8 characters, numbers & letters)
  const handleOrderIdChange = (e) => {
    const filtered = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
    setOrderId(filtered);
    if (orderIdError) setOrderIdError('');
  };

  const hasLetters = /[A-Z]/.test(orderId);
  const hasNumbers = /[0-9]/.test(orderId);
  const isEightChars = orderId.length === 8;
  const isOrderIdValid = hasLetters && hasNumbers && isEightChars;

  // Available reasons
  const reasons = isMobileTech ? [
    'Defective or not turning on',
    'Screen or cosmetic defect',
    'Wrong item received',
    'Exchanging for different model',
    'Other'
  ] : [
    'Defective/Damaged',
    'Wrong Size',
    'Wrong Product',
    'Other'
  ];

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) {
      alert("Please enter a company name.");
      return;
    }
    if (!isOrderIdValid) {
      setOrderIdError("Order ID must be exactly 8 characters containing both numbers and letters (e.g. EV204819).");
      return;
    }
    if (customerAngles.length === 0) {
      alert("Please upload at least one photo of your product before submitting.");
      return;
    }
    if (selectedReason === 'Other' && !customReasonText.trim()) {
      alert("Please specify your reason for the return or exchange.");
      return;
    }
    setIsSubmitted(true);

    try {
      const formData = new FormData();
      formData.append('order_id', orderId);
      formData.append('request_type', actionType);
      formData.append('reason', selectedReason === 'Other' ? customReasonText : selectedReason);
      formData.append('notes', detailsText);
      formData.append('customer_name', currentUser?.name || (isCustomer2 ? 'Jamie Lee' : 'Alex Morgan'));
      formData.append('customer_email', currentUser?.email || (isCustomer2 ? 'jamie.lee@gmail.com' : 'alex.morgan@gmail.com'));
      formData.append('shop_id', resolvedProduct.shop_id);
      formData.append('product_id', resolvedProduct.id);
      
      const primaryAngle = customerAngles.find(a => a.key === 'front') || customerAngles[0];
      if (primaryAngle?.file) {
        formData.append('primary_image', primaryAngle.file);
        formData.append('front_image', primaryAngle.file);
      } else if (primaryAngle?.url) {
        formData.append('customer_image_url', primaryAngle.url);
      }

      const backAngle = customerAngles.find(a => a.key === 'back');
      if (backAngle?.file) formData.append('back_image', backAngle.file);

      const detailAngle = customerAngles.find(a => a.key === 'detail');
      if (detailAngle?.file) formData.append('detail_image', detailAngle.file);

      const labelAngle = customerAngles.find(a => a.key === 'label');
      if (labelAngle?.file) formData.append('tag_image', labelAngle.file);

      const res = await submitReturnClaim(formData);
      if (res) {
        setTrackClaimData(res);
        setCustomerReturnsList(prev => [res, ...prev.filter(p => p.id !== res.id)]);
      }
    } catch (err) {
      console.warn("Backend submit fallback:", err.message);
    }

    setTimeout(() => {
      // Switch to track tab after submission
      setActiveNav('track');
    }, 1200);
  };

  const handleSaveDraft = () => {
    setSaveDraftNotice(true);
    setTimeout(() => setSaveDraftNotice(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col md:flex-row font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      
      {/* =========================================
          1. LEFT SIDEBAR (Matching 1st Screenshot)
         ========================================= */}
      <aside className="w-full md:w-64 bg-[#ffffff] border-r border-slate-200/80 flex flex-col justify-between shrink-0">
        
        {/* Top Part */}
        <div className="p-6">
          
          {/* Brand Header */}
          <div 
            onClick={onBackToLanding}
            className="flex items-center gap-2.5 cursor-pointer group mb-8"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              Return Sphere
            </span>
          </div>

          {/* Section: YOUR WORKSPACE */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              YOUR WORKSPACE
            </div>

            {/* Nav Item 1: Request (Active by default) */}
            <button
              onClick={() => setActiveNav('request')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'request'
                  ? 'bg-[#f1f0eb] text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PackagePlus className={`w-4 h-4 ${activeNav === 'request' ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>Request</span>
              </div>
              {activeNav === 'request' && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </button>

            {/* Nav Item 2: Track */}
            <button
              onClick={() => setActiveNav('track')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'track'
                  ? 'bg-[#f1f0eb] text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Truck className={`w-4 h-4 ${activeNav === 'track' ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>Track</span>
              </div>
              {activeNav === 'track' && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </button>

            {/* Nav Item 3: History */}
            <button
              onClick={() => setActiveNav('history')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeNav === 'history'
                  ? 'bg-[#f1f0eb] text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <History className={`w-4 h-4 ${activeNav === 'history' ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>History</span>
              </div>
              {activeNav === 'history' && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </button>
          </div>

        </div>

        {/* Bottom Part of Sidebar */}
        <div className="p-6 pt-0">
          
          {/* Help Center */}
          <button 
            onClick={() => alert("ReturnSphere Help Center: Contact support anytime or check store policies.")}
            className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors px-3 py-2 w-full"
          >
            <HelpCircle className="w-4 h-4 stroke-[1.8]" />
            <span>Help center</span>
          </button>

          <div className="border-t border-slate-200/80 my-3" />

          {/* User Profile Footer */}
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#edece7] text-slate-700 font-bold text-xs flex items-center justify-center">
                {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'JL'}
              </div>
              <div className="text-left">
                <div className="font-bold text-xs text-slate-900 leading-tight">
                  {currentUser?.name || 'Jamie Lee'}
                </div>
                <div className="text-[11px] text-slate-400">
                  Personal account
                </div>
              </div>
            </div>

            {/* Actions: Sign out or switch */}
            <button 
              onClick={onLogout}
              title="Sign Out / Back to Landing"
              className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </aside>

      {/* =========================================
          2. MAIN CONTENT (Matching 2nd Screenshot)
         ========================================= */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 sm:px-10 flex items-center justify-between">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            <span 
              onClick={onBackToLanding}
              className="hover:text-slate-700 cursor-pointer"
            >
              Workspace
            </span>
            <span>›</span>
            <span className="text-slate-900 font-semibold">
              {activeNav === 'request' ? 'Customer request' : activeNav === 'track' ? 'Track items' : 'Request history'}
            </span>
          </div>

          {/* Right: Search & Notifications */}
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="Search companies for a return or exchange"
                className="pl-8 pr-3 py-1.5 w-72 rounded-xl bg-[#f3f2ee] border-none text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            <button 
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4 stroke-[1.8]" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute top-1 right-1" />
            </button>
          </div>
        </header>

        {/* Page Content Body */}
        <div className="p-6 sm:p-10 max-w-6xl mx-auto w-full">
          
          {/* Header Title & Subtitle - Dynamic based on activeNav */}
          {activeNav === 'track' ? (
            <div className="mb-8">
              {/* Breadcrumb matching mockup */}
              <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
                <button 
                  type="button"
                  onClick={() => setActiveNav('request')}
                  className="hover:text-slate-700 transition-colors"
                >
                  My account
                </button>
                <span className="text-slate-300">›</span>
                <button 
                  type="button"
                  onClick={() => setActiveNav('request')}
                  className="hover:text-slate-700 transition-colors"
                >
                  Orders
                </button>
                <span className="text-slate-300">›</span>
                <span className="text-slate-900 font-semibold">Return & exchange</span>
              </nav>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
                    Your request, at a glance.
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    We're on it. Follow your exchange and find all the details in one place.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOrderModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors self-start sm:self-auto group"
                >
                  <span>View original order</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ) : activeNav === 'history' ? (
            <div className="mb-8">
              {/* Breadcrumb matching mockup */}
              <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
                <button 
                  type="button"
                  onClick={() => setActiveNav('request')}
                  className="hover:text-slate-700 transition-colors"
                >
                  My account
                </button>
                <span className="text-slate-300">›</span>
                <button 
                  type="button"
                  onClick={() => setActiveNav('request')}
                  className="hover:text-slate-700 transition-colors"
                >
                  Orders
                </button>
                <span className="text-slate-300">›</span>
                <span className="text-slate-900 font-semibold">Return & exchange history</span>
              </nav>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
                    Return & exchange history
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    All your completed requests, neatly in one place.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOrderModal(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors self-start sm:self-auto group"
                >
                  <span>View your orders</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
                Start a return or exchange.
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Tell us what happened and we'll help you with the next steps.
              </p>
            </div>
          )}

          {/* Tab 1: Request View (Matching Mockup 2) */}
          {activeNav === 'request' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Main Form Card */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-7">
                
                {/* Form Card Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Customer request
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Choose a reason and add any details that help.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                    Draft
                  </span>
                </div>

                {isSubmitted && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Return request submitted successfully! Redirecting to tracking...</span>
                  </div>
                )}

                {saveDraftNotice && (
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Draft saved to your workspace.</span>
                  </div>
                )}

                <form onSubmit={handleSubmitRequest} className="space-y-7">
                  
                  {/* STEP 1: Your order */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                        1
                      </span>
                      <span>Your order</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Company Input with Autocomplete */}
                      <div className="relative">
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Company
                        </label>
                        <div className="relative rounded-xl border border-slate-200 bg-white px-3 py-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all z-20">
                          <div className="w-5 h-5 rounded bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {companyName.trim() ? companyName.trim()[0].toUpperCase() : 'R'}
                          </div>
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => {
                              setCompanyName(e.target.value);
                              setShowAllCompanies(false);
                              setShowCompanyAutocomplete(true);
                            }}
                            onFocus={() => {
                              setShowAllCompanies(false);
                              setShowCompanyAutocomplete(true);
                            }}
                            placeholder="Search or enter company..."
                            className="w-full text-xs font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none bg-transparent"
                            required
                          />
                          <button
                            type="button"
                            onClick={handleToggleCompanyDropdown}
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer"
                            title={showCompanyAutocomplete ? "Close suggestions" : "Show all companies"}
                          >
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showCompanyAutocomplete ? 'rotate-180 text-blue-600' : ''}`} />
                          </button>
                        </div>

                        {/* Autocomplete Dropdown List */}
                        {showCompanyAutocomplete && (
                          <>
                            <div 
                              className="fixed inset-0 z-20"
                              onClick={() => {
                                setShowCompanyAutocomplete(false);
                                setShowAllCompanies(false);
                              }}
                            />
                            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1.5 z-30 max-h-52 overflow-y-auto animate-fadeIn">
                              <div className="px-3 py-1 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <span>{showAllCompanies ? 'All Registered Companies' : 'Suggestions'}</span>
                                <span className="font-normal font-mono text-[9px] text-slate-400">
                                  {displayedCompanies.length} available
                                </span>
                              </div>
                              {displayedCompanies.length > 0 ? (
                                displayedCompanies.map((c) => (
                                  <button
                                    key={c.name}
                                    type="button"
                                    onClick={() => {
                                      setCompanyName(c.name);
                                      setShowCompanyAutocomplete(false);
                                      setShowAllCompanies(false);
                                    }}
                                    className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-blue-50/70 transition-colors group cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-5 h-5 rounded ${c.color} text-white font-bold text-[10px] flex items-center justify-center`}>
                                        {c.icon}
                                      </div>
                                      <div>
                                        <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                                          {c.name}
                                        </div>
                                        <div className="text-[10px] text-slate-400">
                                          {c.category}
                                        </div>
                                      </div>
                                    </div>
                                    {companyName === c.name && (
                                      <Check className="w-3.5 h-3.5 text-blue-600" />
                                    )}
                                  </button>
                                ))
                              ) : (
                                <div className="px-3 py-2 text-xs text-slate-500 italic">
                                  Use company: "{companyName}"
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Order ID Input (Strictly 8 characters, letters & numbers) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-medium text-slate-600">
                            Order ID *
                          </label>
                          <span className={`text-[10px] font-mono font-semibold ${
                            orderId.length === 8 
                              ? (isOrderIdValid ? 'text-emerald-600' : 'text-amber-600') 
                              : 'text-slate-400'
                          }`}>
                            {orderId.length} / 8 chars
                          </span>
                        </div>
                        <div className={`relative rounded-xl border bg-white px-3 py-2 flex items-center justify-between transition-all ${
                          orderIdError
                            ? 'border-rose-400 ring-2 ring-rose-100'
                            : isOrderIdValid
                            ? 'border-emerald-400 ring-1 ring-emerald-100'
                            : 'border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'
                        }`}>
                          <div className="flex items-center gap-1.5 w-full">
                            <span className="text-slate-400 text-xs font-mono font-semibold select-none">#</span>
                            <input
                              type="text"
                              value={orderId}
                              onChange={handleOrderIdChange}
                              maxLength={8}
                              required
                              className="w-full text-xs font-mono font-semibold text-slate-800 focus:outline-none placeholder:text-slate-300 uppercase tracking-wider bg-transparent"
                              placeholder="EV204819"
                            />
                          </div>
                          {isOrderIdValid && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-1" />
                          )}
                        </div>
                        {orderIdError ? (
                          <p className="text-[10px] text-rose-600 font-medium mt-1">
                            {orderIdError}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400 mt-1">
                            {orderId.length === 8 && !isOrderIdValid ? (
                              <span className="text-amber-600 font-medium">
                                Must contain both numbers and letters (e.g. EV204819)
                              </span>
                            ) : orderId.length === 8 && isOrderIdValid ? (
                              <span className="text-emerald-600 font-medium">
                                ✓ Valid 8-character Order ID format
                              </span>
                            ) : (
                              <span>Must be exactly 8 characters with numbers and letters.</span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      You'll find your order ID in your confirmation email or receipt.
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-6" />

                  {/* STEP 2: Product images (4 Angles) */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                          2
                        </span>
                        <span>Product images from 4 different angles</span>
                        <span className="text-blue-700 bg-blue-50 border border-blue-200/60 font-semibold px-2 py-0.5 rounded-full text-[10px]">
                          4 Angles Required
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        {customerAngles.length} / 4 angles added
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      Upload 4 clear photos of the product from different angles (Front, Back, Detail/Defect, and Tag/Label). This allows automated vision verification for same-day exchange approval.
                    </p>

                    {/* 4 Photo Angle Slots */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {ANGLE_DEFINITIONS.map((def) => {
                        const item = customerAngles.find(a => a.key === def.key);
                        return (
                          <div 
                            key={def.key} 
                            className={`relative aspect-[4/3] rounded-xl border transition-all flex flex-col items-center justify-center p-2 text-center group overflow-hidden ${
                              item?.url 
                                ? 'border-blue-300 bg-white shadow-xs' 
                                : 'border-dashed border-slate-300 bg-[#f8f7f4] hover:bg-blue-50/40 hover:border-blue-400'
                            }`}
                          >
                            {/* Angle Badge Header */}
                            <div className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] font-bold text-white tracking-wide flex items-center gap-1 shadow-xs">
                              <span className={`w-1 h-1 rounded-full ${item?.url ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                              <span>{def.name.split('·')[0].trim()}</span>
                            </div>

                            {item?.url ? (
                              <>
                                <img 
                                  src={item.url} 
                                  alt={def.name} 
                                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300" 
                                />
                                {/* Bottom label */}
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-1.5 pt-3 text-left">
                                  <div className="text-[10px] font-bold text-white truncate">{item.title || def.name}</div>
                                  <div className="text-[9px] text-slate-200 font-mono truncate">{item.filename}</div>
                                </div>
                                {/* Inspect button */}
                                <button
                                  type="button"
                                  onClick={() => setSelectedAngleModal(item)}
                                  className="absolute top-1.5 right-7 bg-white/95 text-slate-700 hover:text-blue-600 p-1 rounded-md text-[10px] shadow-xs z-20 cursor-pointer"
                                  title="View full angle"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                </button>
                                {/* Remove button */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAngle(def.key)}
                                  className="absolute top-1.5 right-1.5 bg-black/70 text-white p-1 rounded-md text-[10px] hover:bg-rose-600 transition-colors z-20 cursor-pointer"
                                  title="Remove photo"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </>
                            ) : (
                              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-2">
                                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1 group-hover:bg-blue-100 transition-colors">
                                  <Upload className="w-3.5 h-3.5 stroke-[2.2]" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-800">
                                  {def.name.split('·')[1]?.trim() || 'Add Angle'}
                                </span>
                                <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
                                  {def.hint}
                                </span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleUploadAngle(def.key, e.target.files[0]);
                                    }
                                  }} 
                                />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1">
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-semibold text-xs hover:bg-blue-100 transition-colors border border-blue-200/60 cursor-pointer">
                          <Upload className="w-3.5 h-3.5 text-blue-600" />
                          <span>Choose Photo(s) from Device</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            multiple
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                handleMultipleFilesUpload(e.target.files);
                              }
                            }} 
                          />
                        </label>
                        <span className="text-slate-400 text-[11px]">
                          {customerAngles.length === 0 ? "Upload photos directly from your device" : `${customerAngles.length} photo(s) selected`}
                        </span>
                      </div>
                      {customerAngles.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearAllAngles}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer text-xs font-medium"
                        >
                          Clear photos
                        </button>
                      )}
                    </div>

                    {/* What would you like to do? */}
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-slate-900 mb-2">
                        What would you like to do? *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        
                        {/* Option 1: Return */}
                        <button
                          type="button"
                          onClick={() => setActionType('return')}
                          className={`px-4 py-3 rounded-xl border flex items-center justify-between transition-all ${
                            actionType === 'return'
                              ? 'border-blue-600 bg-blue-50/20 text-slate-900'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                            <span>Return</span>
                          </div>
                          {actionType === 'return' && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          )}
                        </button>

                        {/* Option 2: Exchange */}
                        <button
                          type="button"
                          onClick={() => setActionType('exchange')}
                          className={`px-4 py-3 rounded-xl border flex items-center justify-between transition-all ${
                            actionType === 'exchange'
                              ? 'border-blue-600 bg-blue-50/20 text-slate-900'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 text-xs font-semibold">
                            <Repeat className="w-3.5 h-3.5 text-blue-600" />
                            <span>Exchange</span>
                          </div>
                          {actionType === 'exchange' && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          )}
                        </button>

                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-6" />

                  {/* STEP 3: Reason for your request */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                        3
                      </span>
                      <span>Reason for your request *</span>
                    </div>

                    {/* Reason Pills */}
                    <div className="flex flex-wrap gap-2">
                      {reasons.map((r) => {
                        const isSelected = selectedReason === r;
                        return (
                          <button
                            key={r}
                            type="button"
                            onClick={() => {
                              setSelectedReason(r);
                              if (r !== 'Other') {
                                setCustomReasonText('');
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              isSelected
                                ? 'border-blue-600 text-blue-700 bg-blue-50/40 font-semibold ring-1 ring-blue-500/20'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span>{r}</span>
                            {r === 'Other' && <span className="ml-1">⌄</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* If customer selects 'Other', give a field to type their specific reason */}
                    {selectedReason === 'Other' && (
                      <div className="space-y-1.5 pt-1 animate-fadeIn">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Please specify your reason *
                        </label>
                        <input
                          type="text"
                          value={customReasonText}
                          onChange={(e) => setCustomReasonText(e.target.value)}
                          required
                          autoFocus
                          placeholder="Type your specific reason here (e.g. Arrived late, duplicate gift, color mismatch)..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-blue-400 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                        />
                      </div>
                    )}

                    {/* Details Textarea (Pre-text removed, starts empty) */}
                    <div className="relative">
                      <textarea
                        rows={4}
                        value={detailsText}
                        onChange={(e) => setDetailsText(e.target.value)}
                        maxLength={500}
                        placeholder="Please describe the issue or reason for your request in detail..."
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none leading-relaxed"
                      />
                      <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-400 font-mono">
                        {detailsText.length} / 500
                      </span>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-[11px] text-slate-400">
                      * Required fields
                    </span>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleSaveDraft}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Save draft
                      </button>

                      <button
                        type="submit"
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
                      >
                        <span>Submit request</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                </form>

              </div>

              {/* RIGHT COLUMN: Info Cards (What happens next + Need a hand) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Card 1: What happens next? */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      What happens next?
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      A little clarity, every step of the way.
                    </p>
                  </div>

                  {/* 3 Step Icons */}
                  <div className="space-y-4">
                    
                    {/* Step 1 */}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Send className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Send your request
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                          Your details go directly to the company for review.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Hear back from the team
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                          Most companies respond within 1–2 business days.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Follow the next steps
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                          Get return instructions or arrange your exchange.
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Footer Notice */}
                  <div className="pt-4 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-400">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                    <span>Check Track for updates after you submit your request.</span>
                  </div>
                </div>

                {/* Card 2: Need a hand? */}
                <div className="p-6 rounded-2xl bg-[#f1f0eb] border border-slate-200/60 space-y-3">
                  <div className="w-8 h-8 rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-sm">
                    <Headphones className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Need a hand?
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      Not sure where to start? We're here to help with your request.
                    </p>
                  </div>
                  <a
                    href="mailto:support@returnsphere.com"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline pt-1"
                  >
                    <span>Contact support</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>

            </div>
          )}

          {/* Tab 2: Track Items View (Live reflection of merchant decision) */}
          {activeNav === 'track' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Request status + Request details (lg:col-span-7) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* CARD 1: Request status */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
                  
                  {/* Top Bar with Badge & Auto-sync */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                        Request status
                      </h2>
                      <button
                        type="button"
                        onClick={() => loadCustomerReturns()}
                        disabled={isLoadingReturns}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                        title="Sync live status with merchant"
                      >
                        <RefreshCw className={`w-3 h-3 ${isLoadingReturns ? 'animate-spin text-blue-600' : ''}`} />
                        <span className="hidden sm:inline">{isLoadingReturns ? 'Syncing...' : 'Live auto-sync'}</span>
                      </button>
                    </div>
                    
                    {/* Live Status Pill */}
                    {isClaimApproved ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs animate-fadeIn">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                        <span>Approved & Accepted</span>
                      </div>
                    ) : isClaimRejected ? (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-xs animate-fadeIn">
                        <XCircle className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
                        <span>Request Declined</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                        <span>Under review</span>
                      </div>
                    )}
                  </div>

                  {/* Main Status Headline & Description */}
                  <div className="space-y-1.5">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-950 tracking-tight">
                      {isClaimApproved ? (
                        (activeClaim?.type || actionType) === 'exchange'
                          ? "Your phone exchange has been accepted!"
                          : "Your bag return has been accepted!"
                      ) : isClaimRejected ? (
                        (activeClaim?.type || actionType) === 'exchange'
                          ? "Your phone exchange was declined."
                          : "Your bag return was declined."
                      ) : (
                        (activeClaim?.type || actionType) === 'exchange'
                          ? "We're reviewing your phone exchange."
                          : "We're reviewing your bag return."
                      )}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl">
                      {isClaimApproved ? (
                        (activeClaim?.type || actionType) === 'exchange'
                          ? "The store owner has reviewed your claim, verified your uploaded phone condition, and accepted the replacement unit exchange."
                          : "The store owner has reviewed your claim, verified your uploaded bag photos, and approved your full refund of $89.00."
                      ) : isClaimRejected ? (
                        "The store owner evaluated the condition and photos against policy guidelines and declined the return or exchange request."
                      ) : (
                        (activeClaim?.type || actionType) === 'exchange'
                          ? "Your request is safely with Apex Mobile & Accessories. We will verify your uploaded phone condition and prepare your replacement unit."
                          : "Your request is safely with Everyday Clothes & Bags. We will verify your uploaded photos and process your refund of $89.00."
                      )}
                    </p>
                  </div>

                  {/* Decision Banner Callout */}
                  {isClaimApproved ? (
                    <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <div className="font-bold text-emerald-900 flex items-center gap-2">
                          <span>Store Decision: Accepted by Merchant</span>
                          <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-emerald-200/60 text-emerald-800">Verified</span>
                        </div>
                        <p className="text-emerald-800 leading-relaxed text-[11px]">
                          {decisionNote || ((activeClaim?.type || actionType) === 'exchange'
                            ? "Approved & accepted by store owner. Replacement smartphone has been reserved and queued for dispatch."
                            : "Approved & accepted by store owner. Refund of $89.00 has been authorized to your original payment card.")}
                        </p>
                        {activeClaim?.similarity_score && (
                          <div className="text-[11px] font-mono text-emerald-800 pt-0.5">
                            AI Visual Scan: {Math.round(activeClaim.similarity_score)}% similarity match against catalog reference.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : isClaimRejected ? (
                    <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-950 flex items-start gap-3">
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="text-xs space-y-1">
                        <div className="font-bold text-rose-900 flex items-center gap-2">
                          <span>Store Decision: Declined by Merchant</span>
                          <span className="text-[10px] font-medium px-2 py-0.2 rounded-full bg-rose-200/60 text-rose-800">Policy violation</span>
                        </div>
                        <p className="text-rose-800 leading-relaxed text-[11px]">
                          {decisionNote || "Declined by store owner. Submitted item condition diverges from return policy or proof did not satisfy store verification criteria."}
                        </p>
                        {activeClaim?.similarity_score && (
                          <div className="text-[11px] font-mono text-rose-800 pt-0.5">
                            AI Visual Scan: {Math.round(activeClaim.similarity_score)}% match (divergence detected).
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-blue-900 leading-relaxed">
                        <span className="font-semibold">Awaiting store review: </span>
                        The merchant has received your claim with AI verification results. As soon as they accept or reject, this screen will update automatically.
                      </p>
                    </div>
                  )}

                  {/* 4-Step Stepper */}
                  <div className="pt-2 pb-1">
                    <div className="relative">
                      {/* Connecting Line Bar */}
                      <div className="absolute top-3 left-3 right-3 h-[2px] bg-slate-200">
                        {isClaimApproved ? (
                          <div className="h-full bg-emerald-600 w-full transition-all duration-500" />
                        ) : isClaimRejected ? (
                          <div className="h-full bg-rose-500 w-2/3 transition-all duration-500" />
                        ) : (
                          <div className="h-full bg-blue-600 w-1/3 transition-all duration-500" />
                        )}
                      </div>

                      {/* Stepper Steps Grid */}
                      <div className="grid grid-cols-4 relative z-10">
                        
                        {/* Step 1: Submitted (Completed) */}
                        <div className="flex flex-col items-start text-left">
                          <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center shadow-sm ${
                            isClaimApproved ? 'bg-emerald-600' : isClaimRejected ? 'bg-slate-800' : 'bg-blue-600'
                          }`}>
                            <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                          </div>
                          <div className="mt-2.5">
                            <div className="text-xs font-bold text-slate-900 leading-tight">
                              Submitted
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {activeClaim?.created_at ? activeClaim.created_at.split(' ').slice(0, 3).join(' ') : '11 Oct 2026'}
                            </div>
                          </div>
                        </div>

                        {/* Step 2: Under review / Verified */}
                        <div className="flex flex-col items-center text-center">
                          {isClaimApproved || isClaimRejected ? (
                            <div className={`w-6 h-6 rounded-full text-white flex items-center justify-center shadow-sm ${
                              isClaimApproved ? 'bg-emerald-600' : 'bg-slate-800'
                            }`}>
                              <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-blue-600 bg-white ring-4 ring-blue-100 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-blue-600" />
                            </div>
                          )}
                          <div className="mt-2.5">
                            <div className="text-xs font-bold text-slate-900 leading-tight">
                              AI Scan
                            </div>
                            <div className={`text-[11px] font-semibold mt-0.5 ${
                              isClaimApproved ? 'text-emerald-600' : isClaimRejected ? 'text-slate-600' : 'text-blue-600'
                            }`}>
                              Verified
                            </div>
                          </div>
                        </div>

                        {/* Step 3: Store Decision */}
                        <div className="flex flex-col items-center text-center">
                          {isClaimApproved ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                              <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                            </div>
                          ) : isClaimRejected ? (
                            <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-sm">
                              <X className="w-3.5 h-3.5 stroke-[2.8]" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-slate-300 bg-white flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            </div>
                          )}
                          <div className="mt-2.5">
                            <div className="text-xs font-medium text-slate-900 leading-tight">
                              Store review
                            </div>
                            <div className={`text-[11px] mt-0.5 font-semibold ${
                              isClaimApproved ? 'text-emerald-600' : isClaimRejected ? 'text-rose-600' : 'text-slate-400 font-normal'
                            }`}>
                              {isClaimApproved ? 'Accepted' : isClaimRejected ? 'Declined' : 'Pending'}
                            </div>
                          </div>
                        </div>

                        {/* Step 4: Resolution */}
                        <div className="flex flex-col items-end text-right">
                          {isClaimApproved ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                              <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                            </div>
                          ) : isClaimRejected ? (
                            <div className="w-6 h-6 rounded-full border border-rose-300 bg-rose-50 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-slate-300 bg-white flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            </div>
                          )}
                          <div className="mt-2.5">
                            <div className="text-xs font-medium text-slate-600 leading-tight">
                              {isClaimRejected 
                                ? 'Closed' 
                                : ((activeClaim?.type || actionType) === 'return' ? 'Refund issued' : 'Exchange sent')}
                            </div>
                            <div className={`text-[11px] mt-0.5 ${
                              isClaimApproved ? 'text-emerald-600 font-semibold' : isClaimRejected ? 'text-rose-500' : 'text-slate-400'
                            }`}>
                              {isClaimApproved ? 'Completed' : isClaimRejected ? 'Not fulfilled' : "We'll notify you"}
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Card 1 Divider & Footer */}
                  <div className="border-t border-slate-100 pt-4 flex items-center gap-2 text-xs text-slate-500">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Updates will be sent to{' '}
                      <span className="font-semibold text-slate-800">
                        {currentUser?.email || (isCustomer2 ? 'jamie.lee@gmail.com' : 'alex.morgan@gmail.com')}
                      </span>
                    </span>
                  </div>

                </div>

                {/* CARD 2: Request details */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
                  
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      Request details
                    </h2>
                    <span className="text-xs font-mono text-slate-500 font-semibold">
                      Request #{activeClaim?.id || 'EX-20481'}
                    </span>
                  </div>

                  {/* Metadata Grid */}
                  <div className="space-y-4">
                    
                    {/* Top Row: Order ID & Request type */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-xs text-slate-400">
                          Order ID
                        </div>
                        <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">
                          #{activeClaim?.order_id || orderId || 'NL20791B'}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-400">
                          Request type
                        </div>
                        <div className="text-sm font-semibold text-slate-900 mt-0.5">
                          {(activeClaim?.type || actionType) === 'return' ? 'Return for refund' : 'Product exchange'}
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100" />

                    {/* Bottom Row: Submission Date & Outcome */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-xs text-slate-400">
                          Date of request submission
                        </div>
                        <div className="text-sm font-semibold text-slate-900 mt-0.5">
                          {activeClaim?.created_at ? activeClaim.created_at.split(' ').slice(0, 3).join(' ') : '11 Oct 2026'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {activeClaim?.created_at ? activeClaim.created_at.split(' ').slice(3).join(' ') : 'Submitted at 10:42 AM'}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-400">
                          Merchant status
                        </div>
                        <div className={`text-sm font-bold mt-0.5 ${
                          isClaimApproved ? 'text-emerald-600' : isClaimRejected ? 'text-rose-600' : 'text-blue-600'
                        }`}>
                          {isClaimApproved ? 'Approved & Accepted' : isClaimRejected ? 'Declined by Store' : 'Under Review'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {activeClaim?.similarity_score ? `${Math.round(activeClaim.similarity_score)}% AI visual match` : 'Policy verified'}
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Helpful Hint Link */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1 px-1">
                  <button
                    type="button"
                    onClick={() => setActiveNav('request')}
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 self-start cursor-pointer"
                  >
                    <span>← Create another return or exchange</span>
                  </button>
                  <span className="text-slate-400 text-left sm:text-right">
                    Need help?{' '}
                    <a href="mailto:support@returnsphere.com" className="text-blue-600 hover:underline font-medium">Contact support</a>
                  </span>
                </div>

              </div>

              {/* RIGHT COLUMN: Your exchange (lg:col-span-5) */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
                  
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                        {(activeClaim?.type || actionType) === 'return' ? 'Your return' : 'Your exchange'}
                      </h2>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {selectedProductView === 'uploaded' 
                          ? `${activeCustomerAngles.length} customer product angle(s) added` 
                          : 'Catalog reference item'}
                      </p>
                    </div>
                    
                    {/* Toggle between Customer Angles Proof & Catalog Item */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setSelectedProductView('uploaded')}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          selectedProductView === 'uploaded'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Uploaded ({activeCustomerAngles.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedProductView('catalog')}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          selectedProductView === 'catalog'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Catalog
                      </button>
                    </div>
                  </div>

                  {/* Product Photos Section */}
                  {selectedProductView === 'uploaded' ? (
                    activeCustomerAngles.length === 0 ? (
                      <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-8 text-center flex flex-col items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          No Customer Photos Uploaded
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">
                          Please select your photos under Step 2 to preview your uploaded images here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* 2x2 Grid of all Customer Angles */}
                        <div className="grid grid-cols-2 gap-2.5">
                          {activeCustomerAngles.map((angleItem, idx) => (
                            <div 
                              key={angleItem.id || idx}
                              className="group rounded-xl overflow-hidden border border-slate-200/90 bg-slate-50 flex flex-col hover:border-blue-400 hover:shadow-xs transition-all relative"
                            >
                              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                <div className="absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] font-bold text-white tracking-wide flex items-center gap-1 shadow-xs">
                                  <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                                  <span>{angleItem.angle.split('·')[0].trim()}</span>
                                </div>
                                <img 
                                  src={angleItem.url} 
                                  alt={angleItem.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => { e.target.src = resolvedProduct.image; }}
                                />
                                <button
                                  type="button"
                                  onClick={() => setSelectedAngleModal(angleItem)}
                                  className="absolute top-1.5 right-1.5 p-1 rounded-md bg-white/95 text-slate-700 hover:text-blue-600 shadow-xs opacity-90 hover:opacity-100 transition-all z-10 cursor-pointer"
                                  title="Inspect full angle"
                                >
                                  <Maximize2 className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="p-2 flex items-center justify-between text-[10px] bg-white border-t border-slate-100">
                                <span className="font-semibold text-slate-800 truncate">{angleItem.title}</span>
                                <span className="text-slate-400 font-mono text-[9px] shrink-0 ml-1">{angleItem.filename}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Vision Verification Badge Banner */}
                        <div className={`p-2.5 rounded-xl border flex items-center justify-between text-[11px] ${
                          isClaimApproved 
                            ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
                            : isClaimRejected
                            ? 'bg-rose-50/70 border-rose-200/80 text-rose-950'
                            : 'bg-blue-50/70 border-blue-200/60 text-blue-900'
                        }`}>
                          <div className="flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${
                              isClaimApproved ? 'text-emerald-600' : isClaimRejected ? 'text-rose-600' : 'text-blue-600'
                            }`} />
                            <span>{activeCustomerAngles.length} customer angle(s) inspected</span>
                          </div>
                          <span className={`font-mono font-bold ${
                            isClaimApproved ? 'text-emerald-700' : isClaimRejected ? 'text-rose-700' : 'text-blue-700'
                          }`}>
                            {activeClaim?.similarity_score ? `${Math.round(activeClaim.similarity_score)}% Match` : 'Verified'}
                          </span>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="rounded-xl overflow-hidden bg-[#faf8f5] border border-slate-100 flex items-center justify-center relative group p-3">
                      <img 
                        src={resolvedProduct.image} 
                        alt={resolvedProduct.name}
                        className="w-full h-auto object-contain max-h-56 transition-transform duration-300 group-hover:scale-[1.02]"
                        onError={(e) => {
                          e.target.src = '/assets/sneakers-ref.jpg';
                        }}
                      />
                      {activeCustomerAngles.length > 0 && (
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setSelectedProductView('uploaded')}
                            className="text-[10px] font-semibold px-3 py-1.5 rounded-lg bg-black/75 hover:bg-black/90 text-white backdrop-blur-md transition-colors cursor-pointer"
                          >
                            View {activeCustomerAngles.length} Customer Uploaded Photo(s) →
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Item Description */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {companyName ? companyName.toUpperCase() : resolvedProduct.store_name.toUpperCase()}
                    </div>
                    <div className="text-base font-bold text-slate-900 mt-0.5">
                      {resolvedProduct.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {resolvedProduct.specs} · {resolvedProduct.price}
                    </div>
                  </div>

                  {/* Size Swap Pill Box (Blue Theme) */}
                  <div className="bg-slate-50/90 border border-slate-200/70 rounded-xl p-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                        {actionType === 'return' ? 'Returning Item' : 'Current Item'}
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5 truncate max-w-[130px]">
                        {resolvedProduct.shortName}
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mx-2" />

                    <div className="text-right">
                      <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide">
                        {actionType === 'return' ? 'Refund Status' : 'Requested'}
                      </div>
                      <div className="text-xs font-bold text-blue-600 mt-0.5">
                        {actionType === 'return' ? `Full Refund (${resolvedProduct.price})` : 'Product Exchange'}
                      </div>
                    </div>
                  </div>

                  {/* Reason for Request */}
                  <div>
                    <div className="text-xs text-slate-400">
                      Reason for {actionType === 'return' ? 'return' : 'exchange'}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 mt-1">
                      {selectedReason === 'Other' 
                        ? (customReasonText.trim() || 'Defective/Damaged') 
                        : (selectedReason || 'Defective/Damaged')}
                    </div>
                  </div>

                  {/* Reassurance Footer */}
                  <div className="border-t border-slate-100 pt-3.5 flex items-center gap-2 text-xs text-slate-600">
                    <RotateCcw className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{actionType === 'return' ? 'Full refund backed by ReturnSphere Guarantee.' : 'Same piece. A better fit. No extra cost.'}</span>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* Tab 3: History View (Matching reference mockup) */}
          {activeNav === 'history' && (
            <div className="space-y-6">
              
              {/* Main Completed Requests Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                
                {/* Card Header */}
                <div className="p-6 pb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      Completed requests
                    </h2>
                    <span className="text-xs text-slate-400 font-medium">
                      {sortedHistoryItems.length} requests
                    </span>
                  </div>

                  {/* Sort Dropdown / Button */}
                  <button
                    type="button"
                    onClick={() => setHistorySortOrder(prev => prev === 'recent' ? 'oldest' : 'recent')}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors cursor-pointer group"
                  >
                    <span>{historySortOrder === 'recent' ? 'Most recent first' : 'Oldest first'}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform ${historySortOrder === 'oldest' ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Table Container */}
                <div className="overflow-x-auto">
                  <div className="min-w-[660px]">
                    
                    {/* Table Column Headers */}
                    <div className="grid grid-cols-12 gap-4 px-6 py-2.5 bg-[#f6f9fc]/80 border-y border-slate-100 text-xs text-slate-400 font-medium select-none">
                      <div className="col-span-5">Product</div>
                      <div className="col-span-3">Order ID</div>
                      <div className="col-span-2">Completed on</div>
                      <div className="col-span-2 text-right">Status</div>
                    </div>

                    {/* Table Rows or Empty State */}
                    {sortedHistoryItems.length === 0 ? (
                      <div className="py-12 px-6 text-center flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                          <History className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">No requests recorded yet</h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm">
                            Submit a return or exchange request under the "Request Return" tab to track its status and view historical outcomes.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveNav('request')}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                        >
                          Submit a request
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {sortedHistoryItems.map((item) => (
                          <div 
                            key={item.id}
                            onClick={() => setSelectedHistoryClaim(item)}
                            className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-slate-50/70 transition-all cursor-pointer group"
                          >
                            {/* Product Column */}
                            <div className="col-span-5 flex items-center gap-3.5 min-w-0">
                              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-[#faf8f5] border border-slate-200/60 shrink-0 shadow-2xs">
                                <img 
                                  src={item.image} 
                                  alt={item.productTitle} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => { e.target.src = '/assets/sneakers-ref.jpg'; }}
                                />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                  {item.productTitle}
                                </h3>
                                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
                                  {item.specs}
                                </p>
                              </div>
                            </div>

                            {/* Order ID Column */}
                            <div className="col-span-3">
                              <span className="font-mono text-xs font-semibold text-slate-700">
                                {item.orderId}
                              </span>
                            </div>

                            {/* Completed on Column */}
                            <div className="col-span-2">
                              <div className="text-xs font-semibold text-slate-900">
                                {item.date}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {item.time}
                              </div>
                            </div>

                            {/* Status Column */}
                            <div className="col-span-2 text-right">
                              {item.status === 'approved' || item.status === 'accepted' ? (
                                <div className="inline-flex flex-col items-end">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                                    <span>{item.statusType === 'exchange' ? 'Exchange Approved' : 'Refund Approved'}</span>
                                  </span>
                                  <span className="text-[11px] font-medium text-emerald-700 mt-1">
                                    Accepted by Store
                                  </span>
                                </div>
                              ) : item.status === 'rejected' || item.status === 'declined' ? (
                                <div className="inline-flex flex-col items-end">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
                                    <XCircle className="w-3 h-3 text-rose-600 stroke-[2.5]" />
                                    <span>Declined</span>
                                  </span>
                                  <span className="text-[11px] font-medium text-rose-700 mt-1">
                                    Rejected by Store
                                  </span>
                                </div>
                              ) : (
                                <div className="inline-flex flex-col items-end">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-2xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                    <span>Under Review</span>
                                  </span>
                                  <span className="text-[11px] font-medium text-slate-500 mt-1">
                                    Pending decision
                                  </span>
                                </div>
                              )}
                            </div>

                          </div>
                        ))}
                      </div>
                    )}


                  </div>
                </div>

                {/* Table Footer Inside Card */}
                <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Showing all {sortedHistoryItems.length} completed requests</span>
                  <span>You're all caught up.</span>
                </div>

              </div>

              {/* Bottom Page Footer Note */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 px-1 pt-1">
                <span>Have a question about a past return or exchange?</span>
                <a 
                  href="mailto:support@returnsphere.com"
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 transition-colors self-start sm:self-auto group"
                >
                  <span>Contact us</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>

            </div>
          )}

          {/* Bottom Disclaimer for Request Tab */}
          {activeNav === 'request' && (
            <div className="mt-8 text-center sm:text-left text-[11px] text-slate-400">
              Your details and photos are shared only with the company handling your request.
            </div>
          )}

        </div>

      </main>

      {/* Original Order Details Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Original Order #{orderId || 'FF-108294'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Placed on October 02, 2026 · Delivered on October 06, 2026
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Item Summary */}
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <img 
                src={resolvedProduct.image} 
                alt={resolvedProduct.name}
                className="w-14 h-14 rounded-lg object-cover bg-white border border-slate-200/80" 
                onError={(e) => { e.target.src = '/assets/sneakers-ref.jpg'; }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {companyName ? companyName.toUpperCase() : resolvedProduct.store_name.toUpperCase()}
                </div>
                <div className="text-xs font-bold text-slate-900 truncate">
                  {resolvedProduct.name}
                </div>
                <div className="text-[11px] text-slate-500">
                  {resolvedProduct.specs} · Qty 1
                </div>
              </div>
              <div className="text-xs font-bold text-slate-900">
                {resolvedProduct.price}
              </div>
            </div>

            {/* Receipt Breakdown */}
            <div className="space-y-2 text-xs border-b border-slate-100 pb-4">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{resolvedProduct.price}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Standard Shipping</span>
                <span className="text-blue-600 font-semibold">Free</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Estimated Tax</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Paid</span>
                <span>{resolvedProduct.price}</span>
              </div>
            </div>

            {/* Meta: Shipping & Payment */}
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
              <div>
                <div className="font-bold text-slate-900 mb-1">Shipping address</div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  {currentUser?.name || 'Alex Morgan'}<br />
                  742 Evergreen Terrace<br />
                  Springfield, OR 97477
                </div>
              </div>
              <div>
                <div className="font-bold text-slate-900 mb-1">Payment method</div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  Visa ending in 4242<br />
                  Authorized on Oct 02, 2026
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Close details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Selected History Claim Details Modal */}
      {selectedHistoryClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
            
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Claim Details · {selectedHistoryClaim.orderId}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Completed on {selectedHistoryClaim.date} at {selectedHistoryClaim.time}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHistoryClaim(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Snapshot */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <img 
                src={selectedHistoryClaim.image} 
                alt={selectedHistoryClaim.productTitle}
                className="w-14 h-14 rounded-lg object-cover bg-white border border-slate-200/80" 
                onError={(e) => { e.target.src = '/assets/sneakers-ref.jpg'; }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {selectedHistoryClaim.productTitle}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {selectedHistoryClaim.specs}
                </div>
                <div className="mt-1.5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    selectedHistoryClaim.status === 'approved' || selectedHistoryClaim.status === 'accepted'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : selectedHistoryClaim.status === 'rejected' || selectedHistoryClaim.status === 'declined'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                  }`}>
                    {(selectedHistoryClaim.status === 'approved' || selectedHistoryClaim.status === 'accepted') && (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                    )}
                    {(selectedHistoryClaim.status === 'rejected' || selectedHistoryClaim.status === 'declined') && (
                      <XCircle className="w-3 h-3 text-rose-600 stroke-[2.5]" />
                    )}
                    {selectedHistoryClaim.status !== 'approved' && selectedHistoryClaim.status !== 'accepted' && selectedHistoryClaim.status !== 'rejected' && selectedHistoryClaim.status !== 'declined' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    )}
                    <span>{selectedHistoryClaim.statusLabel} ({selectedHistoryClaim.statusDetail})</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quality & Resolution Info */}
            <div className="space-y-3 text-xs">
              <div className={`p-3.5 rounded-xl border ${
                selectedHistoryClaim.status === 'approved' || selectedHistoryClaim.status === 'accepted'
                  ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950'
                  : selectedHistoryClaim.status === 'rejected' || selectedHistoryClaim.status === 'declined'
                  ? 'bg-rose-50/70 border-rose-200/80 text-rose-950'
                  : 'bg-blue-50/60 border-blue-100 text-blue-950'
              }`}>
                <div className="font-bold mb-1 flex items-center justify-between">
                  <span>Store Owner Decision & Verification</span>
                  <span className="font-mono text-[10px] uppercase font-bold">
                    {selectedHistoryClaim.status?.toUpperCase() || 'REVIEW'}
                  </span>
                </div>
                <div className="leading-relaxed text-[11px]">
                  {selectedHistoryClaim.inspectionNotes}
                </div>
              </div>

              {/* Show customer uploaded photo if available */}
              {selectedHistoryClaim.image && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={selectedHistoryClaim.image} 
                      alt="Customer proof" 
                      className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200"
                      onError={(e) => { e.target.src = '/assets/sneakers-ref.jpg'; }}
                    />
                    <div>
                      <div className="text-[11px] font-bold text-slate-800">Customer Proof</div>
                      <div className="text-[10px] text-slate-400">Inspected by ReturnSphere AI</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Visual Match</div>
                    <div className="text-xs font-bold text-emerald-600 font-mono">
                      {selectedHistoryClaim.similarity_score}%
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <div className="text-slate-400">Total Value</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedHistoryClaim.amount}</div>
                </div>
                <div>
                  <div className="text-slate-400">Reason Recorded</div>
                  <div className="font-semibold text-slate-800 mt-0.5 truncate">{selectedHistoryClaim.reason}</div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedHistoryClaim(null)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Close claim summary
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Customer 4-Angle Inspection Modal */}
      {selectedAngleModal && (
        <div 
          onClick={() => setSelectedAngleModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 animate-scaleUp space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedAngleModal.angle || 'Product Angle'} · {selectedAngleModal.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedAngleModal.filename}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAngleModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4 Angle Navigation Tabs in Modal */}
            <div className="grid grid-cols-4 gap-2">
              {customerAngles.map((photo, pIdx) => {
                const isActive = selectedAngleModal.key === photo.key;
                return (
                  <button
                    key={photo.key || photo.id || pIdx}
                    type="button"
                    onClick={() => setSelectedAngleModal(photo)}
                    className={`flex items-center gap-2 p-1.5 rounded-lg text-left border transition-all cursor-pointer ${
                      isActive 
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-500/20' 
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.title}
                      className="w-7 h-7 rounded object-cover border border-slate-200 shrink-0" 
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold truncate">Angle {photo.number || pIdx + 1}</div>
                      <div className="text-[9px] text-slate-400 truncate">{photo.title}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="py-2 flex items-center justify-center bg-slate-900/5 rounded-xl overflow-hidden min-h-[300px]">
              <img 
                src={selectedAngleModal.url} 
                alt={selectedAngleModal.title} 
                className="max-h-[50vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Submitted by customer for automated return/exchange verification
              </span>
              <button
                type="button"
                onClick={() => setSelectedAngleModal(null)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                Close preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
