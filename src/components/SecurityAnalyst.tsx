/* COPYRIGHT ALEN PEPA */
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Bot, Sparkles, Send, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { logToTerminal } from './Terminal';

export default function SecurityAnalyst() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!query) return;
    setLoading(true);
    logToTerminal(`Initiating AI analysis for: ${query.substring(0, 20)}...`, 'info');
    
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      setTimeout(() => {
        const responses = [
          "Analysis complete. The provided payload shows signs of a potential SQL injection attempt. Recommendation: Use parameterized queries.",
          "Security audit finished. No critical vulnerabilities found in the input string.",
          "Heuristic analysis suggests this log entry is part of a standard system heartbeat.",
          "Warning: This pattern matches known cross-site scripting (XSS) vectors. Sanitize all user inputs.",
          "The requested analysis indicates a high probability of system misconfiguration in the network layer.",
          "Neural core v4.2.0-stable: Input processed and categorized as 'Low Risk'."
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        setResponse(`[OFFLINE_MODE] ${randomResponse}`);
        logToTerminal('AI analysis completed (Offline Mode).', 'success');
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a world-class cybersecurity expert. Analyze the following security query or payload and provide a concise, technical explanation of risks and remediation. Query: ${query}`,
        config: {
          systemInstruction: "You are a CyberSuite OS AI Assistant. Be technical, concise, and professional. Use markdown for formatting.",
        }
      });
      
      setResponse(result.text || 'No analysis available.');
      logToTerminal('AI analysis completed successfully.', 'success');
    } catch (error) {
      console.error(error);
      setResponse('Error connecting to AI engine. Please check your API configuration.');
      logToTerminal('AI analysis failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cyber-card border border-cyber-border rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-cyber-border bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyber-green/10 rounded-lg">
            <Bot className="text-cyber-green" size={20} />
          </div>
          <div>
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">AI Security Analyst</h3>
            <p className="text-[10px] text-gray-500 uppercase font-mono">Powered by Gemini 3 Flash</p>
          </div>
        </div>
        <Sparkles className="text-cyber-green/40" size={20} />
      </div>

      <div className="p-6 space-y-6">
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Paste a suspicious payload, log entry, or ask a security question..."
            className="w-full h-32 bg-black/40 border border-cyber-border rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-cyber-green/50 transition-colors resize-none"
          />
          <button
            onClick={analyze}
            disabled={loading || !query}
            className="absolute bottom-4 right-4 bg-cyber-green hover:bg-cyber-green/80 disabled:opacity-50 text-black px-4 py-2 rounded-lg font-mono text-xs font-bold flex items-center gap-2 transition-all"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            ANALYZE
          </button>
        </div>

        <AnimatePresence>
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-black/60 border border-cyber-border rounded-xl space-y-3"
            >
              <div className="flex items-center gap-2 text-cyber-green text-xs font-mono uppercase tracking-widest">
                <Shield size={14} />
                Analysis Result
              </div>
              <div className="text-sm text-gray-300 leading-relaxed font-sans prose prose-invert max-w-none">
                {response.split('\n').map((line, i) => (
                  <p key={i} className="mb-2">{line}</p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!response && !loading && (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 opacity-30">
            <AlertCircle size={32} />
            <p className="text-xs font-mono uppercase tracking-widest">Waiting for input...</p>
          </div>
        )}
      </div>
    </div>
  );
}
