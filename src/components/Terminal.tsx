/* COPYRIGHT ALEN PEPA */
import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, ChevronRight, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
}

export default function Terminal() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [aliases, setAliases] = useState<Record<string, string>>({
    'scan-vulns': 'scan',
    'pswd': 'passwords'
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const COMMANDS = ['help', 'clear', 'scan', 'whoami', 'status', 'exit', 'alias', 'python'];

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    logToTerminal(`> ${trimmedCmd}`, 'info');
    setHistory(prev => [trimmedCmd, ...prev].slice(0, 50));
    setHistoryIndex(-1);

    const parts = trimmedCmd.split(' ');
    const baseCommand = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Resolve alias
    let resolvedCommand = baseCommand;
    if (aliases[baseCommand]) {
      resolvedCommand = aliases[baseCommand];
      logToTerminal(`Alias resolved: ${baseCommand} -> ${resolvedCommand}`, 'info');
    }

    switch (resolvedCommand) {
      case 'help':
        logToTerminal('Available commands: help, clear, scan, whoami, status, exit, alias', 'info');
        logToTerminal('Alias usage: alias add [name] [command] | alias list', 'info');
        break;
      case 'clear':
        setLogs([]);
        break;
      case 'scan':
        logToTerminal('Initiating system-wide vulnerability scan...', 'warn');
        setTimeout(() => logToTerminal('Scan complete. No threats found.', 'success'), 2000);
        break;
      case 'whoami':
        logToTerminal('User: Alen Pepa // Role: Security Researcher // Access: Root', 'success');
        break;
      case 'status':
        logToTerminal('System: CyberSuite OS v1.0.4 // Status: Secure // Neural Link: Online', 'info');
        break;
      case 'exit':
        setIsOpen(false);
        break;
      case 'python':
        logToTerminal('Initializing Python Neural Core...', 'info');
        window.dispatchEvent(new CustomEvent('navigate-tool', { detail: { toolId: 'python-lab' } }));
        break;
      case 'passwords':
        logToTerminal('Accessing Password Lab module...', 'info');
        // In a real app, we might trigger a navigation event here
        window.dispatchEvent(new CustomEvent('navigate-tool', { detail: { toolId: 'passwords' } }));
        break;
      case 'alias':
        if (args[0] === 'add' && args[1] && args[2]) {
          const aliasName = args[1].toLowerCase();
          const targetCmd = args.slice(2).join(' ');
          setAliases(prev => ({ ...prev, [aliasName]: targetCmd }));
          logToTerminal(`Alias added: ${aliasName} -> ${targetCmd}`, 'success');
        } else if (args[0] === 'list') {
          logToTerminal('Current Aliases:', 'info');
          Object.entries(aliases).forEach(([name, target]) => {
            logToTerminal(`${name} -> ${target}`, 'info');
          });
        } else {
          logToTerminal("Usage: alias add [name] [command] | alias list", "warn");
        }
        break;
      default:
        logToTerminal(`Command not found: ${resolvedCommand}. Type 'help' for options.`, 'error');
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const allAvailable = [...COMMANDS, ...Object.keys(aliases)];
      const matches = allAvailable.filter(c => c.startsWith(input.toLowerCase()));
      if (matches.length === 1) {
        setInput(matches[0]);
      } else if (matches.length > 1) {
        logToTerminal(`Possible commands/aliases: ${matches.join(', ')}`, 'info');
      }
    }
  };

  useEffect(() => {
    const initialLogs: LogEntry[] = [
      { id: '1', timestamp: new Date().toLocaleTimeString(), level: 'info', message: 'CyberSuite OS Kernel v1.0.4 loaded.' },
      { id: '2', timestamp: new Date().toLocaleTimeString(), level: 'success', message: 'Encryption engine initialized.' },
      { id: '3', timestamp: new Date().toLocaleTimeString(), level: 'info', message: 'Establishing secure tunnel to 127.0.0.1...' },
    ];
    setLogs(initialLogs);

    // Listen for custom log events
    const handleLog = (e: any) => {
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        level: e.detail.level || 'info',
        message: e.detail.message,
      };
      setLogs(prev => [...prev.slice(-49), newLog]);
    };

    window.addEventListener('terminal-log', handleLog);
    return () => window.removeEventListener('terminal-log', handleLog);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ y: 300 }}
      animate={{ y: isMinimized ? 260 : 0 }}
      className={cn(
        "fixed bottom-8 right-8 w-[450px] bg-black/90 border border-cyber-border rounded-xl overflow-hidden z-50 shadow-2xl backdrop-blur-xl",
        isMinimized ? "h-10" : "h-72"
      )}
    >
      {/* Header */}
      <div className="h-10 bg-cyber-card border-b border-cyber-border flex items-center justify-between px-4 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-2">
          <TerminalIcon size={14} className="text-cyber-green" />
          <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">System Console</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="text-gray-500 hover:text-white">
            {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-gray-500 hover:text-red-400">
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="h-[calc(100%-40px)] flex flex-col">
          <div 
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto font-mono text-[10px] space-y-1 custom-scrollbar"
          >
            {logs.map((log) => (
              <div key={log.id} className="flex gap-2 group">
                <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
                <span className={cn(
                  "shrink-0 uppercase",
                  log.level === 'info' ? "text-blue-400" :
                  log.level === 'warn' ? "text-yellow-400" :
                  log.level === 'error' ? "text-red-400" :
                  "text-cyber-green"
                )}>
                  {log.level}:
                </span>
                <span className="text-gray-300 break-all">{log.message}</span>
              </div>
            ))}
          </div>
          
          <div className="p-2 bg-black/40 border-t border-cyber-border flex items-center gap-2">
            <ChevronRight size={12} className="text-cyber-green shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command..."
              className="flex-1 bg-transparent border-none outline-none font-mono text-[10px] text-cyber-green placeholder:text-gray-700"
              autoFocus
            />
            <div className="w-1.5 h-3 bg-cyber-green animate-pulse shrink-0" />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export function logToTerminal(message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info') {
  window.dispatchEvent(new CustomEvent('terminal-log', { detail: { message, level } }));
}
