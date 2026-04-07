import React, { useState, useEffect, useRef } from 'react';
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
  Crosshair,
  Filter,
  Trash2,
  Save,
  Maximize2,
  Minimize2,
  ExternalLink,
  Info,
  Bug,
  Radio,
  Key,
  HardDrive,
  Network
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { logToTerminal } from './Terminal';

interface ToolInfo {
  id: string;
  name: string;
  icon: any;
  description: string;
  category: 'Information Gathering' | 'Vulnerability Analysis' | 'Wireless Attacks' | 'Web Applications' | 'Exploitation Tools' | 'Stress Testing' | 'Forensics Tools' | 'Sniffing & Spoofing' | 'Password Attacks' | 'Maintaining Access' | 'Reverse Engineering';
  intelligence: string;
  commands: string[];
  kaliCategory: string;
}

const KALI_CATEGORIES = [
  { id: 'all', name: 'All Tools', icon: Shield },
  { id: '01-info-gathering', name: 'Information Gathering', icon: Globe },
  { id: '02-vulnerability-analysis', name: 'Vulnerability Analysis', icon: Search },
  { id: '03-webapp-analysis', name: 'Web Applications', icon: Layers },
  { id: '05-password-attacks', name: 'Password Attacks', icon: Lock },
  { id: '06-wireless-attacks', name: 'Wireless Attacks', icon: Wifi },
  { id: '07-reverse-engineering', name: 'Reverse Engineering', icon: Cpu },
  { id: '08-exploitation-tools', name: 'Exploitation Tools', icon: Crosshair },
  { id: '09-sniffing-spoofing', name: 'Sniffing & Spoofing', icon: Activity },
  { id: '10-maintaining-access', name: 'Maintaining Access', icon: Terminal },
];

