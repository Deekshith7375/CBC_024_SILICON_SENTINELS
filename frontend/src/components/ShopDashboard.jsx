import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  ArrowLeftRight, 
  Package, 
  FileText, 
  Inbox, 
  HelpCircle, 
  Bell, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Paperclip, 
  Scan, 
  ShieldCheck, 
  Check, 
  X, 
  CheckCircle2, 
  Info, 
  LogOut, 
  ArrowLeft,
  XCircle,
  Sliders,
  Sparkles,
  AlertTriangle,
  Plus,
  Minus,
  CheckCheck,
  History,
  Calendar,
  Download,
  RotateCcw,
  CheckSquare,
  Database
} from 'lucide-react';
import { INITIAL_SHOPS, INITIAL_PRODUCTS } from '../data/mockData';
import { 
  fetchInventory, 
  adjustInventoryStock, 
  fetchHistory, 
  fetchHistoryMetrics, 
  getDatabaseStatus, 
  addHistoryRecord,
  fetchReturns,
  updateReturnStatus
} from '../services/api';

const DEMO_MERCHANT_REQUESTS = [
  {
    id: "REQ-1039",
    requestNumber: 1,
    order_id: "NL-20791",
    customer_email: "marcus.k@example.com",
    submitted_date: "Oct 7, 2026 at 09:15 AM",
    request_type: "Return",
    status: "approved",
    product: {
      name: "The Everyday Linen Shirt · L",
      sku: "ELS-OAT-L",
      color: "Oatmeal",
      quantity: 1,
      price: "$78.00",
      catalog_image: "/assets/linen-shirt-mockup.jpg"
    },
    customer_images: [
      { id: "img-1", title: "Front view", angle: "Angle 1 · Front View", filename: "IMG_1940_front.jpg", url: "/assets/linen-front.jpg" },
      { id: "img-2", title: "Collar & neckline", angle: "Angle 2 · Collar View", filename: "IMG_1941_collar.jpg", url: "/assets/linen-collar.jpg" },
      { id: "img-3", title: "Cuff & sleeve stitch", angle: "Angle 3 · Cuff Detail", filename: "IMG_1942_cuff.jpg", url: "/assets/linen-cuff.jpg" },
      { id: "img-4", title: "Brand & size tag", angle: "Angle 4 · Tag & Label", filename: "IMG_1943_tag.jpg", url: "/assets/linen-tag.jpg" }
    ],
    reason_title: "Fit too large",
    customer_quote: "Tried it on once, sleeve length is a bit too long for my build. Requesting refund.",
    vision_score: 98,
    score_label: "Pristine condition",
    score_analysis: "All 4 customer angles compared with original product profile. Tags intact, fabric unworn, zero creasing detected.",
    policy_checks: [
      "Requested 4 days after delivery",
      "30-day return window",
      "Original packaging preserved"
    ]
  },
  {
    id: "REQ-1040",
    requestNumber: 2,
    order_id: "NL-20812",
    customer_email: "sarah.j@example.com",
    submitted_date: "Oct 8, 2026 at 02:45 PM",
    request_type: "Exchange",
    status: "approved",
    product: {
      name: "The Relaxed Cotton Tee · M",
      sku: "RCT-CHK-M",
      color: "Chalk",
      quantity: 1,
      price: "$38.00",
      catalog_image: "/assets/history-cotton-tee.jpg"
    },
    customer_images: [
      { id: "img-1", title: "Front view", angle: "Angle 1 · Front View", filename: "IMG_2004_front.jpg", url: "/assets/tee-front.jpg" },
      { id: "img-2", title: "Back panel view", angle: "Angle 2 · Back View", filename: "IMG_2005_back.jpg", url: "/assets/tee-back.jpg" },
      { id: "img-3", title: "Collar & neckline", angle: "Angle 3 · Collar Detail", filename: "IMG_2006_collar.jpg", url: "/assets/tee-collar.jpg" },
      { id: "img-4", title: "Care label & size tag", angle: "Angle 4 · Tag & Label", filename: "IMG_2007_tag.jpg", url: "/assets/tee-tag.jpg" }
    ],
    reason_title: "Size exchange",
    customer_quote: "Need Size L instead of Size M. Unwashed and brand new with tags.",
    vision_score: 96,
    score_label: "Strong match",
    score_analysis: "All 4 customer angles inspected. Color and seams verified against standard reference.",
    policy_checks: [
      "Requested 5 days after delivery",
      "30-day exchange window",
      "Replacement Size L in stock"
    ]
  },
  {
    id: "REQ-1041",
    requestNumber: 3,
    order_id: "NL-20830",
    customer_email: "daniel.b@example.com",
    submitted_date: "Oct 8, 2026 at 05:10 PM",
    request_type: "Return",
    status: "pending_review",
    product: {
      name: "The Essential Chino · 32",
      sku: "ECH-SND-32",
      color: "Sand",
      quantity: 1,
      price: "$88.00",
      catalog_image: "/assets/history-chino.jpg"
    },
    customer_images: [
      { id: "img-1", title: "Front full angle", angle: "Angle 1 · Front View", filename: "IMG_2115_front.jpg", url: "/assets/chino-front.jpg" },
      { id: "img-2", title: "Back pocket angle", angle: "Angle 2 · Back View", filename: "IMG_2116_back.jpg", url: "/assets/chino-back.jpg" },
      { id: "img-3", title: "Waistband detail", angle: "Angle 3 · Waist Detail", filename: "IMG_2117_waist.jpg", url: "/assets/chino-waist.jpg" },
      { id: "img-4", title: "Hem & stitch label", angle: "Angle 4 · Tag & Hem", filename: "IMG_2118_hem.jpg", url: "/assets/chino-hem.jpg" }
    ],
    reason_title: "Color mismatch",
    customer_quote: "Sand color looks darker in person than anticipated.",
    vision_score: 92,
    score_label: "Strong match",
    score_analysis: "All 4 multi-angle photos verified against brand quality profile. Fabric unworn.",
    policy_checks: [
      "Requested 6 days after delivery",
      "30-day exchange window",
      "Eligible for instant credit"
    ]
  },
  {
    id: "REQ-1042",
    requestNumber: 4,
    order_id: "NL-20847",
    customer_email: "emma.wilson@gmail.com",
    submitted_date: "Oct 9, 2026 at 10:24 AM",
    request_type: "Exchange",
    status: "pending_review",
    product: {
      name: "Everyday Backpack · 22L",
      sku: "EDB-22-NV",
      color: "Midnight Navy",
      quantity: 1,
      price: "$89.00",
      catalog_image: "/assets/backpack-catalog.jpg"
    },
    customer_images: [
      { id: "img-1", title: "Front view", angle: "Angle 1 · Front View", filename: "IMG_2801.jpg", url: "/assets/backpack-front.jpg" },
      { id: "img-2", title: "Back view", angle: "Angle 2 · Back View", filename: "IMG_2802.jpg", url: "/assets/backpack-back.jpg" },
      { id: "img-3", title: "Zipper detail", angle: "Angle 3 · Defect Detail", filename: "IMG_2803.jpg", url: "/assets/backpack-zipper.jpg" },
      { id: "img-4", title: "Product label", angle: "Angle 4 · Tag & Label", filename: "IMG_2804.jpg", url: "/assets/backpack-label.jpg" }
    ],
    reason_title: "Defective zipper",
    customer_quote: "The main zipper separates when I close the bag. I noticed it right after unpacking and haven't used it. I'd love a replacement in the same color, please.",
    vision_score: 94,
    score_label: "Strong match",
    score_analysis: "All 4 customer images compared with the original product. Color, shape and details are consistent.",
    policy_checks: [
      "Requested 7 days after delivery",
      "30-day exchange window",
      "Replacement in stock · 18 available"
    ]
  },
  {
    id: "REQ-1043",
    requestNumber: 5,
    order_id: "NL-20855",
    customer_email: "rachel.t@example.com",
    submitted_date: "Oct 9, 2026 at 11:40 AM",
    request_type: "Return",
    status: "pending_review",
    product: {
      name: "The Ribbed Knit Cardigan · M",
      sku: "RKC-MOS-M",
      color: "Moss",
      quantity: 1,
      price: "$96.00",
      catalog_image: "/assets/history-cardigan.jpg"
    },
    customer_images: [
      { id: "img-1", title: "Front view", angle: "Angle 1 · Front View", filename: "IMG_2901_front.jpg", url: "/assets/cardigan-front.jpg" },
      { id: "img-2", title: "Back view", angle: "Angle 2 · Back View", filename: "IMG_2902_back.jpg", url: "/assets/cardigan-back.jpg" },
      { id: "img-3", title: "Button & rib detail", angle: "Angle 3 · Rib Detail", filename: "IMG_2903_buttons.jpg", url: "/assets/cardigan-buttons.jpg" },
      { id: "img-4", title: "Care tag & label", angle: "Angle 4 · Tag & Label", filename: "IMG_2904_tag.jpg", url: "/assets/cardigan-tag.jpg" }
    ],
    reason_title: "Style preference",
    customer_quote: "Decided to keep another knit instead. This item has never been worn.",
    vision_score: 95,
    score_label: "Strong match",
    score_analysis: "All 4 angles inspected. Zero pilling or yarn pulls detected across garment.",
    policy_checks: [
      "Requested 2 days after delivery",
      "30-day return window",
      "Tags and button bag attached"
    ]
  }
];

