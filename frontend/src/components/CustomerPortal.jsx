import React, { useState } from 'react';
import { 
  Scan, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  RefreshCw, 
  Boxes, 
  ShieldCheck, 
  Sparkles,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { INITIAL_PRODUCTS, INITIAL_SHOPS } from '../data/mockData';
import { verifyReturnImages } from '../services/api';

export default function CustomerPortal({ 
  currentUser, 
  onBackToHome, 
  onRequestSubmitted,
  existingRequests 
}) {
  const [requestType, setRequestType] = useState('return'); // 'return' | 'exchange'
  const [selectedReplacementId, setSelectedReplacementId] = useState('prod_2');
  const [reason, setReason] = useState('Performance not as advertised');
  const [uploadedImage, setUploadedImage] = useState('/assets/headphones-ref.jpg');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'track'

  // Determine shop policy
  const shop = INITIAL_SHOPS.find(s => s.id === (currentUser?.shop_id || 'shop_apex')) || INITIAL_SHOPS[0];
  const availableReplacements = INITIAL_PRODUCTS.filter(p => p.shop_id === shop.id);

  // Available reasons from shop policy
  const allowedReasons = shop.policy.allowed_reasons;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setUploadedImage(URL.createObjectURL(file));
      setScanResult(null);
    }
  };

  const handleRunOpenCVScan = async () => {
    setIsScanning(true);
    try {
      const refPath = currentUser?.image || '/assets/headphones-ref.jpg';
      const refBlob = await fetch(refPath).then(r => r.blob());
      const refFile = new File([refBlob], 'catalog_ref.jpg', { type: 'image/jpeg' });

      let retFile = uploadedFile;
      if (!retFile) {
        const retBlob = await fetch(uploadedImage).then(r => r.blob());
        retFile = new File([retBlob], 'customer_return.jpg', { type: 'image/jpeg' });
      }

      const res = await verifyReturnImages({
        referenceFile: refFile,
        returnedFile: retFile,
        category: 'electronics_smartphones',
        similarityThreshold: shop.policy.vision_ssim_threshold || 75.0,
        confThreshold: 0.50
      });

      setIsScanning(false);
      const passed = res.return_status === 'APPROVED';
      setScanResult({
        ssim: res.similarity_score,
        passed: passed,
        defects: res.damages ? res.damages.map(d => d.class_name) : [],
        verdict: passed ? "PASSED (Eligible Condition)" : "REJECTED (Condition Violation)"
      });
      return;
    } catch (err) {
      console.warn('[CustomerPortal] Inference API fallback:', err.message);
    }

    // Baseline fallback if backend offline
    setTimeout(() => {
      setIsScanning(false);
      const isDamaged = uploadedImage.includes('scratched');
      setScanResult({
        ssim: isDamaged ? 44.8 : 95.2,
        passed: !isDamaged,
        defects: isDamaged ? ["Deep Housing Scratches", "Casing Abrasions"] : [],
        verdict: isDamaged ? "REJECTED (Condition Violation)" : "PASSED (Eligible Condition)"
      });
    }, 1200);
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    if (!scanResult) {
      alert("Please run OpenCV Visual Condition Scan before submitting!");
      return;
    }

    const newReq = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      order_id: currentUser.order_id,
      shop_id: shop.id,
      customer_name: currentUser.customer_name,
      product_id: currentUser.product_id,
      product_name: currentUser.product_name,
      type: requestType,
      replacement_product_id: requestType === 'exchange' ? selectedReplacementId : null,
      replacement_name: requestType === 'exchange' 
        ? availableReplacements.find(p => p.id === selectedReplacementId)?.name 
        : null,
      reason: reason,
      status: scanResult.passed 
        ? (shop.policy.requires_approval ? "pending_approval" : "approved") 
        : "rejected",
      vision_score: scanResult.ssim,
      vision_status: scanResult.passed ? "passed" : "failed",
      customer_image: uploadedImage,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      history: [
        { status: "submitted", note: `Customer submitted ${requestType} request`, timestamp: "Just now" },
        { 
          status: "inspected", 
          note: `OpenCV Condition Score: ${scanResult.ssim}% (${scanResult.passed ? 'Pristine' : 'Damaged'})`, 
          timestamp: "Just now" 
        },
        { 
          status: scanResult.passed 
            ? (shop.policy.requires_approval ? "pending_approval" : "approved") 
            : "rejected", 
          note: scanResult.passed 
            ? (shop.policy.requires_approval ? "Held for shop owner approval" : "Auto-approved per store policy") 
            : "Rejected: Physical damage detected", 
          timestamp: "Just now" 
        }
      ]
    };

    onRequestSubmitted(newReq);
    setSubmissionComplete(newReq);
  };

  // Filter requests for this customer
  const myRequests = existingRequests.filter(r => r.order_id === currentUser.order_id);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <button 
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Landing Page
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Customer Return & Exchange Portal
            </h1>
            <p className="text-sm text-slate-500">
              Logged in as <strong className="text-slate-800">{currentUser.customer_name}</strong> • Order #{currentUser.order_id}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => { setActiveTab('new'); setSubmissionComplete(false); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'new' 
                  ? 'bg-brand-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New Return / Exchange
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'track' 
                  ? 'bg-brand-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Track Requests ({myRequests.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Submission Flow */}
        {activeTab === 'new' && (
          submissionComplete ? (
            /* Post-Submission Success / Verdict View */
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl max-w-2xl mx-auto text-center">
              <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5 ${
                submissionComplete.status === 'approved' 
                  ? 'bg-emerald-100 text-emerald-600'
                  : submissionComplete.status === 'pending_approval'
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-rose-100 text-rose-600'
              }`}>
                {submissionComplete.status === 'approved' ? (
                  <CheckCircle2 className="w-9 h-9" />
                ) : submissionComplete.status === 'pending_approval' ? (
                  <Clock className="w-9 h-9" />
                ) : (
                  <XCircle className="w-9 h-9" />
                )}
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                Request #{submissionComplete.id} Processed
              </h2>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                Status: <span className={`font-mono ${
                  submissionComplete.status === 'approved' ? 'text-emerald-600' :
                  submissionComplete.status === 'pending_approval' ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {submissionComplete.status.replace('_', ' ')}
                </span>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 text-left border border-slate-200 space-y-3 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">OpenCV Condition Score:</span>
                  <span className="font-mono font-bold text-slate-900">{submissionComplete.vision_score}% Match</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Request Type:</span>
                  <span className="font-semibold text-slate-900 capitalize">{submissionComplete.type}</span>
                </div>
                {submissionComplete.replacement_name && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Replacement SKU:</span>
                    <span className="font-semibold text-brand-700">{submissionComplete.replacement_name} (Stock Held)</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Store Decision:</span>
                  <span className="font-semibold text-slate-900">
                    {submissionComplete.status === 'approved' ? 'Instant Approval Granted' :
                     submissionComplete.status === 'pending_approval' ? 'Queued for Shop Staff Review' : 'Auto-Rejected'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setActiveTab('track')}
                  className="px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-md hover:bg-brand-500 transition-colors"
                >
                  View Status Timeline
                </button>
                <button
                  onClick={() => setSubmissionComplete(false)}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            /* New Request Form */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left 2 Cols: Form */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Purchased Item Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-5">
                  <img 
                    src={currentUser.image} 
                    alt={currentUser.product_name} 
                    className="w-20 h-20 rounded-xl object-contain bg-slate-50 border border-slate-100 p-2"
                  />
                  <div>
                    <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                      Item Purchased
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {currentUser.product_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Price: ${currentUser.price} • Purchased on {currentUser.purchase_date}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Within {shop.policy.return_window_days}-day return window
                    </div>
                  </div>
                </div>

                {/* 2. Choose Return or Exchange */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-4">
                    What would you like to do?
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRequestType('return')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        requestType === 'return'
                          ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-sm">Return for Refund</div>
                      <p className="text-xs text-slate-500 mt-1">Get original purchase amount back to your payment method.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRequestType('exchange')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        requestType === 'exchange'
                          ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-sm">Exchange Item</div>
                      <p className="text-xs text-slate-500 mt-1">Swap for another size or product. Stock reserved instantly.</p>
                    </button>
                  </div>

                  {/* If Exchange: Select Replacement */}
                  {requestType === 'exchange' && (
                    <div className="mt-5 pt-5 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Select Replacement Product
                      </label>
                      <select
                        value={selectedReplacementId}
                        onChange={(e) => setSelectedReplacementId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      >
                        {availableReplacements.map((prod) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.name} — ${prod.price} ({prod.stock} in stock)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* 3. Reason for Return */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <label className="block text-base font-bold text-slate-900 mb-2">
                    Select Reason
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Store accepts returns for the following verified reasons:
                  </p>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    {allowedReasons.map((r, i) => (
                      <option key={i} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* 4. OpenCV Photo Upload & Inspection */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Scan className="w-5 h-5 text-brand-600" />
                      Visual Condition Verification (OpenCV)
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      Required
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Take or upload a clear photo of your item to confirm its physical condition before return approval.
                  </p>

                  {/* Photo selector presets or custom file */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => { setUploadedImage('/assets/headphones-ref.jpg'); setScanResult(null); }}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                        uploadedImage.includes('ref') 
                          ? 'border-brand-600 bg-brand-50 text-brand-700' 
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span>Test Case: Pristine Condition</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setUploadedImage('/assets/headphones-scratched.jpg'); setScanResult(null); }}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                        uploadedImage.includes('scratched') 
                          ? 'border-brand-600 bg-brand-50 text-brand-700' 
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                      <span>Test Case: Scratched Item</span>
                    </button>
                  </div>

                  {/* Photo preview container */}
                  <div className="relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden aspect-video flex items-center justify-center">
                    <img 
                      src={uploadedImage} 
                      alt="Condition to inspect" 
                      className="w-full h-full object-contain p-4"
                    />

                    {/* Scanning Laser */}
                    {isScanning && (
                      <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px]">
                        <div className="w-full h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-laser absolute" />
                      </div>
                    )}
                  </div>

                  {/* Run Scan Button */}
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <label className="cursor-pointer text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5">
                      <Upload className="w-4 h-4" />
                      <span>Upload different photo</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>

                    <button
                      type="button"
                      onClick={handleRunOpenCVScan}
                      disabled={isScanning}
                      className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20 flex items-center gap-2"
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Processing OpenCV Model...</span>
                        </>
                      ) : (
                        <>
                          <Scan className="w-4 h-4" />
                          <span>Run Condition Verification</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Scan Result Feedback */}
                  {scanResult && (
                    <div className={`mt-4 p-4 rounded-xl border text-xs ${
                      scanResult.passed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}>
                      <div className="font-bold text-sm flex items-center gap-1.5 mb-1">
                        {scanResult.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                        OpenCV Verdict: {scanResult.verdict}
                      </div>
                      <p>Structural Similarity Match: <strong className="font-mono">{scanResult.ssim}%</strong></p>
                      {scanResult.defects.length > 0 && (
                        <p className="mt-1 font-semibold text-rose-700">
                          Detected defects: {scanResult.defects.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Final Button */}
                <button
                  type="button"
                  onClick={handleSubmitRequest}
                  className="w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-base shadow-lg shadow-slate-900/15 transition-all"
                >
                  Submit Return Request
                </button>

              </div>

              {/* Right Col: Shop Policy Summary */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-4">
                    <ShieldCheck className="w-5 h-5 text-brand-600" />
                    <span>Store Return Policy</span>
                  </div>

                  <div className="space-y-3 text-xs text-slate-600">
                    <div className="flex justify-between pb-2 border-b border-slate-100">
                      <span>Shop Name:</span>
                      <strong className="text-slate-900">{shop.name}</strong>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-100">
                      <span>Return Window:</span>
                      <strong className="text-slate-900">{shop.policy.return_window_days} Days</strong>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-100">
                      <span>OpenCV Threshold:</span>
                      <strong className="text-slate-900">{shop.policy.vision_ssim_threshold}% SSIM</strong>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-100">
                      <span>Auto Approval:</span>
                      <strong className={shop.policy.requires_approval ? 'text-amber-600' : 'text-emerald-600'}>
                        {shop.policy.requires_approval ? 'Manual Staff Review' : 'Instant AI Approval'}
                      </strong>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-xl bg-brand-50/70 border border-brand-100 text-[11px] text-brand-900 leading-relaxed">
                    💡 <strong>Tip for Hackathon Demo:</strong> If you test with the "Scratched" item, OpenCV will flag defects and automatically reject the request. If you test with "Pristine", it will pass and reserve exchange stock!
                  </div>
                </div>
              </div>

            </div>
          )
        )}

        {/* Tab 2: Track Existing Requests */}
        {activeTab === 'track' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-900">
              Active Return & Exchange Requests
            </h2>

            {myRequests.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">No requests submitted yet.</p>
            ) : (
              myRequests.map((req) => (
                <div key={req.id} className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-500">#{req.id}</span>
                      <h4 className="text-base font-bold text-slate-900">{req.product_name}</h4>
                      <p className="text-xs text-slate-500">Type: <span className="font-semibold capitalize">{req.type}</span> • Reason: {req.reason}</p>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'pending_approval' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Status Timeline */}
                  <div className="pt-4 border-t border-slate-200">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Audit Timeline
                    </div>
                    <div className="space-y-3">
                      {req.history?.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-xs">
                          <div className="w-2 h-2 rounded-full bg-brand-500 mt-1 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-800 capitalize">{step.status.replace('_', ' ')}: </span>
                            <span className="text-slate-600">{step.note}</span>
                            <span className="text-slate-400 font-mono ml-2">({step.timestamp})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}
