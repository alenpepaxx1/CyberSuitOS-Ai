/* COPYRIGHT ALEN PEPA */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Trash2, ShieldAlert, Terminal as TerminalIcon, Volume2, VolumeX, PlayCircle, Sparkles, Download, Clock, Shield, Activity, Lock, Unlock } from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from '@/src/lib/utils';
import { logToTerminal } from './Terminal';
import { cyberAi, ChatMessage } from '@/src/services/cyberAiService';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  audioUrl?: string;
  isDecrypted?: boolean;
}

const PERSONAS = [
  { id: 'core', name: 'Alen (System Core)', icon: Bot, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', prompt: 'You are Alen, the CyberSuite System Core. You are highly analytical, precise, and focus on system optimization and general cybersecurity.' },
  { id: 'red', name: 'Red Team Specialist', icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', prompt: 'You are a Red Team Specialist. You think like an attacker, focusing on offensive security, penetration testing, and exploiting vulnerabilities. Be technical and edgy.' },
  { id: 'blue', name: 'Blue Team Analyst', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', prompt: 'You are a Blue Team Analyst. You focus on defensive security, incident response, threat hunting, and securing infrastructure. Be methodical and cautious.' },
];

const SUGGESTED_PROMPTS = [
  "Explain Zero Trust Architecture",
  "How to perform a secure Nmap scan?",
  "What are the top OWASP vulnerabilities?",
  "Explain the difference between Symmetric and Asymmetric encryption",
  "How to protect against Ransomware?",
  "What is a Zero-Day exploit?",
];

const AnonymousChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState(PERSONAS[0]);
  const [selfDestruct, setSelfDestruct] = useState(false);
  const [ping, setPing] = useState(12);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Ping simulation
    const interval = setInterval(() => {
      setPing(Math.floor(Math.random() * 15) + 8);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const welcomeText = `Secure channel established. I am **${activePersona.name}**. How can I assist you with your operations today?`;
    const welcomeMessage: Message = {
      id: 'welcome-' + Date.now(),
      role: 'model',
      text: welcomeText,
      timestamp: new Date(),
      isDecrypted: true,
    };
    setMessages([welcomeMessage]);
    
    if (isTTSEnabled) {
      speakText(welcomeText, welcomeMessage.id);
    }
  }, [activePersona]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Self-destruct timer
  useEffect(() => {
    if (!selfDestruct) return;
    const interval = setInterval(() => {
      setMessages(prev => {
        const now = new Date().getTime();
        // Delete messages older than 30 seconds
        const filtered = prev.filter(m => now - m.timestamp.getTime() < 30000);
        if (filtered.length < prev.length) {
          logToTerminal('Messages auto-destructed.', 'warn');
        }
        return filtered;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [selfDestruct]);

  const speakText = async (text: string, messageId: string) => {
    if (!isTTSEnabled) return;
    
    try {
      const base64Audio = await cyberAi.generateTTS(text);
      if (base64Audio) {
        const audioBlob = await fetch(`data:audio/wav;base64,${base64Audio}`).then(res => res.blob());
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          setIsPlaying(messageId);
          audioRef.current.onended = () => setIsPlaying(null);
        }
        
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, audioUrl } : m));
      } else {
        fallbackSpeak(text, messageId);
      }
    } catch (error) {
      console.error("TTS Error:", error);
      fallbackSpeak(text, messageId);
    }
  };

  const fallbackSpeak = (text: string, messageId: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = activePersona.id === 'red' ? 0.6 : activePersona.id === 'blue' ? 1.2 : 0.8;
    
    const voices = window.speechSynthesis.getVoices();
    const systemVoice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Microsoft David'));
    if (systemVoice) utterance.voice = systemVoice;

    utterance.onstart = () => setIsPlaying(messageId);
    utterance.onend = () => setIsPlaying(null);
    window.speechSynthesis.speak(utterance);
  };

  const replayAudio = (msg: Message) => {
    if (msg.audioUrl) {
      if (audioRef.current) {
        audioRef.current.src = msg.audioUrl;
        audioRef.current.play();
        setIsPlaying(msg.id);
        audioRef.current.onended = () => setIsPlaying(null);
      }
    } else {
      fallbackSpeak(msg.text, msg.id);
    }
  };

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date(),
      isDecrypted: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    logToTerminal(`User sent message to ${activePersona.name}...`, 'info');

    try {
      const chatHistory: ChatMessage[] = messages.map(m => ({
        role: m.role,
        text: m.text
      }));
      chatHistory.push({ role: 'user', text: textToSend });

      // Inject persona prompt
      const responseText = await cyberAi.sendMessage([
        { role: 'user', text: `SYSTEM INSTRUCTION: ${activePersona.prompt}\n\nRespond to the following:` },
        ...chatHistory
      ]);
      
      const systemMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date(),
        isDecrypted: false, // Start encrypted
      };

      setMessages(prev => [...prev, systemMessage]);
      logToTerminal(`${activePersona.name} responded.`, 'success');
      
      // Simulate decryption delay
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === systemMessage.id ? { ...m, isDecrypted: true } : m));
        speakText(responseText, systemMessage.id);
      }, 800);

    } catch (error) {
      console.error("Chat error:", error);
      logToTerminal(`System error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "CRITICAL ERROR: Connection to the neural core was interrupted. Please check your system logs.",
        timestamp: new Date(),
        isDecrypted: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    logToTerminal('Chat history cleared.', 'warn');
  };

  const exportChat = () => {
    if (messages.length === 0) return;
    let exportText = `# Secure Chat Log - ${activePersona.name}\n\nGenerated by CyberSuite OS\n\n---\n\n`;
    messages.forEach(msg => {
      exportText += `## ${msg.role === 'user' ? 'Operator' : activePersona.name} (${msg.timestamp.toLocaleString()})\n\n`;
      exportText += `${msg.text}\n\n---\n\n`;
    });
    const blob = new Blob([exportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `secure_chat_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logToTerminal('Exported secure chat log.', 'success');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-cyber-card/30 border border-cyber-border rounded-xl overflow-hidden backdrop-blur-sm relative">
      {/* Background Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,65,0.1),transparent_70%)]" />
        <motion.div 
          animate={{ y: [0, -1000], opacity: [0, 1, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,255,65,0.05),transparent)] h-[200%]"
        />
      </div>

      {/* Chat Header */}
      <div className="p-4 border-b border-cyber-border bg-cyber-card/80 flex flex-col md:flex-row items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className={cn("w-10 h-10 rounded-full border flex items-center justify-center transition-colors", activePersona.bg, activePersona.border)}>
            <activePersona.icon className={activePersona.color} size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-mono font-bold text-white uppercase">{activePersona.name}</h3>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/40 border border-cyber-border text-[9px] font-mono text-gray-400">
                <Activity size={10} className="text-cyber-green" />
                {ping}ms
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
              <span className="text-[10px] font-mono text-cyber-green uppercase tracking-wider">Encrypted Channel Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          {PERSONAS.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePersona(p)}
              className={cn(
                "px-3 py-1.5 rounded-lg border text-[10px] font-mono uppercase whitespace-nowrap transition-all",
                activePersona.id === p.id 
                  ? `${p.bg} ${p.border} ${p.color}` 
                  : "bg-black/40 border-cyber-border text-gray-500 hover:text-gray-300"
              )}
            >
              {p.name.split(' ')[0]}
            </button>
          ))}
          
          <div className="w-px h-6 bg-cyber-border mx-1" />
          
          <button 
            onClick={() => setSelfDestruct(!selfDestruct)}
            className={cn(
              "p-2 transition-colors rounded-lg flex items-center gap-1 text-[10px] font-mono uppercase",
              selfDestruct ? "text-orange-400 bg-orange-400/10 border border-orange-400/20" : "text-gray-500 hover:bg-white/10 border border-transparent"
            )}
            title="Toggle 30s Self-Destruct"
          >
            <Clock size={16} />
            <span className="hidden md:inline">{selfDestruct ? 'Auto-Del: ON' : 'Auto-Del: OFF'}</span>
          </button>
          <button 
            onClick={() => setIsTTSEnabled(!isTTSEnabled)}
            className={cn(
              "p-2 transition-colors rounded-lg",
              isTTSEnabled ? "text-cyan-400 hover:bg-cyan-400/10" : "text-gray-500 hover:bg-white/10"
            )}
            title={isTTSEnabled ? "Disable Voice" : "Enable Voice"}
          >
            {isTTSEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button 
            onClick={exportChat}
            className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            title="Export Chat"
          >
            <Download size={16} />
          </button>
          <button 
            onClick={clearChat}
            className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
            title="Clear History"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar z-10">
        <audio ref={audioRef} className="hidden" />
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
            <activePersona.icon size={48} className={activePersona.color} />
            <div className="max-w-xs">
              <p className={cn("text-sm font-mono uppercase tracking-widest mb-2", activePersona.color)}>Secure Channel Established</p>
              <p className="text-xs">You are now connected to {activePersona.name}. All communications are encrypted and anonymous.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl px-4">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className={cn(
                    "p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono text-gray-400 transition-all text-left flex items-center gap-2 group",
                    `hover:${activePersona.color} hover:${activePersona.border} hover:${activePersona.bg}`
                  )}
                >
                  <Sparkles size={12} className="opacity-50 group-hover:opacity-100" />
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border",
                msg.role === 'user' 
                  ? "bg-cyber-green/10 border-cyber-green/20 text-cyber-green" 
                  : `${activePersona.bg} ${activePersona.border} ${activePersona.color}`
              )}>
                {msg.role === 'user' ? <User size={16} /> : <activePersona.icon size={16} />}
              </div>
              
              <div className={cn("space-y-1", msg.role === 'user' ? "text-right" : "text-left")}>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed relative group/msg",
                  msg.role === 'user'
                    ? "bg-cyber-green/5 border border-cyber-green/20 text-white rounded-tr-none"
                    : "bg-black/60 border border-cyber-border text-gray-300 rounded-tl-none"
                )}>
                  {!msg.isDecrypted ? (
                    <div className="flex items-center gap-2 text-gray-500 font-mono text-xs">
                      <Lock size={14} className="animate-pulse" />
                      Decrypting payload...
                      <span className="font-mono text-[10px] opacity-50">
                        {Array.from({length: 20}).map(() => String.fromCharCode(33 + Math.random() * 94)).join('')}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="markdown-body prose prose-invert prose-xs max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-cyber-border">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                      
                      {msg.role === 'model' && (
                        <button 
                          onClick={() => replayAudio(msg)}
                          className={cn(
                            "absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all opacity-0 group-hover/msg:opacity-100",
                            isPlaying === msg.id ? `${activePersona.color} animate-pulse` : "text-gray-500 hover:text-white"
                          )}
                        >
                          <PlayCircle size={16} />
                        </button>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 px-1 justify-end">
                  {msg.role === 'user' && <Unlock size={10} className="text-cyber-green/50" />}
                  <span className="text-[10px] font-mono text-gray-600">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 mr-auto">
            <div className={cn("w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border", activePersona.bg, activePersona.border, activePersona.color)}>
              <activePersona.icon size={16} />
            </div>
            <div className="bg-black/60 border border-cyber-border p-4 rounded-2xl rounded-tl-none flex gap-1">
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.div 
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }} 
                  transition={{ repeat: Infinity, duration: 1, delay }} 
                  className={cn("w-1.5 h-1.5 rounded-full", activePersona.id === 'red' ? 'bg-red-400' : activePersona.id === 'blue' ? 'bg-blue-400' : 'bg-cyan-400')} 
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-cyber-card/80 border-t border-cyber-border z-10">
        <div className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Enter command for ${activePersona.name}...`}
            className={cn(
              "w-full bg-black/50 border border-cyber-border rounded-xl px-4 py-3 pr-12 text-sm font-mono focus:outline-none transition-colors placeholder:text-gray-600",
              activePersona.id === 'red' ? "focus:border-red-500/50" : activePersona.id === 'blue' ? "focus:border-blue-500/50" : "focus:border-cyan-500/50"
            )}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
              activePersona.color,
              activePersona.id === 'red' ? "hover:text-red-300" : activePersona.id === 'blue' ? "hover:text-blue-300" : "hover:text-cyan-300"
            )}
          >
            <Send size={20} />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-center gap-4 text-[9px] font-mono text-gray-600 uppercase tracking-widest">
          <span className="flex items-center gap-1"><Lock size={10} /> AES-256-GCM</span>
          <span className="flex items-center gap-1"><Shield size={10} /> Zero-Log Policy</span>
        </div>
      </div>
    </div>
  );
};

export default AnonymousChat;