const PEN_TOOLS: ToolInfo[] = [
  // Information Gathering
  {
    id: 'nmap',
    name: 'Nmap',
    icon: Globe,
    category: 'Information Gathering',
    kaliCategory: '01-info-gathering',
    description: 'Network exploration tool and security / port scanner.',
    intelligence: 'Advanced topology mapping and service version detection. Uses NSE scripts for vulnerability discovery.',
    commands: ['nmap -sV -sC -O target.com', 'nmap -T4 -A -v target.com']
  },
  {
    id: 'whois',
    name: 'Whois',
    icon: Search,
    category: 'Information Gathering',
    kaliCategory: '01-info-gathering',
    description: 'Client for the whois directory service.',
    intelligence: 'Retrieves registration data for domain names and IP address blocks.',
    commands: ['whois target.com']
  },
  {
    id: 'dnsrecon',
    name: 'DNSRecon',
    icon: Globe,
    category: 'Information Gathering',
    kaliCategory: '01-info-gathering',
    description: 'DNS Enumeration and Scanning Tool.',
    intelligence: 'Performs zone transfers, reverse lookups, and brute forcing of DNS records.',
    commands: ['dnsrecon -d target.com']
  },
  // Vulnerability Analysis
  {
    id: 'nikto',
    name: 'Nikto',
    icon: Search,
    category: 'Vulnerability Analysis',
    kaliCategory: '02-vulnerability-analysis',
    description: 'Web server scanner that tests for dangerous files and outdated software.',
    intelligence: 'Scans for over 6700 potentially dangerous files/programs and checks for outdated versions of over 1250 servers.',
    commands: ['nikto -h http://target.com', 'nikto -h http://target.com -ssl']
  },
  {
    id: 'sqlmap',
    name: 'sqlmap',
    icon: Database,
    category: 'Web Applications',
    kaliCategory: '03-webapp-analysis',
    description: 'Automatic SQL injection and database takeover tool.',
    intelligence: 'Advanced heuristic engine for blind SQLi detection. Capable of fingerprinting DBMS, fetching data, and accessing underlying file systems.',
    commands: ['sqlmap -u "http://target.com/id=1" --dbs', 'sqlmap -u "http://target.com/id=1" --os-shell']
  },
  // Wireless Attacks
  {
    id: 'aircrack-ng',
    name: 'Aircrack-ng',
    icon: Wifi,
    category: 'Wireless Attacks',
    kaliCategory: '06-wireless-attacks',
    description: 'Complete suite of tools to assess WiFi network security.',
    intelligence: 'Focuses on different areas of WiFi security: Monitoring, Attacking, Testing, and Cracking (WEP and WPA-PSK).',
    commands: ['airmon-ng start wlan0', 'airodump-ng wlan0mon', 'aircrack-ng -w wordlist.txt capture.cap']
  },
  // Exploitation Tools
  {
    id: 'metasploit',
    name: 'Metasploit',
    icon: Crosshair,
    category: 'Exploitation Tools',
    kaliCategory: '08-exploitation-tools',
    description: 'World\'s most used penetration testing framework.',
    intelligence: 'Modular exploit delivery system. Integrated with database for session management and post-exploitation modules.',
    commands: ['msfconsole', 'use exploit/multi/handler', 'set PAYLOAD windows/meterpreter/reverse_tcp']
  },
  {
    id: 'beef',
    name: 'BeEF',
    icon: Layers,
    category: 'Exploitation Tools',
    kaliCategory: '08-exploitation-tools',
    description: 'The Browser Exploitation Framework.',
    intelligence: 'Focuses on the web browser, allowing for client-side attack vectors.',
    commands: ['beef-xss']
  },
  // Sniffing & Spoofing
  {
    id: 'wireshark',
    name: 'Wireshark',
    icon: Activity,
    category: 'Sniffing & Spoofing',
    kaliCategory: '09-sniffing-spoofing',
    description: 'The world\'s foremost network protocol analyzer.',
    intelligence: 'Deep inspection of hundreds of protocols. Live capture and offline analysis with powerful display filters.',
    commands: ['wireshark', 'tshark -i eth0 -w capture.pcap']
  },
  {
    id: 'bettercap',
    name: 'Bettercap',
    icon: Zap,
    category: 'Sniffing & Spoofing',
    kaliCategory: '09-sniffing-spoofing',
    description: 'The Swiss Army knife for 802.11, BLE and Ethernet networks reconnaissance and MITM attacks.',
    intelligence: 'Modular and extensible tool for network attacks.',
    commands: ['bettercap -iface eth0']
  },
  // Password Attacks
  {
    id: 'john-the-ripper',
    name: 'John the Ripper',
    icon: Lock,
    category: 'Password Attacks',
    kaliCategory: '05-password-attacks',
    description: 'Fast password cracker.',
    intelligence: 'Auto-detects hash types and uses optimized assembly code for maximum performance. Supports custom rules and wordlists.',
    commands: ['john --wordlist=pass.txt hashes.txt', 'john --format=sha512crypt hashes.txt']
  },
  {
    id: 'hashcat',
    name: 'Hashcat',
    icon: FileCode,
    category: 'Password Attacks',
    kaliCategory: '05-password-attacks',
    description: 'The world\'s fastest and most advanced password recovery utility.',
    intelligence: 'GPU-accelerated cracking engine. Supports over 300 hashing algorithms and advanced attack modes like mask and hybrid.',
    commands: ['hashcat -m 0 hashes.txt wordlist.txt', 'hashcat -a 3 -m 1000 hashes.txt ?a?a?a?a?a?a?a?a']
  },
  {
    id: 'hydra',
    name: 'Hydra',
    icon: Zap,
    category: 'Password Attacks',
    kaliCategory: '05-password-attacks',
    description: 'Parallelized login cracker.',
    intelligence: 'High-speed network login cracker. Supports over 50 protocols including SSH, FTP, HTTP, SMB, and VNC.',
    commands: ['hydra -l admin -P pass.txt target.com ssh', 'hydra -L users.txt -P pass.txt target.com http-post-form "/login:user=^USER^&pass=^PASS^:F=Login failed"']
  },
  // Maintaining Access
  {
    id: 'powersploit',
    name: 'PowerSploit',
    icon: Terminal,
    category: 'Maintaining Access',
    kaliCategory: '10-maintaining-access',
    description: 'A collection of Microsoft PowerShell modules that can be used to aid penetration testers.',
    intelligence: 'Provides post-exploitation capabilities for Windows environments.',
    commands: ['Import-Module PowerSploit.psm1']
  },
  // Reverse Engineering
  {
    id: 'ghidra',
    name: 'Ghidra',
    icon: Cpu,
    category: 'Reverse Engineering',
    kaliCategory: '07-reverse-engineering',
    description: 'A software reverse engineering (SRE) suite of tools developed by NSA\'s Research Directorate.',
    intelligence: 'Includes a decompiler, graph view, and scripting capabilities.',
    commands: ['ghidraRun']
  }
];

interface ScanResult {
  id: string;
  toolId: string;
  target: string;
  timestamp: string;
  logs: string[];
  vulnerabilities: any[];
}

