/* COPYRIGHT ALEN PEPA */
import React, { useState, useEffect } from 'react';
import { 
  Shield, Target, Zap, AlertTriangle, Terminal, 
  Play, Pause, RotateCcw, ChevronRight, CheckCircle2,
  Lock, Globe, Cpu, Activity, Bug
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';

interface SimulationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  logs: string[];
}

export default function CyberRange() {
  const [scenario, setScenario] = useState<string>('Advanced Persistent Threat (APT) Simulation');
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<SimulationStep[]>([
    { id: 'recon', title: 'Reconnaissance', description: 'Passive and active scanning of target infrastructure.', status: 'pending', logs: [] },
    { id: 'exploit', title: 'Initial Access', description: 'Exploiting identified vulnerabilities to gain a foothold.', status: 'pending', logs: [] },
    { id: 'persist', title: 'Persistence', description: 'Establishing long-term access to the compromised system.', status: 'pending', logs: [] },
    { id: 'exfil', title: 'Data Exfiltration', description: 'Identifying and extracting sensitive information.', status: 'pending', logs: [] },
  ]);

  const runSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStepIndex(i);
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' } : s));
      
      // Simulate AI-generated logs for each step
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey || apiKey === 'undefined' || apiKey === '') {
          // Fallback logs for offline mode
          const fallbackLogs: Record<string, string[]> = {
            'recon': [
              '[INFO] Initializing passive reconnaissance module...',
              '[SUCCESS] WHOIS data retrieved for target infrastructure.',
              '[INFO] Scanning for open subdomains via DNS enumeration...',
              '[SUCCESS] Identified 4 active subdomains: api.target.com, dev.target.com, mail.target.com, vpn.target.com',
              '[WARN] ICMP Echo requests are being filtered by edge firewall.'
            ],
            'exploit': [
              '[INFO] Analyzing dev.target.com for known vulnerabilities...',
              '[SUCCESS] Identified CVE-2024-21626 (runc container escape) on staging server.',
              '[INFO] Crafting specialized exploit payload...',
              '[SUCCESS] Initial foothold established via container escape.',
              '[INFO] Escalating privileges to root user...'
            ],
            'persist': [
              '[INFO] Deploying stealth persistence mechanism...',
              '[SUCCESS] Systemd service "sys-update.service" created and masked.',
              '[INFO] Establishing encrypted C2 channel via HTTPS/443...',
              '[SUCCESS] Heartbeat signal received from C2 server.',
              '[INFO] Cleaning up initial access artifacts...'
            ],
            'exfil': [
              '[INFO] Scanning filesystem for sensitive data patterns...',
              '[SUCCESS] Identified 1.2GB of encrypted database backups.',
              '[INFO] Compressing and encrypting exfiltration package...',
              '[SUCCESS] Data exfiltration complete via fragmented DNS tunneling.',
              '[SUCCESS] Simulation objective achieved: Full system compromise.'
            ]
          };
          
          const newLogs = fallbackLogs[steps[i].id] || ['[INFO] Processing simulation step...'];
          setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'completed', logs: newLogs } : s));
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Generate 5 technical log entries for a cybersecurity simulation step: ${steps[i].title}. 
          The scenario is: ${scenario}. Return as a JSON array of strings.`,
          config: { responseMimeType: "application/json" }
        });
        
        const newLogs = JSON.parse(response.text || '[]');
        setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'completed', logs: newLogs } : s));
        await new Promise(r => setTimeout(r, 2000));
      } catch (error) {
        setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'failed', logs: ['[ERROR] AI Core connection lost.'] } : s));
        break;
      }
    }
    
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setCurrentStepIndex(0);
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending', logs: [] })));
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-[#222] bg-[#111] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Target className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-sm font-mono uppercase tracking-widest text-white">Cyber Range Simulation</h2>
            <p className="text-[10px] font-mono text-[#555] uppercase tracking-tighter">{scenario}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={resetSimulation}
            className="p-2 hover:bg-[#222] rounded-lg text-[#555] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            onClick={runSimulation}
            disabled={isSimulating}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-[10px] uppercase tracking-widest transition-all ${
              isSimulating 
                ? 'bg-red-500/10 text-red-500 border border-red-500/20 cursor-not-allowed' 
                : 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
            }`}
          >
            {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isSimulating ? 'SIMULATING...' : 'START SIMULATION'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Steps Sidebar */}
        <div className="w-64 border-r border-[#222] p-4 space-y-3 bg-[#0d0d0d]">
          {steps.map((step, i) => (
            <div 
              key={step.id}
              className={`p-3 rounded-lg border transition-all ${
                i === currentStepIndex && isSimulating 
                  ? 'bg-red-500/5 border-red-500/30' 
                  : step.status === 'completed'
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : 'bg-[#151515] border-[#222]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-[#555]">STEP 0{i + 1}</span>
                {step.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                {step.status === 'running' && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
              </div>
              <h3 className={`text-xs font-bold ${i === currentStepIndex ? 'text-white' : 'text-[#888]'}`}>
                {step.title}
              </h3>
              <p className="text-[9px] text-[#555] mt-1 leading-tight">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Log Viewer */}
        <div className="flex-1 flex flex-col bg-black p-6 font-mono overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-[#555]">
            <Terminal className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest">Simulation Log Output</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
            {steps.flatMap(s => s.logs).length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-[#222]">
                <Bug className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-[10px] uppercase tracking-[0.3em]">Awaiting simulation initialization...</p>
              </div>
            )}
            
            {steps.map((step, i) => (
              <div key={i} className="space-y-1">
                {step.logs.map((log, j) => (
                  <motion.div 
                    key={j}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 text-[11px]"
                  >
                    <span className="text-[#333] shrink-0">[{new Date().toLocaleTimeString()}]</span>
                    <span className={
                      log.includes('SUCCESS') ? 'text-emerald-500' :
                      log.includes('ERROR') ? 'text-red-500' :
                      log.includes('WARN') ? 'text-amber-500' : 'text-blue-400'
                    }>
                      {log}
                    </span>
                  </motion.div>
                ))}
              </div>
            ))}
            
            {isSimulating && (
              <div className="flex gap-2 text-[11px] text-red-500 animate-pulse">
                <span>_</span>
                <span className="uppercase tracking-widest">Processing attack vector...</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-[#222] grid grid-cols-3 gap-4">
            <div className="p-3 bg-[#111] rounded-lg border border-[#222]">
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-3 h-3 text-blue-500" />
                <span className="text-[9px] text-[#555] uppercase">AI Confidence</span>
              </div>
              <div className="text-sm font-bold text-white">94.2%</div>
            </div>
            <div className="p-3 bg-[#111] rounded-lg border border-[#222]">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] text-[#555] uppercase">Success Rate</span>
              </div>
              <div className="text-sm font-bold text-white">88.0%</div>
            </div>
            <div className="p-3 bg-[#111] rounded-lg border border-[#222]">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-3 h-3 text-amber-500" />
                <span className="text-[9px] text-[#555] uppercase">Stealth Level</span>
              </div>
              <div className="text-sm font-bold text-white">CRITICAL</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
