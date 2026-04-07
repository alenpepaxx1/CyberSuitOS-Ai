import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  Shield, 
  Zap, 
  Search, 
  Database, 
  Globe, 
  Cpu, 
  Activity, 
  Lock, 
  Wifi, 
  Smartphone,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Download,
  Play,
  FileCode,
  Layers,
  Crosshair
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { logToTerminal } from './Terminal';

interface ToolInfo {
  id: string;
  name: string;
  icon: any;
  description: string;
  category: 'Web' | 'Network' | 'Exploitation' | 'Mobile' | 'Wireless' | 'Cracking';
  intelligence: string;
  commands: string[];
}

const PEN_TOOLS: ToolInfo[] = [
  {
    id: 'sqlmap',
    name: 'sqlmap',
    icon: Database,
    category: 'Web',
    description: 'Automatic SQL injection and database takeover tool.',
    intelligence: 'Advanced heuristic engine for blind SQLi detection. Capable of fingerprinting DBMS, fetching data, and accessing underlying file systems.',
    commands: ['sqlmap -u "http://target.com/id=1" --dbs', 'sqlmap -u "http://target.com/id=1" --os-shell']
  },
  {
    id: 'zenmap',
    name: 'Zenmap',
    icon: Globe,
    category: 'Network',
    description: 'The official Nmap Security Scanner GUI.',
    intelligence: 'Advanced topology mapping and service version detection. Uses NSE scripts for vulnerability discovery.',
    commands: ['nmap -sV -sC -O target.com', 'nmap -T4 -A -v target.com']
  },
  {
    id: 'linux-exploit-suggester',
    name: 'Linux Exploit Suggester',
    icon: Cpu,
    category: 'Exploitation',
    description: 'Suggests potential exploits for a given Linux kernel.',
    intelligence: 'Correlates kernel versions with known CVEs and public exploit databases. Analyzes system configuration for misconfigurations.',
    commands: ['./les.sh --uname "Linux 4.4.0-21-generic"', './les.sh --full']
  },
  {
    id: 'mobsf',
    name: 'MobSF',
    icon: Smartphone,
    category: 'Mobile',
    description: 'Mobile Security Framework (Static and Dynamic Analysis).',
    intelligence: 'Automated malware analysis and security assessment for Android/iOS apps. Detects hardcoded secrets and insecure API usage.',
    commands: ['python manage.py runserver', 'mobsf-cli -f app.apk']
  },
  {
    id: 'metasploit',
    name: 'Metasploit',
    icon: Crosshair,
    category: 'Exploitation',
    description: 'World\'s most used penetration testing framework.',
    intelligence: 'Modular exploit delivery system. Integrated with database for session management and post-exploitation modules.',
    commands: ['msfconsole', 'use exploit/multi/handler', 'set PAYLOAD windows/meterpreter/reverse_tcp']
  },
  {
    id: 'burp-suite',
    name: 'Burp Suite',
    icon: Layers,
    category: 'Web',
    description: 'Integrated platform for performing security testing of web applications.',
    intelligence: 'Advanced intercepting proxy with automated vulnerability scanning. Capable of complex session handling and custom extensions.',
    commands: ['burpsuite', 'java -jar burpsuite_pro.jar']
  },
  {
    id: 'nikto',
    name: 'Nikto',
    icon: Search,
    category: 'Web',
    description: 'Web server scanner that tests for dangerous files and outdated software.',
    intelligence: 'Scans for over 6700 potentially dangerous files/programs and checks for outdated versions of over 1250 servers.',
    commands: ['nikto -h http://target.com', 'nikto -h http://target.com -ssl']
  },
  {
    id: 'wireshark',
    name: 'Wireshark',
    icon: Activity,
    category: 'Network',
    description: 'The world\'s foremost network protocol analyzer.',
    intelligence: 'Deep inspection of hundreds of protocols. Live capture and offline analysis with powerful display filters.',
    commands: ['wireshark', 'tshark -i eth0 -w capture.pcap']
  },
  {
    id: 'john-the-ripper',
    name: 'John the Ripper',
    icon: Lock,
    category: 'Cracking',
    description: 'Fast password cracker, currently available for many flavors of Unix, Windows, DOS, and OpenVMS.',
    intelligence: 'Auto-detects hash types and uses optimized assembly code for maximum performance. Supports custom rules and wordlists.',
    commands: ['john --wordlist=pass.txt hashes.txt', 'john --format=sha512crypt hashes.txt']
  },
  {
    id: 'hydra',
    name: 'Hydra',
    icon: Zap,
    category: 'Cracking',
    description: 'Parallelized login cracker which supports numerous protocols to attack.',
    intelligence: 'High-speed network login cracker. Supports over 50 protocols including SSH, FTP, HTTP, SMB, and VNC.',
    commands: ['hydra -l admin -P pass.txt target.com ssh', 'hydra -L users.txt -P pass.txt target.com http-post-form "/login:user=^USER^&pass=^PASS^:F=Login failed"']
  },
  {
    id: 'aircrack-ng',
    name: 'Aircrack-ng',
    icon: Wifi,
    category: 'Wireless',
    description: 'Complete suite of tools to assess WiFi network security.',
    intelligence: 'Focuses on different areas of WiFi security: Monitoring, Attacking, Testing, and Cracking (WEP and WPA-PSK).',
    commands: ['airmon-ng start wlan0', 'airodump-ng wlan0mon', 'aircrack-ng -w wordlist.txt capture.cap']
  },
  {
    id: 'hashcat',
    name: 'Hashcat',
    icon: FileCode,
    category: 'Cracking',
    description: 'The world\'s fastest and most advanced password recovery utility.',
    intelligence: 'GPU-accelerated cracking engine. Supports over 300 hashing algorithms and advanced attack modes like mask and hybrid.',
    commands: ['hashcat -m 0 hashes.txt wordlist.txt', 'hashcat -a 3 -m 1000 hashes.txt ?a?a?a?a?a?a?a?a']
  }
];

