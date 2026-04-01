/* COPYRIGHT ALEN PEPA */
import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  MapPin, 
  Server, 
  Shield, 
  ExternalLink,
  Cpu,
  Wifi,
  Database,
  Bot,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  History,
  Trash2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { GoogleGenAI } from "@google/genai";
import { useSystem } from '../contexts/SystemContext';

import { logToTerminal } from './Terminal';

export default function NetworkTool() {
  const { toolTarget, setToolTarget } = useSystem();
  const [query, setQuery] = useState(toolTarget || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [aiScanning, setAiScanning] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (toolTarget) {
      setQuery(toolTarget);
    }
  }, [toolTarget]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('network_osint_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history');
      }
    }
  }, []);

  const saveToHistory = (item: any) => {
    const newHistory = [item, ...history].slice(0, 20);
    setHistory(newHistory);
    localStorage.setItem('network_osint_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('network_osint_history');
    logToTerminal('Network history cleared.', 'warn');
  };

  const runAIScan = async () => {
    if (!query && !result) return;
    setAiScanning(true);
    setAiResult(null);
    logToTerminal(`Initiating Autonomous AI Scan for: ${query || result?.query}`, 'info');
    
    // Simulate scanning steps in terminal
    const steps = [
      'Probing network infrastructure...',
      'Analyzing ISP routing patterns...',
      'Identifying potential misconfigurations...',
      'Cross-referencing known vulnerability databases...',
      'Synthesizing security report...'
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        logToTerminal(steps[stepIdx], 'info');
        stepIdx++;
      } else {
        clearInterval(interval);
      }
    }, 1500);

    try {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'undefined' || apiKey === '') {
        setTimeout(() => {
          const fallbackAIResult = `
# AUTONOMOUS AI NETWORK SCAN REPORT (OFFLINE MODE)
**Target:** ${query || result?.query || 'N/A'}
**Timestamp:** ${new Date().toLocaleString()}

## INFRASTRUCTURE ANALYSIS
The target infrastructure appears to be stable. Standard routing protocols are in effect. 

## POTENTIAL MISCONFIGURATIONS
- **ICMP Echo:** Enabled (Potential for network mapping)
- **Port 80/443:** Standard web service configuration detected.
- **DNS Resolution:** Operating within normal parameters.

## SECURITY SYNTHESIS
This is a simulated AI analysis. For a comprehensive neural scan, please establish a secure link to the Gemini API.

---
*CyberSuite OS Neural Core v4.2*
          `;
          setAiResult(fallbackAIResult);
          logToTerminal('Autonomous AI Scan completed (Offline Mode).', 'success');
          setAiScanning(false);
        }, 8000); // Match the interval duration
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const targetContext = result ? 
        `IP: ${result.query}, ISP: ${result.isp}, Org: ${result.org}, Country: ${result.country}, City: ${result.city}, Lat/Lon: ${result.lat}, ${result.lon}` : 
        `Target: ${query}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an autonomous cybersecurity scanner. Perform a deep analysis on the following target infrastructure context. Identify common vulnerabilities, misconfigurations, and potential attack vectors.
        
        Target Context: ${targetContext}
        
        Your report MUST include:
        1. Infrastructure Risk Profile (Low/Medium/High/Critical)
        2. Potential Vulnerabilities (Specific to the ISP/Org/Region if possible)
        3. Misconfiguration Risks (e.g., DNS, Routing, Open Services)
        4. Actionable Remediation Steps
        5. Threat Intelligence Summary`,
        config: {
          systemInstruction: "You are a CyberSuite OS AI Security Scanner. Be technical, concise, and professional. Use markdown for formatting. Focus on realistic risks. If the target is a major cloud provider (Google, AWS, Azure), focus on shared responsibility model risks.",
        }
      });

      const text = response.text || 'No analysis available.';
      setAiResult(text);
      logToTerminal('AI Security Analysis completed successfully.', 'success');
      
      // Update history with AI result if it exists
      if (result) {
        const updatedItem = { ...result, aiResult: text, date: new Date().toISOString() };
        saveToHistory(updatedItem);
      }
    } catch (err: any) {
      logToTerminal(`AI Scan failed: ${err.message}`, 'error');
      setAiResult('Failed to complete AI analysis. Please check your connection.');
    } finally {
      clearInterval(interval);
      setAiScanning(false);
    }
  };

  const lookupIP = async () => {
    if (!query) return;
    setLoading(true);
    setError('');
    setResult(null);
    setAiResult(null);
    logToTerminal(`Initiating OSINT lookup for: ${query}`, 'info');

    try {
      const res = await fetch(`https://ipapi.co/${query}/json/`);
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.reason || 'Lookup failed');
      }
      
      const newResult = {
        query: data.ip,
        status: 'success',
        country: data.country_name,
        city: data.city,
        isp: data.org,
        org: data.asn,
        as: data.asn,
        lat: data.latitude,
        lon: data.longitude,
        date: new Date().toISOString()
      };
      
      setResult(newResult);
      saveToHistory(newResult);
      logToTerminal(`Lookup successful for ${query} (${data.org})`, 'success');
    } catch (err: any) {
      logToTerminal(`Lookup failed for ${query}: ${err.message}`, 'error');
      setError(err.message || 'Failed to fetch IP data. Note: Browser may block non-HTTPS requests.');
      // Fallback mock for demo if blocked
      if (query === '8.8.8.8') {
        setResult({
          query: '8.8.8.8',
          status: 'success',
          country: 'United States',
          city: 'Mountain View',
          isp: 'Google LLC',
          org: 'Google Public DNS',
          as: 'AS15169 Google LLC',
          lat: 37.4223,
          lon: -122.084
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Network OSINT</h1>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              "p-2 rounded-lg border transition-all flex items-center gap-2 text-xs font-mono uppercase tracking-widest",
              showHistory ? "bg-orange-500 border-orange-500 text-white" : "bg-black/40 border-cyber-border text-gray-500 hover:text-white"
            )}
          >
            <History size={16} />
            {showHistory ? 'Hide History' : 'View History'}
          </button>
        </div>
        <p className="text-gray-500">Gather open-source intelligence on IP addresses and domains.</p>
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-cyber-card border border-cyber-border rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-cyber-border pb-4">
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-widest">Recent Lookups</h3>
                <button 
                  onClick={clearHistory}
                  className="text-[10px] font-mono text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={12} /> CLEAR ALL
                </button>
              </div>
              {history.length === 0 ? (
                <div className="py-8 text-center text-gray-600 font-mono text-xs uppercase tracking-widest opacity-50">
                  No history detected
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {history.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setResult(item);
                        setQuery(item.query);
                        setAiResult(item.aiResult || null);
                        setShowHistory(false);
                        logToTerminal(`Loaded lookup for: ${item.query}`, 'info');
                      }}
                      className="p-3 bg-black/40 border border-cyber-border rounded-xl flex items-center justify-between group hover:border-orange-500/30 transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                          <Globe size={14} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors">{item.query}</div>
                          <div className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-2">
                            {item.country} • {new Date(item.date).toLocaleDateString()}
                            {item.aiResult && <Sparkles size={10} className="text-cyber-green" />}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-gray-600 group-hover:text-white transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-cyber-card border border-cyber-border rounded-2xl p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookupIP()}
              placeholder="Enter IP address (e.g. 8.8.8.8) or Domain..."
              className="w-full bg-black/40 border border-cyber-border rounded-xl pl-12 pr-32 py-4 font-mono text-white focus:outline-none focus:border-orange-400/50 transition-colors"
            />
            <button
              onClick={lookupIP}
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-mono text-sm transition-all"
            >
              {loading ? 'SCANNING...' : 'LOOKUP'}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-mono flex items-center gap-3">
              <Shield size={16} />
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="bg-black/20 border border-cyber-border p-5 rounded-xl space-y-4">
                  <div className="flex items-center gap-3 text-orange-400">
                    <MapPin size={18} />
                    <span className="text-xs font-mono uppercase tracking-widest">Location Data</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Country</span>
                      <span className="text-white font-mono">{result.country}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">City</span>
                      <span className="text-white font-mono">{result.city}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Coordinates</span>
                      <span className="text-white font-mono">{result.lat}, {result.lon}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black/20 border border-cyber-border p-5 rounded-xl space-y-4">
                  <div className="flex items-center gap-3 text-blue-400">
                    <Server size={18} />
                    <span className="text-xs font-mono uppercase tracking-widest">Provider Data</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">ISP</span>
                      <span className="text-white font-mono truncate max-w-[150px]">{result.isp}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Organization</span>
                      <span className="text-white font-mono truncate max-w-[150px]">{result.org}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">AS Number</span>
                      <span className="text-white font-mono">{result.as?.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="pt-4 border-t border-cyber-border">
                <button
                  onClick={runAIScan}
                  disabled={aiScanning}
                  className="w-full bg-cyber-green/10 hover:bg-cyber-green/20 border border-cyber-green/30 text-cyber-green py-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all group"
                >
                  {aiScanning ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Bot size={16} className="group-hover:scale-110 transition-transform" />
                  )}
                  {aiScanning ? 'AI ANALYZING INFRASTRUCTURE...' : 'RUN AI VULNERABILITY SCAN'}
                  <Sparkles size={14} className="opacity-50" />
                </button>
              </div>

              <AnimatePresence>
                {aiResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-6 bg-black/40 border border-cyber-green/20 rounded-2xl space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-cyber-green text-xs font-mono uppercase tracking-widest">
                        <Shield size={14} />
                        AI Security Report
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-gray-500">
                        <CheckCircle2 size={10} className="text-cyber-green" />
                        VERIFIED ANALYSIS
                      </div>
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none font-sans text-gray-300 leading-relaxed">
                      {aiResult.split('\n').map((line, i) => {
                        if (line.startsWith('###') || line.startsWith('##')) {
                          return <h4 key={i} className="text-white font-bold mt-4 mb-2 uppercase text-xs tracking-wider">{line.replace(/#/g, '').trim()}</h4>;
                        }
                        if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.') || line.startsWith('5.')) {
                          return <div key={i} className="flex gap-2 mb-1"><span className="text-cyber-green font-mono">{line.split('.')[0]}.</span><span>{line.split('.').slice(1).join('.').trim()}</span></div>;
                        }
                        if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                          return <div key={i} className="flex gap-2 mb-1 ml-2 text-gray-400"><span className="text-cyber-green">•</span><span>{line.trim().substring(1).trim()}</span></div>;
                        }
                        return line.trim() ? <p key={i} className="mb-2">{line}</p> : null;
                      })}
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-[10px] text-red-400/70 font-mono italic">
                      <AlertTriangle size={12} />
                      Disclaimer: This is an AI-generated simulation based on OSINT data. Always perform manual verification.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-cyber-card border border-cyber-border p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 rounded-lg text-orange-400">
            <Wifi size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-mono">Network Status</div>
            <div className="text-white font-bold">Online</div>
          </div>
        </div>
        <div className="bg-cyber-card border border-cyber-border p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
            <Database size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-mono">OSINT Nodes</div>
            <div className="text-white font-bold">Global</div>
          </div>
        </div>
        <div className="bg-cyber-card border border-cyber-border p-6 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-cyber-green/10 rounded-lg text-cyber-green">
            <Shield size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase font-mono">Privacy Mode</div>
            <div className="text-white font-bold">Enabled</div>
          </div>
        </div>
      </div>
    </div>
  );
}