export default function PenetrationTools() {
  const [selectedTool, setSelectedTool] = useState<ToolInfo>(PEN_TOOLS[0]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisLogs, setAnalysisLogs] = useState<string[]>([]);
  const [target, setTarget] = useState('');
  const [workspace, setWorkspace] = useState<ScanResult[]>([]);
  const [isTerminalMaximized, setIsTerminalMaximized] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const filteredTools = activeCategory === 'all' 
    ? PEN_TOOLS 
    : PEN_TOOLS.filter(t => t.kaliCategory === activeCategory);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [analysisLogs]);

  const runAnalysis = () => {
    if (!target) {
      logToTerminal('Target required for penetration analysis.', 'error');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisLogs([`[${new Date().toLocaleTimeString()}] Initializing ${selectedTool.name} framework...`]);
    logToTerminal(`Initiating ${selectedTool.name} analysis on ${target}...`, 'info');

    const steps = [
      `Loading modules for ${selectedTool.category}...`,
      `Resolving target: ${target}`,
      `Starting reconnaissance phase...`,
      `Scanning for service fingerprints...`,
      `Injecting advanced intelligence payloads...`,
      `Analyzing protocol state machine...`,
      `Correlating with global CVE database...`,
      `Identifying exploitation vectors...`,
      `Generating post-exploitation report...`,
      `Analysis complete. Results saved to workspace.`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const timestamp = new Date().toLocaleTimeString();
        setAnalysisLogs(prev => [...prev, `[${timestamp}] ${steps[currentStep]}`]);
        setAnalysisProgress((currentStep + 1) * (100 / steps.length));
        currentStep++;
      } else {
        clearInterval(interval);
        setIsAnalyzing(false);
        
        const newResult: ScanResult = {
          id: Math.random().toString(36).substr(2, 9),
          toolId: selectedTool.id,
          target: target,
          timestamp: new Date().toISOString(),
          logs: [...analysisLogs],
          vulnerabilities: [
            { title: 'CVE-2024-1234', desc: 'Remote Code Execution via buffer overflow.', sev: 'CRITICAL' },
            { title: 'Insecure Auth', desc: 'Weak password hashing detected.', sev: 'HIGH' }
          ]
        };
        setWorkspace(prev => [newResult, ...prev]);
        logToTerminal(`${selectedTool.name} analysis complete.`, 'success');
      }
    }, 800);
  };

  const clearWorkspace = () => {
    setWorkspace([]);
    logToTerminal('Workspace cleared.', 'info');
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
            <Shield className="text-red-500 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-cyber-header tracking-tight">KALI-SUITE ADVANCED</h1>
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest">
              <span className="animate-pulse">●</span>
              <span>Intelligence Analysis Framework v2.0</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-green/50" size={16} />
            <input 
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="TARGET_IP_OR_DOMAIN"
              className="w-full bg-black/60 border border-cyber-border rounded-xl pl-10 pr-4 py-3 text-sm font-mono text-cyber-header focus:outline-none focus:border-red-500/50 transition-all shadow-inner"
            />
          </div>
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className={cn(
              "px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all uppercase tracking-widest",
              isAnalyzing 
                ? "bg-black/60 text-red-500/30 border border-red-500/10 cursor-not-allowed" 
                : "bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            )}
          >
            {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            {isAnalyzing ? 'RUNNING...' : 'EXECUTE'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left Sidebar - Categories & Tools */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
          {/* Category Filter */}
          <div className="bg-cyber-card border border-white/5 rounded-2xl p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar max-h-[300px]">
            <div className="px-3 py-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Filter size={12} />
              Categories
            </div>
            {KALI_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all text-left",
                  activeCategory === cat.id 
                    ? "bg-red-500/10 text-red-500 font-bold border border-red-500/20" 
                    : "text-cyber-text/60 hover:bg-white/5"
                )}
              >
                <cat.icon size={14} />
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Tool List */}
          <div className="flex-1 bg-cyber-card border border-white/5 rounded-2xl p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar">
            <div className="px-3 py-2 text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Terminal size={12} />
              Tools ({filteredTools.length})
            </div>
            {filteredTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all text-left group",
                  selectedTool.id === tool.id 
                    ? "bg-white/5 border border-white/10 text-cyber-header shadow-lg" 
                    : "text-cyber-text/60 hover:bg-white/5"
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
              </button>
            ))}
          </div>
        </div>

        {/* Main Workspace Area */}
        <div className="lg:col-span-9 flex flex-col gap-6 min-h-0">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 min-h-0">
            {/* Tool Details & Intelligence */}
            <div className="flex flex-col gap-6 min-h-0 overflow-y-auto custom-scrollbar pr-2">
              <div className="bg-cyber-card border border-white/5 rounded-2xl p-6 relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <selectedTool.icon size={120} />
                </div>
                <div className="relative z-10 flex gap-6 items-start">
                  <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                    <selectedTool.icon size={48} className="text-red-500" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h2 className="text-2xl font-bold text-cyber-header">{selectedTool.name}</h2>
                    <p className="text-cyber-text/80 text-sm leading-relaxed">{selectedTool.description}</p>
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

              <div className="bg-cyber-card border border-white/5 rounded-2xl p-6 space-y-4 shrink-0">
                <div className="flex items-center gap-2 text-cyber-header font-bold text-sm uppercase tracking-widest">
                  <Info size={16} className="text-blue-500" />
                  Advanced Intelligence Analysis
                </div>
                <div className="p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-xs leading-relaxed text-cyber-text/70">
                  {selectedTool.intelligence}
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-[10px] text-gray-500 uppercase mb-1">Complexity</div>
                    <div className="text-sm font-bold text-cyber-header">Advanced</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-[10px] text-gray-500 uppercase mb-1">Risk Level</div>
                    <div className="text-sm font-bold text-red-500">High</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-[10px] text-gray-500 uppercase mb-1">Stealth</div>
                    <div className="text-sm font-bold text-amber-500">Medium</div>
                  </div>
                </div>
              </div>

              {/* Workspace History */}
              <div className="bg-cyber-card border border-white/5 rounded-2xl p-6 space-y-4 flex-1 min-h-0 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyber-header font-bold text-sm uppercase tracking-widest">
                    <Save size={16} className="text-emerald-500" />
                    Workspace History
                  </div>
                  <button 
                    onClick={clearWorkspace}
                    className="text-[10px] text-red-500/60 hover:text-red-500 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={12} />
                    CLEAR ALL
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                  {workspace.length > 0 ? (
                    workspace.map((res) => (
                      <div key={res.id} className="p-4 bg-black/40 border border-white/5 rounded-xl space-y-2 group hover:border-emerald-500/30 transition-all">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-xs font-bold text-cyber-header">{res.toolId.toUpperCase()} @ {res.target}</div>
                            <div className="text-[10px] text-gray-500 font-mono">{new Date(res.timestamp).toLocaleString()}</div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded">SUCCESS</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-[10px] text-blue-500 hover:underline flex items-center gap-1">
                            <Maximize2 size={10} /> VIEW LOGS
                          </button>
                          <button className="text-[10px] text-emerald-500 hover:underline flex items-center gap-1">
                            <Download size={10} /> EXPORT
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4">
                      <Database size={48} className="opacity-20" />
                      <p className="text-xs italic">No scan history in current workspace.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Advanced Terminal View */}
            <div className={cn(
              "bg-black/90 border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all duration-500",
              isTerminalMaximized ? "fixed inset-10 z-50" : "relative"
            )}>
              <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 ml-4">root@kali-suite:~/{selectedTool.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsTerminalMaximized(!isTerminalMaximized)}
                    className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400"
                  >
                    {isTerminalMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                  <button className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400">
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 p-6 font-mono text-xs overflow-y-auto custom-scrollbar bg-[#050505]">
                {analysisLogs.length > 0 ? (
                  <div className="space-y-2">
                    {analysisLogs.map((log, i) => (
                      <div key={i} className="text-emerald-500/90 leading-relaxed break-all">
                        <span className="text-emerald-500/40 mr-2">➜</span>
                        {log}
                      </div>
                    ))}
                    {isAnalyzing && (
                      <div className="flex items-center gap-2 text-emerald-500 animate-pulse">
                        <span className="text-emerald-500/40 mr-2">➜</span>
                        <span className="bg-emerald-500 w-2 h-4" />
                        Processing intelligence modules...
                      </div>
                    )}
                    <div ref={terminalEndRef} />
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-emerald-500/20 gap-4">
                    <Terminal size={64} />
                    <div className="text-center">
                      <p className="font-bold">TERMINAL_IDLE</p>
                      <p className="text-[10px]">READY FOR COMMAND EXECUTION</p>
                    </div>
                  </div>
                )}
              </div>

              {isAnalyzing && (
                <div className="bg-white/5 p-4 border-t border-white/10">
                  <div className="flex justify-between text-[10px] font-mono text-emerald-500/60 mb-2">
                    <span>TASK_PROGRESS</span>
                    <span>{Math.round(analysisProgress)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${analysisProgress}%` }}
                      className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
