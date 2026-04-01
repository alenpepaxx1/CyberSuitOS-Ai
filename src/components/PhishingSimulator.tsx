/* COPYRIGHT ALEN PEPA */
import React, { useState } from 'react';
import { 
  Mail, ShieldAlert, Send, Copy, RefreshCw, 
  Eye, Terminal, Sparkles, AlertTriangle, CheckCircle2,
  Lock
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';

interface PhishingCampaign {
  id: string;
  target: string;
  subject: string;
  content: string;
  type: 'credential-harvesting' | 'malware-delivery' | 'business-email-compromise';
  difficulty: 'low' | 'medium' | 'high';
}

export default function PhishingSimulator() {
  const [target, setTarget] = useState('');
  const [type, setType] = useState<PhishingCampaign['type']>('credential-harvesting');
  const [difficulty, setDifficulty] = useState<PhishingCampaign['difficulty']>('medium');
  const [campaign, setCampaign] = useState<PhishingCampaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const generateCampaign = async () => {
    if (!target) return;
    setIsLoading(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'undefined' || apiKey === '') {
        setTimeout(() => {
          const fallbackCampaigns: Record<string, any> = {
            'credential-harvesting': {
              subject: "Urgent: Security Alert for Your Account",
              content: `
                <div style="font-family: sans-serif; padding: 20px;">
                  <h2 style="color: #d32f2f;">Security Alert</h2>
                  <p>Dear User,</p>
                  <p>We detected an unusual login attempt on your account from a new location: <b>Moscow, RU</b>.</p>
                  <p>If this was not you, please click the button below to secure your account and reset your password immediately.</p>
                  <a href="#" style="background-color: #1976d2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Secure Account Now</a>
                  <p>Thank you,<br>IT Security Team</p>
                </div>
              `
            },
            'malware-delivery': {
              subject: "Invoice #INV-2026-04-01 for Recent Services",
              content: `
                <div style="font-family: sans-serif; padding: 20px;">
                  <p>Hello,</p>
                  <p>Please find attached the invoice for the services rendered in March 2026.</p>
                  <p>Payment is due within 5 business days. You can view the details by opening the attached document: <b>Invoice_INV_2026_04.zip</b></p>
                  <p>Best regards,<br>Accounts Payable</p>
                </div>
              `
            },
            'business-email-compromise': {
              subject: "Quick Request - Are you at your desk?",
              content: `
                <div style="font-family: sans-serif; padding: 20px;">
                  <p>Hi,</p>
                  <p>Are you at your desk? I'm in a meeting and need a quick favor. I need you to process an urgent wire transfer to a new vendor. I'll send the details in a moment.</p>
                  <p>Please let me know as soon as you see this.</p>
                  <p>Thanks,<br>CEO</p>
                </div>
              `
            }
          };

          const data = fallbackCampaigns[type] || fallbackCampaigns['credential-harvesting'];
          setCampaign({
            id: Math.random().toString(36).substr(2, 9),
            target,
            type,
            difficulty,
            subject: data.subject,
            content: data.content
          });
          setIsLoading(false);
        }, 1500);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a realistic phishing email campaign for a security training simulation.
        Target Organization/Context: ${target}
        Campaign Type: ${type}
        Difficulty Level: ${difficulty}
        
        Return a JSON object with 'subject' and 'content' (HTML formatted). 
        The content should include subtle red flags for training purposes.`,
        config: { responseMimeType: "application/json" }
      });
      
      const data = JSON.parse(response.text || '{}');
      setCampaign({
        id: Math.random().toString(36).substr(2, 9),
        target,
        type,
        difficulty,
        subject: data.subject || 'Urgent: Action Required',
        content: data.content || '<p>Default phishing content</p>'
      });
    } catch (error) {
      console.error("Failed to generate campaign:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-[#222] bg-[#111] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Mail className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-sm font-mono uppercase tracking-widest text-white">Phishing Simulation Lab</h2>
            <p className="text-[10px] font-mono text-[#555] uppercase tracking-tighter">AI-Driven Social Engineering Training</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCampaign(null)}
            className="p-2 hover:bg-[#222] rounded-lg text-[#555] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Configuration Sidebar */}
        <div className="w-80 border-r border-[#222] p-6 space-y-6 bg-[#0d0d0d]">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-[#555] uppercase tracking-widest">Target Context</label>
            <input 
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. Corporate IT, HR Dept"
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-[#555] uppercase tracking-widest">Campaign Type</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'credential-harvesting', label: 'Cred Harvest', icon: 'lock' },
                { id: 'malware-delivery', label: 'Malware Drop', icon: 'shield' },
                { id: 'business-email-compromise', label: 'BEC Attack', icon: 'mail' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id as any)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all ${
                    type === t.id 
                      ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
                      : 'bg-[#151619] border-[#222] text-[#555] hover:border-[#333]'
                  }`}
                >
                  {t.icon === 'lock' && <Lock className="w-4 h-4" />}
                  {t.icon === 'shield' && <ShieldAlert className="w-4 h-4" />}
                  {t.icon === 'mail' && <Mail className="w-4 h-4" />}
                  <span className="text-[11px] font-mono uppercase">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-[#555] uppercase tracking-widest">Difficulty Level</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d as any)}
                  className={`flex-1 py-1.5 rounded-lg border text-[10px] font-mono uppercase transition-all ${
                    difficulty === d 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-[#151515] border-[#222] text-[#555]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateCampaign}
            disabled={isLoading || !target}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-mono text-[11px] uppercase tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isLoading ? 'GENERATING...' : 'GENERATE CAMPAIGN'}
          </button>

          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-blue-400">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-[9px] font-mono uppercase">Ethical Notice</span>
            </div>
            <p className="text-[9px] text-[#555] leading-relaxed">
              This tool is for authorized security training and awareness purposes only. 
              Unauthorized use for malicious activities is strictly prohibited.
            </p>
          </div>
        </div>

        {/* Campaign Preview */}
        <div className="flex-1 bg-black p-8 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {campaign ? (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Campaign Generated Successfully</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#111] border border-[#222] rounded-lg text-[10px] font-mono text-white hover:bg-[#222] transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      {showPreview ? 'VIEW SOURCE' : 'PREVIEW EMAIL'}
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-[#111] border border-[#222] rounded-lg text-[10px] font-mono text-white hover:bg-[#222] transition-colors">
                      <Copy className="w-3 h-3" />
                      COPY DATA
                    </button>
                  </div>
                </div>

                <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-[#222] space-y-2">
                    <div className="flex gap-4 text-[11px]">
                      <span className="text-[#555] font-mono w-16">SUBJECT:</span>
                      <span className="text-white font-bold">{campaign.subject}</span>
                    </div>
                    <div className="flex gap-4 text-[11px]">
                      <span className="text-[#555] font-mono w-16">FROM:</span>
                      <span className="text-blue-400">security-alert@internal-${target.toLowerCase().replace(/\s+/g, '-')}.com</span>
                    </div>
                  </div>
                  
                  <div className="p-8 min-h-[400px] bg-white text-black font-sans">
                    {showPreview ? (
                      <div dangerouslySetInnerHTML={{ __html: campaign.content }} />
                    ) : (
                      <pre className="text-[11px] font-mono whitespace-pre-wrap text-gray-800">
                        {campaign.content}
                      </pre>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#111] border border-[#222] rounded-xl">
                    <h4 className="text-[10px] font-mono text-[#555] uppercase mb-2">Red Flags Included</h4>
                    <ul className="text-[10px] text-[#888] space-y-1 list-disc pl-4">
                      <li>Urgent/Threatening language</li>
                      <li>Slightly mismatched sender domain</li>
                      <li>Generic greeting</li>
                      <li>Suspicious call to action</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-[#111] border border-[#222] rounded-xl">
                    <h4 className="text-[10px] font-mono text-[#555] uppercase mb-2">Success Metrics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#555]">EST. CLICK RATE:</span>
                        <span className="text-amber-500">12.4%</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-[#555]">EST. REPORT RATE:</span>
                        <span className="text-emerald-500">4.2%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#222]">
                <Mail className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-[10px] uppercase tracking-[0.4em]">Configure and generate a phishing campaign</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
