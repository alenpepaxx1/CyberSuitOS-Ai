/* COPYRIGHT ALEN PEPA */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Terminal as TerminalIcon, 
  Code, 
  Trash2, 
  Save, 
  FileCode, 
  Sparkles, 
  Cpu, 
  Zap, 
  Shield,
  Loader2,
  Copy,
  Download,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { logToTerminal } from './Terminal';

// Load Pyodide from CDN
const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";

interface Script {
  id: string;
  name: string;
  code: string;
  description: string;
  category: 'Network' | 'Crypto' | 'Web' | 'Utility';
}

const DEFAULT_SCRIPTS: Script[] = [
  {
    id: '1',
    name: 'Port Scanner Simulation',
    category: 'Network',
    description: 'A simple script to simulate scanning common ports.',
    code: `import time
import random

def scan_ports(target):
    print(f"[*] Starting scan on {target}...")
    common_ports = [21, 22, 23, 25, 53, 80, 110, 443, 3306, 8080]
    
    for port in common_ports:
        time.sleep(0.1) # Simulate network delay
        status = "OPEN" if random.random() > 0.7 else "CLOSED"
        print(f"[+] Port {port}: {status}")
    
    print("[*] Scan complete.")

scan_ports("192.168.1.1")`
  },
  {
    id: '2',
    name: 'Base64 Encoder/Decoder',
    category: 'Crypto',
    description: 'Encodes and decodes strings using base64.',
    code: `import base64

def process_data(data):
    # Encoding
    encoded = base64.b64encode(data.encode()).decode()
    print(f"Encoded: {encoded}")
    
    # Decoding
    decoded = base64.b64decode(encoded.encode()).decode()
    print(f"Decoded: {decoded}")

process_data("CyberSuite OS Neural Core")`
  },
  {
    id: '3',
    name: 'Password Generator',
    category: 'Crypto',
    description: 'Generates a secure random password.',
    code: `import random
import string

def generate_password(length=16):
    chars = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(random.choice(chars) for _ in range(length))
    return password

print(f"Generated Secure Password: {generate_password()}")`
  }
];

