import React, { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, Check, AlertTriangle, Stethoscope, Baby, User, 
  ChevronRight, Save, RotateCcw, Activity, ClipboardList, Home, Search, FileText, Calendar 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PHARMACY FIRST STANDALONE APPLICATION
 * This file is self-contained and includes all necessary styles (CSS-in-JS),
 * components, and logic to run exactly as it appears in the demo.
 */

// --- Global Styles for standalone use ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;600;700&display=swap');
    
    :root {
      --font-body: 'Inter', sans-serif;
      --font-display: 'Outfit', sans-serif;
      --background: #020617;
      --foreground: #f8fafc;
      --card: #020617;
      --primary: #3b82f6;
    }

    .pf-app-container {
      font-family: var(--font-body);
      background-color: var(--background);
      color: var(--foreground);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    @media (min-width: 768px) {
      .pf-app-container { flex-direction: row; }
    }

    .font-display { font-family: var(--font-display); }
    
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
  `}</style>
);

// --- Clinical Logic Data ---
const PATHWAYS = {
  uti: {
    start: {
      id: "start",
      question: "NEWS2 Score / Sepsis Risk?",
      description: "Is the patient showing signs of sepsis or have a high NEWS2 score?",
      options: [
        { label: "Yes", outcome: "Urgent Referral / 999", variant: "danger" },
        { label: "No", nextId: "pyelo" }
      ]
    },
    pyelo: {
      id: "pyelo",
      question: "Signs of Pyelonephritis?",
      description: "Kidney pain, rigors, nausea, vomiting, fever?",
      options: [
        { label: "Yes", outcome: "Urgent Referral", variant: "danger" },
        { label: "No", nextId: "exclusions" }
      ]
    },
    exclusions: {
      id: "exclusions",
      question: "Any Exclusions present?",
      description: "Vaginal discharge, Pregnancy, Catheter, Recurrent UTI?",
      options: [
        { label: "Yes", outcome: "Onward Referral (GP)", variant: "default" },
        { label: "No", nextId: "key_symptoms" }
      ]
    },
    key_symptoms: {
      id: "key_symptoms",
      question: "Key Symptoms Assessment",
      description: "Does patient have: Dysuria, Nocturia, or Cloudy urine?",
      options: [
        { label: "None", outcome: "UTI Less Likely - Self Care", variant: "safe" },
        { label: "1 Symptom", nextId: "other_symptoms" },
        { label: "2+ Symptoms", outcome: "UTI Likely - Offer Nitrofurantoin (3 days)", variant: "safe" }
      ]
    },
    other_symptoms: {
      id: "other_symptoms",
      question: "Other Symptoms?",
      description: "Urgency, Frequency, or Haematuria?",
      options: [
        { label: "Yes", outcome: "UTI Equally Likely - Shared Decision / TARGET resources", variant: "default" },
        { label: "No", outcome: "UTI Less Likely - Self Care", variant: "safe" }
      ]
    }
  },
  impetigo: {
    start: {
      id: "start",
      question: "NEWS2 Score / Sepsis Risk?",
      description: "Is the patient showing signs of sepsis or have a high NEWS2 score?",
      options: [
        { label: "Yes", outcome: "Urgent Referral / 999", variant: "danger" },
        { label: "No", nextId: "immune" }
      ]
    },
    immune: {
      id: "immune",
      question: "Complications or Risk?",
      description: "Immunosuppressed & widespread OR Severe complications?",
      options: [
        { label: "Yes", outcome: "Urgent Referral", variant: "danger" },
        { label: "No", nextId: "progression" }
      ]
    },
    progression: {
      id: "progression",
      question: "Typical Progression?",
      description: "Thin-walled vesicle, golden crust?",
      options: [
        { label: "No", outcome: "Consider Alternative Diagnosis", variant: "default" },
        { label: "Yes", nextId: "lesion_count" }
      ]
    },
    lesion_count: {
      id: "lesion_count",
      question: "Lesion Count / Distribution",
      description: "How many lesions are present?",
      options: [
        { label: "≤ 3 (Localised)", outcome: "Offer Hydrogen peroxide 1% (5 days). 2nd line: Fusidic acid.", variant: "safe" },
        { label: "≥ 4 (Widespread)", outcome: "Offer Flucloxacillin (5 days). Penicillin allergy? Clarithromycin.", variant: "safe" }
      ]
    }
  }
};

// --- Components ---
const Layout = ({ children, activePage, onNavigate }) => (
  <div className="pf-app-container">
    <GlobalStyles />
    <nav className="w-full md:w-64 bg-[#141414] border-b md:border-b-0 md:border-r border-white/10 p-4 flex flex-col shrink-0 z-50">
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg"><Activity className="w-6 h-6 text-white" /></div>
        <div>
          <h1 className="font-display font-bold text-lg leading-tight">Pharmacy<span className="text-blue-500">First</span></h1>
          <p className="text-xs text-gray-500">Clinical Pathways</p>
        </div>
      </div>
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        {[
          { id: "home", icon: Home, label: "Home" },
          { id: "assessment", icon: Activity, label: "New Assessment" },
          { id: "history", icon: ClipboardList, label: "History" }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activePage === item.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-medium translate-x-1" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
          >
            <item.icon className="w-5 h-5" /> {item.label}
          </button>
        ))}
      </div>
    </nav>
    <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 pb-24">
      <div className="max-w-5xl mx-auto">{children}</div>
    </main>
  </div>
);

export default function PharmacyFirstApp() {
  const [currentPage, setCurrentPage] = useState("home");
  const [assessments, setAssessments] = useState([]);

  // Flow State
  const [step, setStep] = useState("service");
  const [service, setService] = useState(null);
  const [ageBand, setAgeBand] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentNodeId, setCurrentNodeId] = useState("start");
  const [outcome, setOutcome] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history, currentNodeId, outcome]);

  const handleAnswer = (label, nextId, res) => {
    const node = PATHWAYS[service][currentNodeId];
    setHistory(prev => [...prev, { nodeId: currentNodeId, question: node.question, answer: label }]);
    if (res) { setOutcome(res); setCurrentNodeId("DONE"); } else if (nextId) { setCurrentNodeId(nextId); }
  };

  const saveRecord = () => {
    setAssessments([{ id: Date.now(), service, ageBand, outcome, createdAt: new Date().toISOString() }, ...assessments]);
    setCurrentPage("history");
    reset();
  };

  const reset = () => { setStep("service"); setService(null); setAgeBand(null); setHistory([]); setOutcome(null); setCurrentNodeId("start"); };

  return (
    <Layout activePage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === "home" && (
        <div className="space-y-8">
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">NHS Pharmacy First</div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight leading-tight">Clinical Assessment <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Protocol System</span></h1>
            <p className="text-xl text-gray-400 max-w-2xl">Start a new patient assessment using standardized clinical pathways.</p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <HomeCard onClick={() => setCurrentPage("assessment")} title="Start Assessment" icon={Activity} description="Begin a new consultation for UTI or Impetigo." action="Start Now" variant="primary" />
            <HomeCard onClick={() => setCurrentPage("history")} title="Patient History" icon={ClipboardList} description="Review past assessments and outcomes." action="View Log" />
            <HomeCard onClick={() => {}} title="Protocols" icon={AlertTriangle} description="View clinical guidelines and exclusions." action="Read Docs" />
          </div>
        </div>
      )}

      {currentPage === "assessment" && (
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-8 text-sm text-gray-500">
            <span className={step === "service" ? "text-blue-500 font-bold" : ""}>Service</span> <ChevronRight className="w-4 h-4" />
            <span className={step === "age" ? "text-blue-500 font-bold" : ""}>Patient Age</span> <ChevronRight className="w-4 h-4" />
            <span className={step === "flow" ? "text-blue-500 font-bold" : ""}>Clinical Assessment</span>
          </div>

          <AnimatePresence mode="wait">
            {step === "service" && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <h2 className="text-3xl font-display font-bold">Select Service</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ServiceButton title="Uncomplicated UTI" subtitle="Women 16-64 years" icon={Stethoscope} onClick={() => { setService("uti"); setStep("age"); }} />
                  <ServiceButton title="Impetigo" subtitle="Adults and Children >1 year" icon={AlertTriangle} onClick={() => { setService("impetigo"); setStep("age"); }} />
                </div>
              </motion.div>
            )}

            {step === "age" && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="flex items-center gap-4"><button onClick={() => setStep("service")} className="p-2 hover:bg-white/5 rounded-full"><ArrowLeft /></button><h2 className="text-3xl font-display font-bold">Patient Age</h2></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["<1 year", "1-15 years", "16-64 years", "65+ years"].map((age) => (
                    <button key={age} onClick={() => { setAgeBand(age); setStep("flow"); }} className="p-6 rounded-2xl bg-[#141414] border border-white/10 hover:border-blue-500 hover:bg-white/5 text-left group">
                      <div className="flex items-center gap-3"><User className="w-5 h-5 text-blue-500" /><span className="text-lg font-semibold group-hover:text-blue-500">{age}</span></div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === "flow" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative min-h-[500px]">
                <div className="flex justify-between items-start mb-6 sticky top-0 bg-[#020617]/95 backdrop-blur z-10 py-4 border-b border-white/5">
                  <h3 className="text-xl font-display font-bold flex items-center gap-2">{service.toUpperCase()} Assessment <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-normal">{ageBand}</span></h3>
                  <button onClick={reset} className="text-sm text-gray-500 hover:text-white flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Restart</button>
                </div>
                <div className="space-y-8 pb-32 relative">
                  <div className="absolute left-[19px] top-4 bottom-0 w-[2px] bg-white/10 -z-10" />
                  {history.map((item, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500 text-blue-500 flex items-center justify-center shrink-0"><Check className="w-5 h-5" /></div>
                      <div className="bg-[#141414]/50 border border-white/5 rounded-xl p-4 w-full opacity-60">
                        <p className="text-xs text-gray-500 mb-1">{item.question}</p>
                        <p className="text-lg font-semibold text-white">{item.answer}</p>
                      </div>
                    </div>
                  ))}
                  {!outcome && (
                    <div className="flex gap-6">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">?</div>
                      <div className="w-full space-y-4">
                        <div className="bg-[#141414] rounded-xl p-6 border border-blue-500/20 shadow-xl">
                          <h4 className="text-xl font-display font-bold mb-2">{PATHWAYS[service][currentNodeId].question}</h4>
                          <p className="text-gray-400 mb-6 text-sm">{PATHWAYS[service][currentNodeId].description}</p>
                          <div className="grid gap-3">
                            {PATHWAYS[service][currentNodeId].options.map((opt, idx) => (
                              <button key={idx} onClick={() => handleAnswer(opt.label, opt.nextId, opt.outcome)} className={`w-full p-4 rounded-lg text-left font-medium border transition-all ${opt.variant === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-200 hover:bg-red-500/20 hover:border-red-500' : 'bg-white/5 border-white/10 hover:border-blue-500 hover:bg-blue-500/10'}`}>{opt.label}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {outcome && (
                    <div className="flex gap-6">
                      <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0"><Check className="w-6 h-6" /></div>
                      <div className="w-full bg-green-500/10 border border-green-500/20 rounded-xl p-8 text-center space-y-4 shadow-xl">
                        <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest">Clinical Recommendation</h3>
                        <p className="text-2xl font-display font-bold text-white">{outcome}</p>
                        <button onClick={saveRecord} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:scale-105 active:scale-95"><Save className="w-5 h-5" /> Save to History</button>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {currentPage === "history" && (
        <div className="space-y-8">
          <h1 className="text-3xl font-display font-bold">Assessment History</h1>
          <div className="grid gap-4">
            {assessments.length === 0 ? (
              <div className="text-center py-20 text-gray-500"><FileText className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>No records found.</p></div>
            ) : (
              assessments.map((a) => (
                <div key={a.id} className="bg-[#141414] border border-white/10 rounded-xl p-6 group transition-all">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase inline-block ${a.service === 'uti' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>{a.service.toUpperCase()} PROTOCOL</span>
                      <h3 className="text-xl font-display font-bold text-white group-hover:text-blue-400 transition-colors">{a.outcome}</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500"><span className="flex items-center gap-1"><User className="w-3 h-3" /> {a.ageBand}</span><span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(a.createdAt).toLocaleString()}</span></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

function HomeCard({ onClick, title, description, icon: Icon, action, variant = "default" }) {
  const isPrimary = variant === "primary";
  return (
    <button onClick={onClick} className={`group relative overflow-hidden rounded-3xl p-8 h-full text-left transition-all hover:-translate-y-1 ${isPrimary ? 'bg-gradient-to-br from-blue-600 to-blue-800 shadow-xl' : 'bg-[#141414] border border-white/10 hover:border-white/20'}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${isPrimary ? 'bg-white/20 text-white' : 'bg-white/5 text-blue-500'}`}><Icon className="w-6 h-6" /></div>
      <h3 className="text-2xl font-display font-bold mb-3">{title}</h3>
      <p className={`mb-8 text-sm leading-relaxed ${isPrimary ? 'text-blue-50' : 'text-gray-400'}`}>{description}</p>
      <div className="flex items-center gap-2 font-semibold text-sm">
        <span className={isPrimary ? 'text-white' : 'text-blue-500'}>{action}</span> <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
      <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all" />
    </button>
  );
}

function ServiceButton({ title, subtitle, icon: Icon, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-8 rounded-2xl bg-[#141414] border border-white/10 hover:border-blue-500 hover:bg-blue-500/10 transition-all text-center space-y-4 group">
      <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform"><Icon className="w-8 h-8" /></div>
      <div><h3 className="text-xl font-display font-bold">{title}</h3><p className="text-sm text-gray-500 mt-1">{subtitle}</p></div>
    </button>
  );
}