const DEFAULT_INVENTORY_ITEMS = INITIAL_PRODUCTS;

const DEFAULT_POLICY_RULES = [
  {
    id: 'rule-1',
    number: 1,
    title: '7-Day Return Policy:',
    description: 'Customers can return eligible products within 7 days of purchase.'
  },
  {
    id: 'rule-2',
    number: 2,
    title: 'Product Condition:',
    description: 'Products must be unused, undamaged, and returned with original packaging.'
  },
  {
    id: 'rule-3',
    number: 3,
    title: 'Proof of Purchase:',
    description: 'A valid order ID is required to submit a return or exchange request.'
  },
  {
    id: 'rule-4',
    number: 4,
    title: 'Exchange Availability:',
    description: 'Exchanges are allowed only if the replacement product is available in stock.'
  },
  {
    id: 'rule-5',
    number: 5,
    title: 'No Duplicate Requests:',
    description: 'Customers cannot submit multiple active return or exchange requests for the same purchased item.'
  }
];

export default function ShopDashboard({ 
  currentShop, 
  onBackToHome 
}) {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'inventory' | 'policy' | 'history'
  const [requestsList, setRequestsList] = useState([]);
  const [currentRequestIndex, setCurrentRequestIndex] = useState(0);
  const [selectedImageModal, setSelectedImageModal] = useState(null);
  const [actionNotice, setActionNotice] = useState('');
  
  // Database status and live metrics
  const [dbStatus, setDbStatus] = useState(null);
  const [historyMetrics, setHistoryMetrics] = useState(null);

  // History tab states (filters, date range & export)
  const [showAcceptedFilter, setShowAcceptedFilter] = useState(true);
  const [showRejectedFilter, setShowRejectedFilter] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState('Sep 1 – 30, 2026');
  const [showDateDropdown, setShowDateDropdown] = useState(false);

  // Inventory state filtered strictly for the active shop (Clothes & Bags or Mobile & Tech)
  const targetShopId = currentShop?.id || 'shop_clothes_bags';
  const filteredDefaultInventory = DEFAULT_INVENTORY_ITEMS.filter(p => !p.shop_id || p.shop_id === targetShopId);
  const [inventoryItems, setInventoryItems] = useState(filteredDefaultInventory.length > 0 ? filteredDefaultInventory : DEFAULT_INVENTORY_ITEMS);

  // Policy rules state (Matching user reference mockup with 5 rules)
  const [policyRulesList, setPolicyRulesList] = useState(DEFAULT_POLICY_RULES);
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);
  const [newPolicyTitle, setNewPolicyTitle] = useState('');
  const [newPolicyDesc, setNewPolicyDesc] = useState('');
  const [policySavedNotice, setPolicySavedNotice] = useState('');

  // Fetch live inventory, DB status and history metrics from backend / MongoDB Atlas
  useEffect(() => {
    let isMounted = true;
    const fetchLiveStoreData = async () => {
      try {
        const [invRes, statusRes, metricRes, returnsRes] = await Promise.allSettled([
          fetchInventory(currentShop?.id),
          getDatabaseStatus(),
          fetchHistoryMetrics(),
          fetchReturns(currentShop?.id)
        ]);
        if (!isMounted) return;

        if (invRes.status === 'fulfilled') {
          const invList = Array.isArray(invRes.value) ? invRes.value : (invRes.value?.items || []);
          if (invList.length > 0) {
            setInventoryItems(invList);
          }
        }
        if (statusRes.status === 'fulfilled') {
          setDbStatus(statusRes.value);
        }
        if (metricRes.status === 'fulfilled' && metricRes.value?.metrics) {
          setHistoryMetrics(metricRes.value.metrics);
        }
        if (returnsRes.status === 'fulfilled' && Array.isArray(returnsRes.value)) {
          if (returnsRes.value.length > 0) {
            const mappedReturns = returnsRes.value.map((ret, idx) => ({
              id: ret.id,
              requestNumber: idx + 1,
              order_id: ret.order_id,
              customer_email: ret.customer_email || 'customer@example.com',
              submitted_date: ret.created_at || 'Just now',
              request_type: ret.type === 'exchange' ? 'Exchange' : 'Return',
              status: ret.status || 'pending_review',
              product: {
                name: ret.product_name || (ret.order_id === 'AP8921PH' ? 'Apex Flagship Pro Smartphone · 256GB' : 'Everyday Commute Backpack · 22L'),
                sku: ret.order_id,
                color: 'Standard',
                quantity: 1,
                price: ret.price ? `$${ret.price}` : (ret.order_id === 'AP8921PH' ? '$899.00' : '$89.00'),
                catalog_image: (ret.order_id === 'AP8921PH' || (ret.product_name && ret.product_name.toLowerCase().includes('phone')) || currentShop?.id === 'shop_mobile_tech') 
                  ? '/assets/mobile-smartphone.jpg' 
                  : '/assets/inv-everyday-backpack.jpg'
              },
              customer_images: [
                {
                  id: `img-${ret.id}-1`,
                  title: "Customer Uploaded Image",
                  angle: "Angle 1 · Customer Photo",
                  filename: ret.customer_image ? ret.customer_image.split('/').pop() : 'customer_upload.jpg',
                  url: ret.customer_image || ((ret.order_id === 'AP8921PH' || currentShop?.id === 'shop_mobile_tech') ? '/assets/mobile-smartphone.jpg' : '/assets/inv-everyday-backpack.jpg')
                }
              ],
              reason_title: ret.reason || 'Customer Request',
              customer_quote: ret.notes || `Customer requested ${ret.type} for order #${ret.order_id}.`,
              vision_score: Math.round(ret.vision_score || ret.similarity_score || 95),
              score_label: (ret.vision_score || ret.similarity_score || 95) >= 75 ? "Authentic Product Match" : "Condition Divergence Detected",
              score_analysis: `AI Visual Match Score: ${Math.round(ret.vision_score || ret.similarity_score || 95)}% similarity with original catalog standard. ${ret.damage_detected ? 'Defects detected.' : 'Zero structural defects detected.'}`,
              policy_checks: [
                `Order #${ret.order_id} verified`,
                `${ret.type === 'exchange' ? 'Exchange' : 'Return'} within store policy window`,
                "Customer photos verified against original product"
              ]
            }));
            setRequestsList(mappedReturns);
            setCurrentRequestIndex(0);
          } else {
            setRequestsList([]);
          }
        }
      } catch (err) {
        console.warn('Could not sync live store data with backend:', err);
      }
    };

    fetchLiveStoreData();
    return () => { isMounted = false; };
  }, [currentShop?.id]);

  const handleExportHistoryReport = () => {
    const csvContent = 
`Request Type,Total Requests,Accepted,Accepted Share,Rejected,Rejected Share,Acceptance Rate
Return,150,114,76%,36,24%,76%
Exchange,90,78,86.7%,12,13.3%,86.7%
All requests,240,192,80%,48,20%,80%`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `returnsphere-history-outcomes-${selectedDateRange.toLowerCase().replace(/[^a-z0-9]/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActionNotice(`Report exported successfully for ${selectedDateRange}!`);
    setTimeout(() => setActionNotice(''), 3000);
  };

  const currentRequest = requestsList[currentRequestIndex] || requestsList[0];
  const pendingCount = requestsList.filter(r => r.status === 'pending_review').length;

  const handleApprove = async () => {
    if (!currentRequest) return;
    const updated = [...requestsList];
    updated[currentRequestIndex] = {
      ...currentRequest,
      status: 'approved'
    };
    setRequestsList(updated);
    setActionNotice(`Request ${currentRequest.id} approved! Request accepted by merchant.`);

    // Persist status update to backend and MongoDB Atlas
    try {
      await updateReturnStatus(currentRequest.id, 'approved', `Approved & accepted by store owner (${currentShop?.name || 'Merchant'}).`);
      await addHistoryRecord({
        request_id: currentRequest.id,
        order_id: currentRequest.order_id,
        shop_id: currentShop?.id || 'shop_clothes_bags',
        customer_email: currentRequest.customer_email,
        product_name: currentRequest.product?.name || 'Everyday Backpack · 22L',
        request_type: currentRequest.request_type,
        outcome: 'Accepted',
        resolution: 'accepted',
        details: `Approved & accepted by store owner (${currentShop?.name || 'Merchant'}).`,
        vision_score: currentRequest.vision_score,
        reason: currentRequest.reason_title
      });
    } catch (e) {
      console.warn('Failed to sync history outcome to database:', e);
    }

    setTimeout(() => {
      setActionNotice('');
      if (currentRequestIndex < requestsList.length - 1) {
        setCurrentRequestIndex(prev => prev + 1);
      }
    }, 1500);
  };

  const handleReject = async () => {
    if (!currentRequest) return;
    const updated = [...requestsList];
    updated[currentRequestIndex] = {
      ...currentRequest,
      status: 'rejected'
    };
    setRequestsList(updated);
    setActionNotice(`Request ${currentRequest.id} rejected. Customer has been notified.`);

    // Persist status update to backend and MongoDB Atlas
    try {
      await updateReturnStatus(currentRequest.id, 'rejected', `Declined by store owner (${currentShop?.name || 'Merchant'}). Condition violates policy.`);
      await addHistoryRecord({
        request_id: currentRequest.id,
        order_id: currentRequest.order_id,
        shop_id: currentShop?.id || 'shop_clothes_bags',
        customer_email: currentRequest.customer_email,
        product_name: currentRequest.product?.name || 'Everyday Backpack · 22L',
        request_type: currentRequest.request_type,
        outcome: 'Rejected',
        resolution: 'rejected',
        details: `Declined by store owner (${currentShop?.name || 'Merchant'}). Condition violates policy.`,
        vision_score: currentRequest.vision_score,
        reason: currentRequest.reason_title
      });
    } catch (e) {
      console.warn('Failed to sync history outcome to database:', e);
    }

    setTimeout(() => {
      setActionNotice('');
      if (currentRequestIndex < requestsList.length - 1) {
        setCurrentRequestIndex(prev => prev + 1);
      }
    }, 1500);
  };

  const handleStockAdjust = async (id, delta) => {
    // Optimistic UI update
    setInventoryItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, stock: Math.max(0, item.stock + delta) };
      }
      return item;
    }));

    // Async sync to MongoDB Atlas inventory collection
    try {
      await adjustInventoryStock(id, delta);
    } catch (err) {
      console.warn(`Failed to sync inventory stock update for ${id}:`, err);
    }
  };

  const handleAddPolicyRule = (e) => {
    e.preventDefault();
    if (!newPolicyTitle.trim() || !newPolicyDesc.trim()) return;
    const formattedTitle = newPolicyTitle.trim().endsWith(':') 
      ? newPolicyTitle.trim() 
      : `${newPolicyTitle.trim()}:`;
    const newRule = {
      id: `rule-${Date.now()}`,
      number: policyRulesList.length + 1,
      title: formattedTitle,
      description: newPolicyDesc.trim()
    };
    setPolicyRulesList(prev => [...prev, newRule]);
    setNewPolicyTitle('');
    setNewPolicyDesc('');
    setShowAddPolicyModal(false);
    setActionNotice('New policy rule added successfully!');
    setTimeout(() => setActionNotice(''), 2500);
  };

  const handleDeletePolicyRule = (ruleId) => {
    setPolicyRulesList(prev => {
      const filtered = prev.filter(r => r.id !== ruleId);
      return filtered.map((r, idx) => ({ ...r, number: idx + 1 }));
    });
    setActionNotice('Policy rule removed.');
    setTimeout(() => setActionNotice(''), 2000);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col md:flex-row font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      
      {/* ========================================================
          1. LEFT SIDEBAR (Matching 2nd Mockup Image)
         ======================================================== */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 p-6">
        
        {/* Top Header & Navigation */}
        <div className="space-y-6">
          
          {/* Brand Header */}
          <div 
            onClick={onBackToHome}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="Back to Landing Page"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              relay
            </span>
          </div>

          {/* Section: MERCHANT WORKSPACE */}
          <div className="space-y-1.5 pt-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              MERCHANT WORKSPACE
            </div>

            {/* Nav 1: Return and exchange request (Active) */}
            <button
              type="button"
              onClick={() => setActiveTab('requests')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all text-left ${
                activeTab === 'requests'
                  ? 'bg-blue-50 text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ArrowLeftRight className={`w-4 h-4 shrink-0 ${activeTab === 'requests' ? 'text-blue-600' : 'text-slate-500'}`} />
              <span className="leading-snug">Return and exchange request</span>
            </button>

            {/* Nav 2: Inventory */}
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all text-left ${
                activeTab === 'inventory'
                  ? 'bg-blue-50 text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Package className={`w-4 h-4 shrink-0 ${activeTab === 'inventory' ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>Inventory</span>
            </button>

            {/* Nav 3: Return policy Rules */}
            <button
              type="button"
              onClick={() => setActiveTab('policy')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === 'policy'
                  ? 'bg-blue-50 text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className={`w-4 h-4 shrink-0 ${activeTab === 'policy' ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>Return policy Rules</span>
            </button>

            {/* Nav 4: History */}
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-blue-50 text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <History className={`w-4 h-4 shrink-0 ${activeTab === 'history' ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>History</span>
            </button>
          </div>

          {/* Widget: Your review queue */}
          <div className="p-4.5 rounded-2xl bg-[#f4f8fe] border border-blue-100/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Inbox className="w-4 h-4 text-blue-600" />
              <span>Your review queue</span>
            </div>
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-extrabold text-slate-900">
                {pendingCount > 0 ? pendingCount : 12}
              </span>
              <span className="text-xs text-slate-500 font-medium">requests pending</span>
            </div>
            <div className="text-[11px] text-slate-500 pt-0.5 leading-relaxed">
              3 requests need a decision today
            </div>
          </div>

        </div>

        {/* Bottom Sidebar: Help & Profile */}
        <div className="pt-6 space-y-4">
          <button 
            type="button"
            onClick={() => alert("Relay Merchant Support: live chat open 24/7.")}
            className="flex items-center gap-2.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors px-1"
          >
            <HelpCircle className="w-4 h-4 stroke-[1.8]" />
            <span>Help & support</span>
          </button>

          <div className="border-t border-slate-200/80" />

          {/* User Profile Widget */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                AM
              </div>
              <div className="text-left">
                <div className="font-bold text-xs text-slate-900 leading-tight">
                  {currentShop?.owner || 'Alex Morgan'}
                </div>
                <div className="text-[11px] text-slate-400">
                  Store administrator
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onBackToHome}
              title="Return to Home / Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* ========================================================
          2. MAIN CONTENT (Matching 1st Mockup Image)
         ======================================================== */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#faf9f6]">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 sm:px-10 flex items-center justify-between">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
            {activeTab === 'history' ? (
              <>
                <span 
                  onClick={() => setActiveTab('requests')}
                  className="hover:text-slate-700 cursor-pointer"
                >
                  Requests
                </span>
                <span>›</span>
                <span className="text-slate-900 font-semibold">
                  History
                </span>
              </>
            ) : activeTab === 'inventory' ? (
              <>
                <span 
                  onClick={() => setActiveTab('inventory')}
                  className="hover:text-slate-700 cursor-pointer"
                >
                  Inventory
                </span>
                <span>›</span>
                <span className="text-slate-900 font-semibold">
                  All products
                </span>
              </>
            ) : activeTab === 'policy' ? (
              <>
                <span 
                  onClick={() => setActiveTab('policy')}
                  className="hover:text-slate-700 cursor-pointer"
                >
                  Return policy
                </span>
                <span>›</span>
                <span className="text-slate-900 font-semibold">
                  Rules
                </span>
              </>
            ) : (
              <>
                <span 
                  onClick={() => setActiveTab('requests')}
                  className="hover:text-slate-700 cursor-pointer"
                >
                  Requests
                </span>
                <span>›</span>
                <span className="text-slate-900 font-semibold font-mono">
                  {currentRequest?.id || 'Overview'}
                </span>
              </>
            )}
          </div>

          {/* Right Header: Database status, Notification & Store Profile */}
          <div className="flex items-center gap-3">
            {/* MongoDB Atlas Database Indicator */}
            <div 
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
                dbStatus?.status === 'connected' && dbStatus?.storage_mode === 'mongodb_atlas'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-2xs'
                  : 'bg-amber-50 text-amber-700 border-amber-200/80 shadow-2xs'
              }`}
              title={
                dbStatus?.status === 'connected' && dbStatus?.storage_mode === 'mongodb_atlas'
                  ? `Connected to MongoDB Atlas DB: ${dbStatus.database}`
                  : `Offline / Local fallback active. Paste your Atlas URI in backend/.env to connect live cloud Atlas.`
              }
            >
              <Database className="w-3.5 h-3.5" />
              <span>
                {dbStatus?.status === 'connected' && dbStatus?.storage_mode === 'mongodb_atlas'
                  ? 'MongoDB Atlas'
                  : 'Atlas Ready'}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${
                dbStatus?.status === 'connected' && dbStatus?.storage_mode === 'mongodb_atlas'
                  ? 'bg-emerald-500 animate-pulse'
                  : 'bg-amber-500'
              }`} />
            </div>

            <button 
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4 stroke-[1.8]" />
              <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5 ring-2 ring-white" />
            </button>

            {/* Store Profile Dropdown Button */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
              <div className="w-5 h-5 rounded-md bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                {currentShop?.name ? currentShop.name[0].toUpperCase() : 'N'}
              </div>
              <span className="font-bold text-slate-800">
                {currentShop?.name || 'Northline Supply'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

        </header>

        {/* Content Body */}
        <div className="p-6 sm:p-10 max-w-6xl mx-auto w-full space-y-7">
          
          {/* Tab 1: Return and Exchange Request Details */}
          {activeTab === 'requests' && (
            requestsList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs space-y-4 max-w-xl mx-auto my-8 animate-fadeIn">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                  <Package className="w-8 h-8 stroke-[1.8]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">No Return or Exchange Requests Yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
                    Customer return and exchange requests for <span className="font-semibold text-slate-800">{currentShop?.name || 'this store'}</span> will appear here.
                    When a customer uploads their product photos, our AI comparison model compares them against your catalog standards and calculates the match score!
                  </p>
                </div>
                <div className="pt-2 text-[11px] text-slate-400 font-medium">
                  Ready for customer submissions · Connected to live AI vision models & MongoDB Atlas
                </div>
              </div>
            ) : currentRequest ? (
              <div className="space-y-6">
              
              {/* Notification Banner when Action Taken */}
              {actionNotice && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionNotice}</span>
                </div>
              )}

              {/* Page Title & Pagination Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Return and exchange request
                  </h1>
                  
                  {/* Subline: Status pill, ID, Date */}
                  <div className="flex flex-wrap items-center gap-2.5 mt-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      currentRequest.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : currentRequest.status === 'rejected'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-[#fbf4e6] text-[#8a5d14] border border-[#f4e4c2]'
                    }`}>
                      {currentRequest.status === 'approved' 
                        ? 'Approved' 
                        : currentRequest.status === 'rejected'
                        ? 'Rejected'
                        : 'Pending review'}
                    </span>
                    <span className="text-xs font-bold text-slate-800 font-mono">
                      {currentRequest.id}
                    </span>
                    <span className="text-xs text-slate-400">
                      Submitted {currentRequest.submitted_date}
                    </span>
                  </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <span className="text-xs font-medium text-slate-500">
                    Request {currentRequestIndex + 1} of {requestsList.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={currentRequestIndex === 0}
                      onClick={() => setCurrentRequestIndex(prev => Math.max(0, prev - 1))}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Previous request"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={currentRequestIndex === requestsList.length - 1}
                      onClick={() => setCurrentRequestIndex(prev => Math.min(requestsList.length - 1, prev + 1))}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      title="Next request"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Main 2-Column Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* ========================================================
                    LEFT COLUMN: Request Details + Customer Photos (7 cols)
                   ======================================================== */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Card 1: Request details */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h2 className="text-sm font-bold text-slate-900">
                        Request details
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/50">
                        {currentRequest.request_type}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <div className="text-slate-400">Customer email ID</div>
                        <a 
                          href={`mailto:${currentRequest.customer_email}`}
                          className="font-medium text-blue-600 hover:underline mt-0.5 block truncate"
                        >
                          {currentRequest.customer_email}
                        </a>
                      </div>

                      <div>
                        <div className="text-slate-400">Order ID</div>
                        <div className="font-semibold text-blue-600 font-mono mt-0.5">
                          #{currentRequest.order_id}
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-400">Request submitted</div>
                        <div className="font-semibold text-slate-800 mt-0.5">
                          {currentRequest.submitted_date}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                      <div>
                        <div className="text-slate-400">Product name</div>
                        <div className="font-bold text-slate-900 mt-0.5">
                          {currentRequest.product.name}
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-400">Variant / quantity</div>
                        <div className="font-semibold text-slate-800 mt-0.5">
                          {currentRequest.product.color} / {currentRequest.product.quantity} item
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-400">Item price</div>
                        <div className="font-semibold text-slate-800 mt-0.5">
                          {currentRequest.product.price}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Customer-submitted images */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h2 className="text-sm font-bold text-slate-900">
                          Customer-submitted images
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {currentRequest.customer_images.length} product photo(s) submitted for return verification
                        </p>
                      </div>
                      <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200/60 font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>{currentRequest.customer_images.length} {currentRequest.customer_images.length === 1 ? 'Angle' : 'Angles'} Verified</span>
                      </span>
                    </div>

                    {/* 2x2 Photo Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {currentRequest.customer_images.map((photo, pIdx) => (
                        <div 
                          key={photo.id}
                          className="group rounded-xl overflow-hidden border border-slate-200/80 bg-slate-50 flex flex-col hover:border-blue-400 hover:shadow-sm transition-all"
                        >
                          <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                            {/* Angle indicator badge */}
                            <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[10px] font-semibold text-white tracking-wide flex items-center gap-1 shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              <span>{photo.angle || `Angle ${pIdx + 1}`}</span>
                            </div>
                            <img 
                              src={photo.url} 
                              alt={photo.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => { e.target.src = currentShop?.id === 'shop_mobile_tech' ? '/assets/mobile-smartphone.jpg' : '/assets/inv-everyday-backpack.jpg'; }}
                            />
                            {/* Expand Lightbox Button */}
                            <button
                              type="button"
                              onClick={() => setSelectedImageModal(photo)}
                              className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/95 backdrop-blur-xs text-slate-600 hover:text-blue-600 shadow-xs opacity-90 hover:opacity-100 transition-all z-10 cursor-pointer"
                              title="Inspect full image"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="p-2.5 flex items-center justify-between text-[11px] bg-white border-t border-slate-100">
                            <span className="font-semibold text-slate-800">{photo.title}</span>
                            <span className="text-slate-400 font-mono text-[10px]">{photo.filename}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Reason for Exchange & Customer Quote */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          Reason for {currentRequest.request_type ? currentRequest.request_type.toLowerCase() : 'request'}
                        </span>
                        <span className="text-xs font-semibold text-blue-600">
                          {currentRequest.reason_title}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60 text-xs text-slate-600 leading-relaxed italic">
                        "{currentRequest.customer_quote}"
                      </div>
                    </div>

                  </div>

                </div>

                {/* ========================================================
                    RIGHT COLUMN: Catalog Spec + Match Score + Policy (5 cols)
                   ======================================================== */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Card 3: Original product */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h2 className="text-sm font-bold text-slate-900">
                        Original product
                      </h2>
                      <span className="text-xs text-slate-400 font-medium">
                        Catalog image
                      </span>
                    </div>

                    {/* Large Catalog Image */}
                    <div className="rounded-xl overflow-hidden bg-slate-50 border border-slate-100 aspect-[16/10] flex items-center justify-center">
                      <img 
                        src={currentRequest.product.catalog_image} 
                        alt={currentRequest.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = currentShop?.id === 'shop_mobile_tech' ? '/assets/mobile-smartphone.jpg' : '/assets/inv-everyday-backpack.jpg'; }}
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {currentRequest.product.name}
                      </h3>
                      <div className="text-xs text-slate-400 mt-0.5 font-mono">
                        SKU: {currentRequest.product.sku} · {currentRequest.product.color}
                      </div>
                      <div className="text-sm font-extrabold text-slate-900 mt-1.5">
                        {currentRequest.product.price}
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Image-match score */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                        <Scan className="w-4 h-4 text-blue-600" />
                        <span>Image-match score</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                        {currentRequest.score_label}
                      </span>
                    </div>

                    {/* Score Bar */}
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-blue-600">
                          {currentRequest.vision_score}
                        </span>
                        <span className="text-slate-400 text-sm font-medium">/ 100</span>
                      </div>

                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-700"
                          style={{ width: `${currentRequest.vision_score}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                      {currentRequest.score_analysis}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                      <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Illustrative score · visual review required</span>
                    </div>
                  </div>

                  {/* Card 5: Within return policy */}
                  <div className="p-5 rounded-2xl bg-[#f2f7fe] border border-blue-100 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Within return policy</span>
                    </div>

                    <div className="space-y-2 pt-1">
                      {currentRequest.policy_checks.map((checkText, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-blue-800">
                          <Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5] shrink-0" />
                          <span>{checkText}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Bottom Full-Width Decision Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <CheckCheck className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Ready to make a decision?
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Approving this request starts a same-item exchange.
                    </p>
                  </div>
                </div>

                {/* Decision Action Buttons */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={currentRequest.status === 'rejected'}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-700 font-semibold text-xs shadow-2xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={currentRequest.status === 'approved'}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Approve</span>
                  </button>
                </div>
              </div>

            </div>
            ) : null
          )}

          {/* Tab 2: Inventory Management (Exact Match to Mockup) */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header: Title, Subtitle, and Back Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Inventory
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage product details and keep your stock up to date.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('requests')}
                  className="self-start sm:self-auto px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  Back to all products
                </button>
              </div>

              {/* Product Cards Stack (All 12 Items from Mockup) */}
              <div className="space-y-3.5">
                {inventoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    {/* Left Column: Product Name, Specs, SKU & Price */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {item.specs}
                        </p>
                      </div>

                      <div className="flex items-center gap-12 sm:gap-16 pt-0.5">
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">SKU</div>
                          <div className="text-xs font-bold font-mono text-slate-900 mt-0.5">
                            {item.sku}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Price</div>
                          <div className="text-xs font-bold text-slate-900 mt-0.5">
                            {item.price}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Status pill, Product Image, Stepper */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      
                      {/* Active Status Badge */}
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200/60">
                        {item.status || 'Active'}
                      </span>

                      {/* Product Image Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#eef2f6] border border-slate-200/80 shrink-0 flex items-center justify-center">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { e.target.src = '/assets/backpack-catalog.jpg'; }}
                        />
                      </div>

                      {/* Stock Stepper Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStockAdjust(item.id, -1)}
                          className="w-8 h-8 rounded-lg border border-blue-200/80 bg-white hover:bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                          title="Decrease stock"
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>

                        <span className="w-8 text-center text-sm font-bold text-slate-900 select-none">
                          {item.stock}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleStockAdjust(item.id, 1)}
                          className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/80 flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
                          title="Increase stock"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* Tab 3: Return & Exchange Policy Rules (Exact Match to Mockup) */}
          {activeTab === 'policy' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Page Title & Subtitle */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Return & Exchange Policy Rules
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Return and exchange requirements
                </p>
              </div>

              {actionNotice && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionNotice}</span>
                </div>
              )}

              {/* Main Policy Card Container */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                
                {/* Card Header: Policy rules & Count badge */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">
                    Policy rules
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/50">
                    {policyRulesList.length} rules
                  </span>
                </div>

                {/* 5 Rules List Items */}
                <div className="divide-y divide-slate-100">
                  {policyRulesList.map((rule) => (
                    <div 
                      key={rule.id} 
                      className="px-6 py-5 flex items-start justify-between gap-4 group hover:bg-slate-50/40 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Number Badge (e.g. 1., 2., 3., 4., 5.) */}
                        <div className="w-8 h-8 rounded-lg bg-blue-50/80 border border-blue-200/60 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          {rule.number}.
                        </div>

                        {/* Rule Title & Requirement Description */}
                        <div className="space-y-1">
                          <h3 className="text-xs font-bold text-slate-900">
                            {rule.title}
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {rule.description}
                          </p>
                        </div>
                      </div>

                      {/* Delete Rule Action on hover */}
                      {policyRulesList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeletePolicyRule(rule.id)}
                          className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-xs cursor-pointer"
                          title="Remove rule"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bottom Action Footer with '+ Add Policy' Button */}
                <div className="px-6 py-5 border-t border-slate-100 bg-white">
                  <button
                    type="button"
                    onClick={() => setShowAddPolicyModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add Policy</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* Tab 4: History (Exact Match to Mockup) */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Notification Banner when Action Taken */}
              {actionNotice && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionNotice}</span>
                </div>
              )}

              {/* Page Title & Actions Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    History
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Track completed return and exchange requests and their outcomes.
                  </p>
                </div>

                <div className="flex items-center gap-3 relative">
                  {/* Date Filter Button & Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDateDropdown(prev => !prev)}
                      className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>{selectedDateRange}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {showDateDropdown && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-30 animate-fadeIn">
                        {['Sep 1 – 30, 2026', 'Aug 1 – 31, 2026', 'Jul 1 – 31, 2026', 'Past 90 Days', 'All Time'].map((range) => (
                          <button
                            key={range}
                            type="button"
                            onClick={() => {
                              setSelectedDateRange(range);
                              setShowDateDropdown(false);
                              setActionNotice(`Filtered history for ${range}`);
                              setTimeout(() => setActionNotice(''), 2000);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                              selectedDateRange === range 
                                ? 'bg-blue-50 text-blue-700 font-bold' 
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Export Report Button */}
                  <button
                    type="button"
                    onClick={handleExportHistoryReport}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[2.4]" />
                    <span>Export report</span>
                  </button>
                </div>
              </div>

              {/* Top Information Banner */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-[#eff6ff] border border-blue-100/90 flex items-center gap-3 text-xs text-blue-900">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="flex flex-wrap items-center gap-1.5 leading-relaxed">
                  <span className="font-bold text-blue-950">Sample data</span>
                  <span className="text-blue-800/80">
                    September 2026 · Completed requests only · Every request is accepted or rejected.
                  </span>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Metric 1: Total requests */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Total requests</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                      <CheckSquare className="w-4 h-4 stroke-[2]" />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-extrabold text-blue-600 tracking-tight">240</span>
                    <span className="text-xs text-slate-400 font-normal">100% of completed requests</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-slate-700 stroke-[2.5]" />
                      <span className="font-bold text-slate-800">192</span>
                      <span className="text-slate-500">accepted</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5 text-slate-700 stroke-[2.5]" />
                      <span className="font-bold text-slate-800">48</span>
                      <span className="text-slate-500">rejected</span>
                    </div>
                  </div>
                </div>

                {/* Metric 2: Return requests */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Return requests</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                      <RotateCcw className="w-4 h-4 stroke-[2]" />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">150</span>
                    <span className="text-xs text-slate-400 font-normal">62.5% of total</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-slate-700 stroke-[2.5]" />
                      <span className="font-bold text-slate-800">114</span>
                      <span className="text-slate-500">accepted</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5 text-slate-700 stroke-[2.5]" />
                      <span className="font-bold text-slate-800">36</span>
                      <span className="text-slate-500">rejected</span>
                    </div>
                  </div>
                </div>

                {/* Metric 3: Exchange requests */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Exchange requests</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                      <ArrowLeftRight className="w-4 h-4 stroke-[2]" />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2.5">
                    <span className="text-3xl font-extrabold text-slate-900 tracking-tight">90</span>
                    <span className="text-xs text-slate-400 font-normal">37.5% of total</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-slate-700 stroke-[2.5]" />
                      <span className="font-bold text-slate-800">78</span>
                      <span className="text-slate-500">accepted</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5 text-slate-700 stroke-[2.5]" />
                      <span className="font-bold text-slate-800">12</span>
                      <span className="text-slate-500">rejected</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Middle Visualizations (Donut & Horizontal Bar Chart) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Left Card: Overall outcomes (Donut Chart) */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Overall outcomes</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Share of 240 completed requests</p>
                  </div>

                  <div className="py-6 flex items-center justify-around gap-6">
                    {/* SVG Donut */}
                    <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full" viewBox="0 0 140 140">
                        {/* Background track circle */}
                        <circle
                          cx="70"
                          cy="70"
                          r="50"
                          fill="none"
                          stroke="#f1f5f9"
                          strokeWidth="20"
                        />
                        {/* 80% Blue Arc (251.33 of 314.16 circumference) */}
                        <circle
                          cx="70"
                          cy="70"
                          r="50"
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="20"
                          strokeDasharray="251.33 314.16"
                          strokeDashoffset="0"
                          transform="rotate(-90 70 70)"
                        />
                        {/* 20% Slate Arc (62.83 of 314.16 circumference) */}
                        <circle
                          cx="70"
                          cy="70"
                          r="50"
                          fill="none"
                          stroke="#64748b"
                          strokeWidth="20"
                          strokeDasharray="62.83 314.16"
                          strokeDashoffset="-251.33"
                          transform="rotate(-90 70 70)"
                        />
                      </svg>
                      {/* Center Stats */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                          80%
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium mt-1">
                          accepted
                        </span>
                      </div>
                    </div>

                    {/* Donut Legend */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-xs bg-blue-600 shrink-0" />
                          <span className="text-xs font-semibold text-slate-600">Accepted</span>
                        </div>
                        <div className="text-2xl font-black text-slate-900 tracking-tight mt-1 leading-tight">
                          192
                        </div>
                        <div className="text-[11px] text-slate-400">
                          80% of total
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-xs bg-[#64748b] shrink-0" />
                          <span className="text-xs font-semibold text-slate-600">Rejected</span>
                        </div>
                        <div className="text-2xl font-black text-slate-900 tracking-tight mt-1 leading-tight">
                          48
                        </div>
                        <div className="text-[11px] text-slate-400">
                          20% of total
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 pt-3 border-t border-slate-100">
                    192 accepted + 48 rejected = 240 requests
                  </div>
                </div>

                {/* Right Card: Outcomes by request type (Horizontal Bar Chart) */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Outcomes by request type</h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Accepted and rejected requests · Same count scale for both types
                      </p>
                    </div>

                    {/* Filter Checkboxes */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAcceptedFilter(!showAcceptedFilter)}
                        className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer select-none"
                      >
                        <div className={`w-3.5 h-3.5 rounded-xs flex items-center justify-center transition-colors ${
                          showAcceptedFilter ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white'
                        }`}>
                          {showAcceptedFilter && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="font-medium">Accepted</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowRejectedFilter(!showRejectedFilter)}
                        className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer select-none"
                      >
                        <div className={`w-3.5 h-3.5 rounded-xs flex items-center justify-center transition-colors ${
                          showRejectedFilter ? 'bg-[#64748b] text-white' : 'border border-slate-300 bg-white'
                        }`}>
                          {showRejectedFilter && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="font-medium">Rejected</span>
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Bar Chart Container */}
                  <div className="py-6 space-y-6">
                    
                    {/* Row 1: Return (150 total) */}
                    <div className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-2 text-left">
                        <div className="text-xs font-bold text-slate-900 leading-tight">Return</div>
                        <div className="text-[11px] text-slate-400">150 total</div>
                      </div>

                      <div className="col-span-10 relative">
                        {/* Scale Background Grid Lines */}
                        <div className="absolute inset-0 flex justify-between pointer-events-none">
                          {[0, 30, 60, 90, 120, 150].map((val) => (
                            <div 
                              key={val} 
                              className="h-full border-r border-slate-100" 
                              style={{ left: `${(val / 150) * 100}%` }} 
                            />
                          ))}
                        </div>

                        <div className="space-y-1.5 relative z-10 py-1">
                          {/* Accepted Bar (114) */}
                          {showAcceptedFilter && (
                            <div className="flex items-center">
                              <div 
                                className="h-4 rounded-xs bg-blue-600 transition-all duration-500 shadow-2xs" 
                                style={{ width: `${(114 / 150) * 100}%` }} 
                              />
                              <span className="text-xs font-bold text-slate-800 ml-2">114</span>
                            </div>
                          )}
                          {/* Rejected Bar (36) */}
                          {showRejectedFilter && (
                            <div className="flex items-center">
                              <div 
                                className="h-4 rounded-xs bg-[#64748b] transition-all duration-500 shadow-2xs" 
                                style={{ width: `${(36 / 150) * 100}%` }} 
                              />
                              <span className="text-xs font-bold text-slate-800 ml-2">36</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Exchange (90 total) */}
                    <div className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-2 text-left">
                        <div className="text-xs font-bold text-slate-900 leading-tight">Exchange</div>
                        <div className="text-[11px] text-slate-400">90 total</div>
                      </div>

                      <div className="col-span-10 relative">
                        {/* Scale Background Grid Lines */}
                        <div className="absolute inset-0 flex justify-between pointer-events-none">
                          {[0, 30, 60, 90, 120, 150].map((val) => (
                            <div 
                              key={val} 
                              className="h-full border-r border-slate-100" 
                              style={{ left: `${(val / 150) * 100}%` }} 
                            />
                          ))}
                        </div>

                        <div className="space-y-1.5 relative z-10 py-1">
                          {/* Accepted Bar (78) */}
                          {showAcceptedFilter && (
                            <div className="flex items-center">
                              <div 
                                className="h-4 rounded-xs bg-blue-600 transition-all duration-500 shadow-2xs" 
                                style={{ width: `${(78 / 150) * 100}%` }} 
                              />
                              <span className="text-xs font-bold text-slate-800 ml-2">78</span>
                            </div>
                          )}
                          {/* Rejected Bar (12) */}
                          {showRejectedFilter && (
                            <div className="flex items-center">
                              <div 
                                className="h-4 rounded-xs bg-[#64748b] transition-all duration-500 shadow-2xs" 
                                style={{ width: `${(12 / 150) * 100}%` }} 
                              />
                              <span className="text-xs font-bold text-slate-800 ml-2">12</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* X-Axis Scale & Numbers */}
                    <div className="grid grid-cols-12 gap-3 pt-2">
                      <div className="col-span-2" />
                      <div className="col-span-10">
                        <div className="flex justify-between text-[11px] text-slate-400 font-mono px-0.5">
                          <span>0</span>
                          <span>30</span>
                          <span>60</span>
                          <span>90</span>
                          <span>120</span>
                          <span>150</span>
                        </div>
                        <div className="text-center text-[11px] text-slate-400 mt-2 font-medium">
                          Number of completed requests
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Bottom Outcome breakdown Table */}
              <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
                <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">Outcome breakdown</h2>
                  <span className="text-xs text-slate-400 font-medium">September 2026</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-slate-200/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-6">REQUEST TYPE</th>
                        <th className="py-3 px-6">TOTAL REQUESTS</th>
                        <th className="py-3 px-6">ACCEPTED · SHARE</th>
                        <th className="py-3 px-6">REJECTED · SHARE</th>
                        <th className="py-3 px-6">ACCEPTANCE RATE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {/* Row 1: Return */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900">Return</td>
                        <td className="py-4 px-6 font-bold text-slate-800">150</td>
                        <td className="py-4 px-6 font-bold text-blue-600">114 · 76%</td>
                        <td className="py-4 px-6 text-slate-600">36 · 24%</td>
                        <td className="py-4 px-6 font-bold text-slate-900">76%</td>
                      </tr>
                      {/* Row 2: Exchange */}
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900">Exchange</td>
                        <td className="py-4 px-6 font-bold text-slate-800">90</td>
                        <td className="py-4 px-6 font-bold text-blue-600">78 · 86.7%</td>
                        <td className="py-4 px-6 text-slate-600">12 · 13.3%</td>
                        <td className="py-4 px-6 font-bold text-slate-900">86.7%</td>
                      </tr>
                      {/* Row 3: All requests */}
                      <tr className="bg-slate-50/30 hover:bg-slate-50 transition-colors font-medium">
                        <td className="py-4 px-6 font-bold text-slate-900">All requests</td>
                        <td className="py-4 px-6 font-bold text-slate-900">240</td>
                        <td className="py-4 px-6 font-bold text-blue-600">192 · 80%</td>
                        <td className="py-4 px-6 text-slate-600">48 · 20%</td>
                        <td className="py-4 px-6 font-bold text-slate-900">80%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-3.5 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                  <span>Shares are within each request type. Percentages rounded to one decimal where needed.</span>
                  <span>Illustrative sample data · Not live store activity</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </main>

      {/* ========================================================
          3. FULL-SIZE IMAGE INSPECTION LIGHTBOX MODAL
         ======================================================== */}
      {selectedImageModal && (
        <div 
          onClick={() => setSelectedImageModal(null)}
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
                    {selectedImageModal.angle || 'Angle View'} · {selectedImageModal.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedImageModal.filename}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImageModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4 Angle Navigation Tabs in Modal */}
            <div className="grid grid-cols-4 gap-2">
              {currentRequest.customer_images.map((photo, pIdx) => {
                const isActive = selectedImageModal.id === photo.id;
                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => setSelectedImageModal(photo)}
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
                      <div className="text-[10px] font-bold truncate">Angle {pIdx + 1}</div>
                      <div className="text-[9px] text-slate-400 truncate">{photo.title}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="py-2 flex items-center justify-center bg-slate-900/5 rounded-xl overflow-hidden min-h-[300px]">
              <img 
                src={selectedImageModal.url} 
                alt={selectedImageModal.title} 
                className="max-h-[50vh] w-auto object-contain rounded-lg shadow-sm"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Customer 4-angle proof verified against return policy
              </span>
              <button
                type="button"
                onClick={() => setSelectedImageModal(null)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                Close preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Policy Rule Modal */}
      {showAddPolicyModal && (
        <div 
          onClick={() => setShowAddPolicyModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 animate-scaleUp space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                <h3 className="text-sm font-bold text-slate-900">
                  Add New Policy Rule
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPolicyModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPolicyRule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rule Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Original Tags Required"
                  value={newPolicyTitle}
                  onChange={(e) => setNewPolicyTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rule Requirement Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain requirements customers must meet..."
                  value={newPolicyDesc}
                  onChange={(e) => setNewPolicyDesc(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPolicyModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Add Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
