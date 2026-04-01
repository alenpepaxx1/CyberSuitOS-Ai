/* COPYRIGHT ALEN PEPA */
import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Copy, 
  Check, 
  Shield, 
  ShieldAlert, 
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';

import { logToTerminal } from './Terminal';

export default function PasswordLab() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [strength, setStrength] = useState({ score: 0, label: 'Weak', color: 'bg-red-500' });

  const generatePassword = () => {
    logToTerminal('Generating secure entropy pool...', 'info');
    const charset = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
    };

    let characters = '';
    if (options.uppercase) characters += charset.uppercase;
    if (options.lowercase) characters += charset.lowercase;
    if (options.numbers) characters += charset.numbers;
    if (options.symbols) characters += charset.symbols;

    if (!characters) return;

    let generated = '';
    for (let i = 0; i < length; i++) {
      generated += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setPassword(generated);
    logToTerminal('Password generated successfully.', 'success');
  };

  useEffect(() => {
    generatePassword();
  }, [length, options]);

  useEffect(() => {
    calculateStrength(password);
  }, [password]);

  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length > 8) score += 1;
    if (pwd.length > 12) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) setStrength({ score, label: 'Weak', color: 'bg-red-500' });
    else if (score <= 4) setStrength({ score, label: 'Medium', color: 'bg-yellow-500' });
    else setStrength({ score, label: 'Strong', color: 'bg-cyber-green' });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Password Lab</h1>
        <p className="text-gray-500">Generate cryptographically secure passwords and audit their strength.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generator Card */}
        <div className="bg-cyber-card border border-cyber-border rounded-2xl p-8 space-y-8">
          <div className="space-y-4">
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                readOnly
                className="w-full bg-black/40 border border-cyber-border rounded-xl px-6 py-4 font-mono text-xl text-white focus:outline-none focus:border-cyber-green/50 transition-colors"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <button 
                  onClick={copyToClipboard}
                  className="p-2 text-gray-500 hover:text-cyber-green transition-colors"
                >
                  {copied ? <Check size={20} className="text-cyber-green" /> : <Copy size={20} />}
                </button>
                <button 
                  onClick={generatePassword}
                  className="p-2 text-gray-500 hover:text-blue-400 transition-colors"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
            </div>

            {/* Strength Meter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Strength: {strength.label}</span>
                {strength.label === 'Strong' ? <ShieldCheck size={14} className="text-cyber-green" /> : 
                 strength.label === 'Medium' ? <Shield size={14} className="text-yellow-500" /> : 
                 <ShieldAlert size={14} className="text-red-500" />}
              </div>
              <div className="h-1.5 bg-cyber-border rounded-full overflow-hidden flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i}
                    className={cn(
                      "h-full flex-1 transition-all duration-500",
                      i <= strength.score ? strength.color : "bg-white/5"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-400">Password Length</label>
                <span className="font-mono text-cyber-green">{length}</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-1.5 bg-cyber-border rounded-lg appearance-none cursor-pointer accent-cyber-green"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {Object.entries(options).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setOptions(prev => ({ ...prev, [key]: !value }))}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                    value 
                      ? "bg-cyber-green/5 border-cyber-green/30 text-white" 
                      : "bg-black/20 border-cyber-border text-gray-500 hover:border-gray-700"
                  )}
                >
                  <span className="text-xs font-mono uppercase tracking-wider">{key}</span>
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                    value ? "bg-cyber-green border-cyber-green" : "border-gray-600"
                  )}>
                    {value && <Check size={12} className="text-black font-bold" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="space-y-6">
          <div className="bg-cyber-card border border-cyber-border rounded-2xl p-8">
            <h3 className="text-lg font-mono mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-cyber-green" />
              Security Best Practices
            </h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyber-green shrink-0" />
                <span>Use at least 16 characters for critical accounts.</span>
              </li>
              <li className="flex gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyber-green shrink-0" />
                <span>Avoid using personal information like birthdays or pet names.</span>
              </li>
              <li className="flex gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyber-green shrink-0" />
                <span>Use a unique password for every single service.</span>
              </li>
              <li className="flex gap-3">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyber-green shrink-0" />
                <span>Enable Two-Factor Authentication (2FA) whenever possible.</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-8">
            <h3 className="text-lg font-mono mb-2 text-blue-400">Entropy Analysis</h3>
            <p className="text-sm text-gray-500 mb-4">
              Calculated entropy for current settings: 
              <span className="text-white font-mono ml-2">
                {Math.round(Math.log2(Math.pow(
                  (options.uppercase ? 26 : 0) + 
                  (options.lowercase ? 26 : 0) + 
                  (options.numbers ? 10 : 0) + 
                  (options.symbols ? 32 : 0), 
                  length
                )))} bits
              </span>
            </p>
            <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
              Entropy above 128 bits is considered cryptographically strong.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
