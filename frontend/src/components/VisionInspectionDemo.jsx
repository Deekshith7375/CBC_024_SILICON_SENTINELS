import React, { useState, useEffect } from 'react';
import { 
  DEMO_INSPECTIONS 
} from '../data/mockData';
import { 
  Scan, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Cpu, 
  Play, 
  Upload, 
  Layers, 
  Eye, 
  ShieldAlert, 
  Sparkles,
  RefreshCw,
  Boxes
} from 'lucide-react';
import { checkBackendHealth, verifyReturnImages } from '../services/api';

export default function VisionInspectionDemo() {
  const [selectedCaseId, setSelectedCaseId] = useState('case-scratched');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [activeAnalysisMode, setActiveAnalysisMode] = useState('contours'); // 'contours', 'difference', 'keypoints'
  const [customImage, setCustomImage] = useState(null);
  const [customFile, setCustomFile] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'offline' | 'checking'
  const [diagnostics, setDiagnostics] = useState(null);
  const [liveScanResult, setLiveScanResult] = useState(null);

  const currentCase = DEMO_INSPECTIONS.find(c => c.id === selectedCaseId) || DEMO_INSPECTIONS[0];

  // Check backend model health on mount
  useEffect(() => {
    checkBackendHealth()
      .then(res => {
        if (res && res.status === 'healthy') {
          setBackendStatus('connected');
          setDiagnostics(res.diagnostics);
        } else {
          setBackendStatus('offline');
        }
      })
      .catch(() => setBackendStatus('offline'));
  }, []);

  const runLiveInference = async (returnFileToUse = null) => {
    try {
      // Determine reference image file or URL
      const refUrl = currentCase.ref_image;
      const refBlob = await fetch(refUrl).then(r => r.blob());
      const refFile = new File([refBlob], 'reference.jpg', { type: 'image/jpeg' });

      let returnFile = returnFileToUse;
      if (!returnFile) {
        const retUrl = customImage || currentCase.return_image;
        const retBlob = await fetch(retUrl).then(r => r.blob());
        returnFile = new File([retBlob], 'customer.jpg', { type: 'image/jpeg' });
      }

      const category = currentCase.item_name.toLowerCase().includes('shoe') || currentCase.item_name.toLowerCase().includes('linen')
        ? 'shoes_clothes'
        : 'electronics_smartphones';

      const result = await verifyReturnImages({
        referenceFile: refFile,
        returnedFile: returnFile,
        category: category,
        similarityThreshold: 75.0,
        confThreshold: 0.50
      });

      setLiveScanResult(result);
    } catch (err) {
      console.warn('[VisionInspectionDemo] Live inference error, using baseline:', err.message);
      setLiveScanResult(null);
    }
  };

  const handleTriggerScan = (newFile = null) => {
    setIsScanning(true);
    setScanProgress(0);
    setLiveScanResult(null);
    runLiveInference(newFile);
  };

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsScanning(false);
            return 100;
          }
          return prev + 14;
        });
      }, 130);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const handleCustomUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomImage(url);
      setCustomFile(file);
      handleTriggerScan(file);
    }
  };

  // Determine active score and defects (live or preset)
  const activeScore = liveScanResult ? liveScanResult.similarity_score : currentCase.ssim_score;
  const activeDamageDetected = liveScanResult ? liveScanResult.damage_detected : currentCase.defect_detected;
  const activeDefectCount = liveScanResult ? liveScanResult.damage_count : (currentCase.defect_detected ? 1 : 0);
  const activeVerdictPassed = liveScanResult 
    ? (liveScanResult.return_status === 'APPROVED') 
    : (currentCase.vision_verdict === 'PASSED');
  const activeSummary = liveScanResult ? liveScanResult.summary_message : currentCase.explanation;
  const activeAnnotatedImage = liveScanResult?.annotated_image_b64;

  return (
    <section id="scanner-demo" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-950 border border-brand-500/40 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5 text-brand-400" />
            Interactive OpenCV Vision Engine
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            See How ReturnSphere Compares & Validates Condition
          </h2>
          <p className="mt-3 text-slate-400 text-base">
            Select a demo scenario or upload an item photo. Watch the simulated OpenCV pipeline analyze structural similarity, detect abrasions, and cross-reference shop business rules.
          </p>
        </div>

        {/* Case Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {DEMO_INSPECTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCaseId(c.id);
                setCustomImage(null);
                handleTriggerScan();
              }}
              className={`px-5 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2.5 border ${
                selectedCaseId === c.id && !customImage
                  ? 'bg-brand-600 border-brand-400 text-white shadow-lg shadow-brand-500/25'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/80'
              }`}
            >
              <Scan className="w-4 h-4" />
              <span>{c.title}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                c.vision_verdict === 'PASSED' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {c.vision_verdict}
              </span>
            </button>
          ))}

          {/* Upload Button */}
          <label className="cursor-pointer px-5 py-3 rounded-xl font-semibold text-sm transition-all flex items-center gap-2.5 bg-slate-800/80 border border-slate-700 text-slate-300 hover:bg-slate-700/80 hover:text-white">
            <Upload className="w-4 h-4 text-brand-400" />
            <span>Upload Your Own Item Photo</span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleCustomUpload} 
            />
          </label>
        </div>

        {/* The Live Interactive Inspection Console */}
        <div className="bg-slate-950/90 rounded-3xl border border-slate-800 shadow-2xl p-6 lg:p-8 backdrop-blur-xl">
          
          {/* Top Console Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <span>{customImage ? "Custom Upload Inspection" : currentCase.item_name}</span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    CV2 Pipeline Active
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Claim Reason: <span className="text-slate-200 font-medium">{currentCase.claim_reason}</span>
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Backend Status Pill */}
              <div className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border ${
                backendStatus === 'connected' 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              }`}>
                <span className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                <span>{backendStatus === 'connected' ? `AI Backend: ${diagnostics?.device?.toUpperCase() || 'CUDA'} (CLIP + YOLO)` : 'Demo Mode'}</span>
              </div>

              <button
                onClick={() => handleTriggerScan()}
                disabled={isScanning}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Image...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run AI Verification</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Visual Comparison Stage: Left (Reference) vs Right (Returned) */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* Left Box: Catalog Master / Reference Image */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-brand-400">
                  <Eye className="w-4 h-4" /> Reference Standard (Catalog SKU)
                </span>
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  100% Pristine Baseline
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-square flex items-center justify-center group shadow-inner">
                <img 
                  src={currentCase.ref_image} 
                  alt="Reference Master" 
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 border border-white/10">
                  Master SKU: REF-CATALOG-01 • Original Asset
                </div>
              </div>
            </div>

            {/* Right Box: Returned Item Photo with Model Scan Overlay */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Scan className="w-4 h-4" /> Customer Return Photo
                </span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                  activeVerdictPassed 
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}>
                  {isScanning ? 'Scanning with CLIP...' : `Similarity: ${activeScore}%`}
                </span>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-square flex items-center justify-center shadow-inner">
                <img 
                  src={activeAnnotatedImage ? `data:image/jpeg;base64,${activeAnnotatedImage}` : (customImage || currentCase.return_image)} 
                  alt="Customer Return Candidate" 
                  className="w-full h-full object-contain p-4"
                />

                {/* Scanning Laser Animation */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div 
                      className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] transition-all duration-150 absolute"
                      style={{ top: `${scanProgress}%` }}
                    />
                    <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px]" />
                  </div>
                )}

                {/* Simulated / Real Defect Notice */}
                {!isScanning && activeDamageDetected && !activeAnnotatedImage && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[38%] left-[30%] w-[38%] h-[35%] border-2 border-rose-500 bg-rose-500/15 rounded-lg flex flex-col justify-between p-1.5 animate-pulse">
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold bg-rose-600 text-white px-1.5 py-0.5 rounded w-max">
                        <span>ABRASION_DEFECT</span>
                      </div>
                      <div className="text-[10px] font-mono text-rose-300 bg-black/80 px-1 rounded">
                        Confidence: 96.2%
                      </div>
                    </div>
                  </div>
                )}

                {/* Pristine Pass Watermark if no defect */}
                {!isScanning && !activeDamageDetected && (
                  <div className="absolute top-4 right-4 bg-emerald-950/85 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-md">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Zero Defects Detected
                  </div>
                )}

                <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 border border-white/10">
                  {liveScanResult ? 'Inference: Real CLIP Embeddings + Fine-Tuned YOLO' : 'Input: 1024x1024 • Model Ready'}
                </div>
              </div>
            </div>

          </div>

          {/* Diagnostic Metrics & Final Automated Decision Engine Result */}
          <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Metric 1: Structural Similarity Index */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400 uppercase font-semibold">
                  Visual Similarity Score
                </div>
                {liveScanResult && (
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded">
                    CLIP Model Live
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-2xl font-mono font-extrabold ${
                  activeScore > 75 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {activeScore}%
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  (Min required: 75.0%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    activeScore > 75 ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, activeScore)}%` }}
                />
              </div>
            </div>

            {/* Metric 2: Defect Classification */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-semibold">
                Damage & Defect Inspection
              </div>
              <div className="mt-2 text-sm font-bold text-white flex items-center gap-2">
                {activeDamageDetected ? (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="text-rose-300">
                      {liveScanResult 
                        ? `${activeDefectCount} defect(s) detected (${liveScanResult.damages.map(d => d.class_name).join(', ') || 'Damage'})` 
                        : currentCase.defect_type}
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-emerald-300">Flawless (No Defects Detected)</span>
                  </>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-2 font-mono">
                Model: <span className="text-white">Fine-tuned YOLO & Fracture Detection</span>
              </div>
            </div>

            {/* Metric 3: Real-time Inventory & Policy Action */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 uppercase font-semibold">
                Inventory & Policy Sync
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-brand-400" />
                <span>{currentCase.inventory_impact}</span>
              </div>
              <div className="text-xs text-slate-400 mt-2 font-mono">
                Policy Rule: <span className="text-white">{currentCase.policy_status}</span>
              </div>
            </div>

          </div>

          {/* Final Verdict Banner */}
          <div className={`mt-6 p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            activeVerdictPassed
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl mt-0.5 ${
                activeVerdictPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {activeVerdictPassed ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="font-extrabold text-lg text-white">
                  Automated Decision: {liveScanResult ? (liveScanResult.return_status === 'APPROVED' ? 'APPROVED (Eligible)' : 'REJECTED (Policy Violation)') : currentCase.verdict_badge}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {activeSummary}
                </p>
              </div>
            </div>

            <div className="shrink-0 font-mono text-xs px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-slate-300">
              Audit Status: <span className="text-brand-400">{liveScanResult ? `#AI-${liveScanResult.transaction_id}` : '#CV-9021-VERIFIED'}</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