export default function PythonLab() {
  const [code, setCode] = useState(DEFAULT_SCRIPTS[0].code);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPyodideLoading, setIsPyodideLoading] = useState(true);
  const [pyodide, setPyodide] = useState<any>(null);
  const [activeScript, setActiveScript] = useState<string>(DEFAULT_SCRIPTS[0].id);
  const outputEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPyodide = async () => {
      try {
        if (!(window as any).loadPyodide) {
          const script = document.createElement("script");
          script.src = PYODIDE_URL;
          script.async = true;
          document.body.appendChild(script);
          
          script.onload = async () => {
            const py = await (window as any).loadPyodide();
            setPyodide(py);
            setIsPyodideLoading(false);
            logToTerminal("Python Neural Core (Pyodide) initialized.", "success");
          };
        } else {
          const py = await (window as any).loadPyodide();
          setPyodide(py);
          setIsPyodideLoading(false);
        }
      } catch (err) {
        console.error("Failed to load Pyodide:", err);
        logToTerminal("Failed to initialize Python Neural Core.", "error");
      }
    };

    loadPyodide();
  }, []);

  useEffect(() => {
    if (outputEndRef.current) {
      outputEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output]);

  const runCode = async () => {
    if (!pyodide || isRunning) return;
    
    setIsRunning(true);
    setOutput([]);
    logToTerminal("Executing Python script...", "info");
    
    try {
      // Capture stdout
      pyodide.setStdout({
        batched: (msg: string) => {
          setOutput(prev => [...prev, msg]);
        }
      });

      await pyodide.runPythonAsync(code);
      logToTerminal("Python execution complete.", "success");
    } catch (err: any) {
      setOutput(prev => [...prev, `ERROR: ${err.message}`]);
      logToTerminal("Python execution failed.", "error");
    } finally {
      setIsRunning(false);
    }
  };

  const clearOutput = () => {
    setOutput([]);
    logToTerminal("Python output cleared.", "warn");
  };

  const selectScript = (script: Script) => {
    setActiveScript(script.id);
    setCode(script.code);
    logToTerminal(`Loaded script: ${script.name}`, "info");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Code className="text-yellow-500" size={32} />
            Python Scripting Lab
          </h1>
          <p className="text-gray-500">Write, test, and execute Python scripts directly in your secure environment.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {isPyodideLoading ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <Loader2 className="text-yellow-500 animate-spin" size={18} />
              <span className="text-xs font-mono text-yellow-500 uppercase">Initializing Core...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-cyber-green/10 border border-cyber-green/20 rounded-xl">
              <CheckCircle2 className="text-cyber-green" size={18} />
              <span className="text-xs font-mono text-cyber-green uppercase">Core Online</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Scripts Library */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-cyber-card border border-cyber-border rounded-xl p-4">
            <h3 className="text-sm font-mono font-bold text-white mb-4 flex items-center gap-2">
              <FileCode size={16} className="text-cyan-400" />
              SCRIPT_LIBRARY
            </h3>
            <div className="space-y-2">
              {DEFAULT_SCRIPTS.map((script) => (
                <button
                  key={script.id}
                  onClick={() => selectScript(script)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-all group",
                    activeScript === script.id
                      ? "bg-cyan-500/10 border-cyan-500/30"
                      : "bg-white/5 border-transparent hover:border-white/10"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-xs font-bold",
                      activeScript === script.id ? "text-cyan-400" : "text-gray-300"
                    )}>
                      {script.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 uppercase">
                      {script.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 line-clamp-1">{script.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-cyber-card border border-cyber-border rounded-xl p-4">
            <h3 className="text-sm font-mono font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-500" />
              SYSTEM_INFO
            </h3>
            <div className="space-y-2 text-[10px] font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">Python Version:</span>
                <span className="text-white">3.11.0 (Pyodide)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Environment:</span>
                <span className="text-white">WASM Sandbox</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Memory Limit:</span>
                <span className="text-white">Browser Shared</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Editor & Output */}
        <div className="lg:col-span-3 space-y-6">
          {/* Editor */}
          <div className="bg-cyber-card border border-cyber-border rounded-xl overflow-hidden flex flex-col h-[400px]">
            <div className="p-3 border-b border-cyber-border bg-cyber-card/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5 mr-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                </div>
                <span className="text-xs font-mono text-gray-400">script.py</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={runCode}
                  disabled={isPyodideLoading || isRunning}
                  className="flex items-center gap-2 px-3 py-1.5 bg-cyber-green/20 text-cyber-green border border-cyber-green/30 rounded-lg text-xs font-bold hover:bg-cyber-green/30 transition-colors disabled:opacity-50"
                >
                  {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                  RUN_SCRIPT
                </button>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 bg-cyber-bg p-6 font-mono text-sm text-gray-300 focus:outline-none resize-none custom-scrollbar"
            />
          </div>

          {/* Output Terminal */}
          <div className="bg-cyber-card border border-cyber-border rounded-xl overflow-hidden flex flex-col h-[250px]">
            <div className="p-3 border-b border-cyber-border bg-cyber-card/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TerminalIcon size={14} className="text-cyber-green" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">Console Output</span>
              </div>
              <button 
                onClick={clearOutput}
                className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                title="Clear Output"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="flex-1 bg-black/40 p-4 font-mono text-xs overflow-y-auto custom-scrollbar">
              {output.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-600 italic">
                  No output to display. Run a script to see results.
                </div>
              ) : (
                <div className="space-y-1">
                  {output.map((line, i) => (
                    <div key={i} className={cn(
                      "whitespace-pre-wrap",
                      line.startsWith('ERROR:') ? "text-red-400" : "text-cyber-green"
                    )}>
                      {line}
                    </div>
                  ))}
                  <div ref={outputEndRef} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
