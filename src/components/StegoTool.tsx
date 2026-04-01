/* COPYRIGHT ALEN PEPA */
import React, { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Lock, 
  Unlock, 
  Download, 
  Upload, 
  Eye,
  Shield,
  Zap,
  Check,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { logToTerminal } from './Terminal';
import CryptoJS from 'crypto-js';

type Channel = 'red' | 'green' | 'blue' | 'alpha';

export default function StegoTool() {
  const [image, setImage] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [channel, setChannel] = useState<Channel>('red');
  const [lsbPlane, setLsbPlane] = useState(0);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const channelMap: Record<Channel, number> = {
    red: 0,
    green: 1,
    blue: 2,
    alpha: 3
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        logToTerminal(`Image loaded: ${file.name} (${Math.round(file.size / 1024)} KB)`, 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const encodeMessage = () => {
    if (!image || !message) return;
    setLoading(true);
    logToTerminal(`Initiating steganography encoding (Channel: ${channel}, Plane: ${lsbPlane})...`, 'info');

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      let finalMessage = message;
      if (password) {
        logToTerminal('Encrypting message with password...', 'info');
        finalMessage = CryptoJS.AES.encrypt(message, password).toString();
      }

      // Add a delimiter to the message
      const fullMessage = finalMessage + '##END##';
      const binaryMessage = Array.from(fullMessage).map(char => 
        char.charCodeAt(0).toString(2).padStart(8, '0')
      ).join('');

      if (binaryMessage.length > data.length / 4) {
        logToTerminal('Error: Message too large for this image.', 'error');
        setLoading(false);
        return;
      }

      const channelOffset = channelMap[channel];
      for (let i = 0; i < binaryMessage.length; i++) {
        const pixelIdx = i * 4 + channelOffset;
        const bit = parseInt(binaryMessage[i]);
        data[pixelIdx] = (data[pixelIdx] & ~(1 << lsbPlane)) | (bit << lsbPlane);
      }

      ctx.putImageData(imageData, 0, 0);
      setProcessedImage(canvas.toDataURL());
      logToTerminal('Encoding complete. Message hidden in image pixels.', 'success');
      setLoading(false);
    };
    img.src = image;
  };

  const decodeMessage = () => {
    if (!image) return;
    setLoading(true);
    logToTerminal(`Scanning image for hidden patterns (Channel: ${channel}, Plane: ${lsbPlane})...`, 'info');

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const channelOffset = channelMap[channel];
      let binaryMessage = '';
      for (let i = 0; i < data.length / 4; i++) {
        const pixelIdx = i * 4 + channelOffset;
        binaryMessage += ((data[pixelIdx] >> lsbPlane) & 1).toString();
      }

      let decoded = '';
      for (let i = 0; i < binaryMessage.length; i += 8) {
        const charCode = parseInt(binaryMessage.substr(i, 8), 2);
        if (charCode === 0) break;
        decoded += String.fromCharCode(charCode);
        if (decoded.endsWith('##END##')) {
          decoded = decoded.replace('##END##', '');
          break;
        }
      }

      if (password && decoded) {
        try {
          logToTerminal('Decrypting message with password...', 'info');
          const bytes = CryptoJS.AES.decrypt(decoded, password);
          const decrypted = bytes.toString(CryptoJS.enc.Utf8);
          if (!decrypted) throw new Error('Invalid password');
          decoded = decrypted;
        } catch (e) {
          logToTerminal('Decryption failed: Invalid password or corrupted data.', 'error');
          decoded = '';
        }
      }

      setDecodedMessage(decoded);
      logToTerminal('Decoding complete.', 'success');
      setLoading(false);
    };
    img.src = image;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Steganography Lab</h1>
        <p className="text-gray-500">Hide secret messages within image pixels using LSB encoding.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-cyber-card border border-cyber-border rounded-2xl p-8 space-y-6">
          <div className="space-y-4">
            <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Source Image</label>
            <div 
              className={cn(
                "relative h-64 border-2 border-dashed border-cyber-border rounded-xl overflow-hidden flex flex-col items-center justify-center transition-colors",
                !image && "hover:border-cyber-green/30"
              )}
            >
              {image ? (
                <img src={image} alt="Source" className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-4 text-gray-500">
                  <ImageIcon size={48} className="opacity-20" />
                  <p className="text-sm">Drag and drop or click to upload</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Secret Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message to hide..."
              className="w-full h-24 bg-black/40 border border-cyber-border rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-cyber-green/50 transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <label className="text-xs font-mono text-gray-500 uppercase tracking-widest block">Channel</label>
              <select 
                value={channel}
                onChange={(e) => setChannel(e.target.value as Channel)}
                className="w-full bg-black/40 border border-cyber-border rounded-xl px-4 py-2 font-mono text-sm text-white focus:outline-none focus:border-cyber-green/50"
              >
                <option value="red">Red</option>
                <option value="green">Green</option>
                <option value="blue">Blue</option>
                <option value="alpha">Alpha</option>
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-mono text-gray-500 uppercase tracking-widest block">LSB Plane</label>
              <select 
                value={lsbPlane}
                onChange={(e) => setLsbPlane(parseInt(e.target.value))}
                className="w-full bg-black/40 border border-cyber-border rounded-xl px-4 py-2 font-mono text-sm text-white focus:outline-none focus:border-cyber-green/50"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7].map(plane => (
                  <option key={plane} value={plane}>Bit {plane}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-mono text-gray-500 uppercase tracking-widest">Protection Password (Optional)</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password for encryption..."
                className="w-full bg-black/40 border border-cyber-border rounded-xl pl-10 pr-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-cyber-green/50 transition-colors"
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={encodeMessage}
              disabled={!image || !message || loading}
              className="flex-1 bg-cyber-green hover:bg-cyber-green/80 disabled:opacity-50 text-black font-mono font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Lock size={18} />
              ENCODE MESSAGE
            </button>
            <button
              onClick={decodeMessage}
              disabled={!image || loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-mono font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Unlock size={18} />
              DECODE MESSAGE
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {processedImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-cyber-card border border-cyber-border rounded-2xl p-8 space-y-4"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-mono text-cyber-green uppercase tracking-widest">Encoded Result</h3>
                <a 
                  href={processedImage} 
                  download="secret_image.png"
                  className="text-xs text-cyber-green hover:underline flex items-center gap-1"
                >
                  <Download size={14} /> Download
                </a>
              </div>
              <div className="h-48 bg-black/20 rounded-xl overflow-hidden">
                <img src={processedImage} alt="Processed" className="w-full h-full object-contain" />
              </div>
              <p className="text-[10px] text-gray-500 font-mono italic">
                The message is now hidden in the least significant bits of the image data. Visually, the image remains unchanged.
              </p>
            </motion.div>
          )}

          {decodedMessage !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-cyber-card border border-cyber-border rounded-2xl p-8 space-y-4"
            >
              <h3 className="text-sm font-mono text-blue-400 uppercase tracking-widest">Decoded Message</h3>
              <div className="bg-black/40 border border-cyber-border rounded-xl p-4 font-mono text-white min-h-[60px]">
                {decodedMessage || <span className="text-red-400/50 italic">No hidden message found.</span>}
              </div>
            </motion.div>
          )}

          <div className="bg-cyber-card border border-cyber-border rounded-2xl p-8">
            <h3 className="text-sm font-mono text-gray-400 uppercase tracking-widest mb-4">How it works</h3>
            <div className="space-y-4 text-xs text-gray-500 leading-relaxed">
              <p>
                LSB (Least Significant Bit) steganography works by replacing the last bit of each pixel's color value with a bit from your secret message.
              </p>
              <p>
                Since changing the last bit only alters the color by 1/255th, the difference is imperceptible to the human eye, but can be perfectly reconstructed by this tool.
              </p>
            </div>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