export default function PenetrationTools() {
  const [selectedTool, setSelectedTool] = useState<ToolInfo>(PEN_TOOLS[0]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [target, setTarget] = useState('');

  const runAnalysis = () => {
    if (!target) {
      logToTerminal('Target required for penetration analysis.', 'error');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisLogs([]);
    logToTerminal(`Initiating ${selectedTool.name} analysis on ${target}...`, 'info');

    const steps = [
      `Initializing ${selectedTool.name} engine...`,
      `Establishing connection to ${target}...`,
      `Performing heuristic fingerprinting...`,
      `Analyzing protocol responses...`,
      `Running advanced intelligence modules...`,
      `Correlating findings with CVE database...`,
      `Generating exploitation vectors...`,
      `Finalizing intelligence report...`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setAnalysisLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${steps[currentStep]}`]);
        setAnalysisProgress((currentStep + 1) * (100 / steps.length));
        currentStep++;
      } else {
        clearInterval(interval);
        setIsAnalyzing(false);
        logToTerminal(`${selectedTool.name} analysis complete. Vulnerabilities identified.`, 'success');
      }
    }, 1200);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-cyber-header flex items-center gap-2">
            <Shield className="text-red-500" />
            PENETRATION TESTING SUITE
          </h1>
          <p className="text-cyber-text/60 text-sm">Advanced intelligence analysis and exploitation framework.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-green/50" size={16} />
            <input 
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Enter target (e.g. 192.168.1.1)"
              className="w-full bg-black/40 border border-cyber-border rounded-lg pl-10 pr-4 py-2 text-sm text-cyber-header focus:outline-none focus:border-red-500/50 transition-all"
            />
          </div>
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
              isAnalyzing 
                ? "bg-black/60 text-red-500/30 border border-red-500/10 cursor-not-allowed" 
                : "bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            )}
          >
            {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            {isAnalyzing ? 'ANALYZING...' : 'RUN TOOL'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Sidebar - Tool Selection */}
        <div className="lg:col-span-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-2">
          {PEN_TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all text-left group",
                selectedTool.id === tool.id 
                  ? "bg-red-500/10 border border-red-500/30 text-cyber-header" 
                  : "bg-black/20 border border-white/5 text-cyber-text/60 hover:bg-white/5"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                selectedTool.id === tool.id ? "bg-red-500/20 text-red-500" : "bg-black/40 group-hover:text-cyber-header"
              )}>
                <tool.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold truncate">{tool.name}</div>
                <div className="text-[10px] uppercase tracking-wider opacity-50">{tool.category}</div>
              </div>
              <ChevronRight size={14} className={cn("transition-transform", selectedTool.id === tool.id ? "rotate-90 text-red-500" : "opacity-0 group-hover:opacity-100")} />
            </button>
          ))}
        </div>

        {/* Main Analysis Area */}
        <div className="lg:col-span-9 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedTool.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Tool Header */}
              <div className="bg-cyber-card border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <selectedTool.icon size={120} />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                  <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                    <selectedTool.icon size={48} className="text-red-500" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-cyber-header">{selectedTool.name}</h2>
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-mono border border-red-500/20 rounded uppercase">
                        {selectedTool.category}
                      </span>
                    </div>
                    <p className="text-cyber-text/80">{selectedTool.description}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedTool.commands.map((cmd, i) => (
                        <code key={i} className="px-3 py-1 bg-black/40 border border-white/5 rounded text-[10px] font-mono text-cyber-green/80">
                          {cmd}
                        </code>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Intelligence Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-cyber-card border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-cyber-header font-bold text-sm uppercase tracking-widest">
                    <Zap size={16} className="text-amber-500" />
                    Advanced Intelligence Analysis
                  </div>
                  <div className="p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-xs leading-relaxed text-cyber-text/70">
                    {selectedTool.intelligence}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-[10px] text-gray-500 uppercase mb-1">Complexity</div>
                      <div className="text-sm font-bold text-cyber-header">Advanced</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-[10px] text-gray-500 uppercase mb-1">Risk Level</div>
                      <div className="text-sm font-bold text-red-500">High</div>
                    </div>
                  </div>
                </div>

                <div className="bg-cyber-card border border-white/5 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-cyber-header font-bold text-sm uppercase tracking-widest">
                    <Activity size={16} className="text-blue-500" />
                    Real-time Analysis Feed
                  </div>
                  <div className="h-[180px] bg-black/60 border border-white/5 rounded-xl p-4 font-mono text-[10px] overflow-y-auto custom-scrollbar space-y-1">
                    {analysisLogs.length > 0 ? (
                      analysisLogs.map((log, i) => (
                        <div key={i} className="text-cyber-green/80 animate-in fade-in slide-in-from-left-2 duration-300">
                          <span className="text-gray-600 mr-2">{" >>> "}</span>
                          {log}
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-600 italic">
                        Waiting for tool execution...
                      </div>
                    )}
                    {isAnalyzing && (
                      <div className="flex items-center gap-2 text-cyber-green animate-pulse">
                        <span className="text-gray-600 mr-2">{" >>> "}</span>
                        Processing...
                        <Loader2 size={10} className="animate-spin" />
                      </div>
                    )}
                  </div>
                  {isAnalyzing && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-cyber-green/60">
                        <span>ANALYSIS PROGRESS</span>
                        <span>{Math.round(analysisProgress)}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${analysisProgress}%` }}
                          className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Exploitation Vectors */}
              <div className="bg-cyber-card border border-white/5 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyber-header font-bold text-sm uppercase tracking-widest">
                    <AlertTriangle size={16} className="text-red-500" />
                    Identified Exploitation Vectors
                  </div>
                  <button className="text-[10px] text-cyber-green hover:underline flex items-center gap-1">
                    <Download size={12} />
                    EXPORT REPORT
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { title: 'CVE-2024-1234', desc: 'Remote Code Execution via buffer overflow in service handler.', sev: 'CRITICAL' },
                    { title: 'Insecure Auth', desc: 'Weak password hashing algorithm detected in database schema.', sev: 'HIGH' },
                    { title: 'Info Leak', desc: 'Verbose error messages disclosing internal system paths.', sev: 'MEDIUM' }
                  ].map((v, i) => (
                    <div key={i} className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-2 group hover:border-red-500/30 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="text-xs font-bold text-cyber-header">{v.title}</div>
                        <span className={cn(
                          "text-[8px] px-1.5 py-0.5 rounded font-mono",
                          v.sev === 'CRITICAL' ? "bg-red-500/20 text-red-500" : 
                          v.sev === 'HIGH' ? "bg-orange-500/20 text-orange-500" : "bg-blue-500/20 text-blue-500"
                        )}>
                          {v.sev}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed">{v.desc}</p>
                      <button className="text-[8px] text-red-500/60 group-hover:text-red-500 transition-colors flex items-center gap-1 pt-1">
                        <Play size={8} />
                        GENERATE EXPLOIT
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
