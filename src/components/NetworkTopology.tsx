/* COPYRIGHT ALEN PEPA */
import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Shield, Server, Laptop, Router, AlertTriangle, 
  Info, Activity, Zap, Globe, Database, Cpu, 
  Lock, Unlock, Radio, Wifi, Search, RefreshCw,
  Maximize2, Minimize2, ZoomIn, ZoomOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  type: 'server' | 'laptop' | 'router' | 'firewall' | 'database' | 'cloud' | 'iot';
  status: 'secure' | 'vulnerable' | 'compromised';
  label: string;
  ip?: string;
  os?: string;
  uptime?: string;
  traffic?: number;
  threatLevel?: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  value?: number;
  active?: boolean;
}

export default function NetworkTopology() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [stats, setStats] = useState({
    totalNodes: 0,
    compromised: 0,
    vulnerable: 0,
    traffic: '0 KB/s'
  });

  const fetchNetworkData = async () => {
    try {
      const res = await fetch('/api/network');
      const data = await res.json();
      
      // Enhance data with more properties for "advance" look
      const enhancedNodes = data.nodes.map((n: any) => ({
        ...n,
        os: n.type === 'server' ? 'Linux Kernel 5.15' : 'Windows 11 Pro',
        uptime: '14d 06h 22m',
        traffic: Math.floor(Math.random() * 100),
        threatLevel: n.status === 'compromised' ? 95 : n.status === 'vulnerable' ? 45 : 5
      }));

      setNodes(enhancedNodes);
      setLinks(data.links);
      
      setStats({
        totalNodes: enhancedNodes.length,
        compromised: enhancedNodes.filter((n: any) => n.status === 'compromised').length,
        vulnerable: enhancedNodes.filter((n: any) => n.status === 'vulnerable').length,
        traffic: `${(Math.random() * 500 + 100).toFixed(1)} KB/s`
      });

      setIsLoading(false);
    } catch (e) {
      console.error("Failed to fetch network data:", e);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkData();
    const interval = setInterval(fetchNetworkData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      fetchNetworkData();
    }, 3000);
  };

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    // Define gradients and filters
    const defs = svg.append('defs');

    // Glow filter
    const filter = defs.append('filter')
      .attr('id', 'glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'blur');
    filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-800))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#222')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', d => (d.source as Node).status === 'compromised' || (d.target as Node).status === 'compromised' ? '4,4' : 'none');

    // Packet Animation (Particles)
    const packets = g.append('g');
    
    const animatePackets = () => {
      packets.selectAll('circle').remove();
      
      links.forEach((l, i) => {
        const source = l.source as Node;
        const target = l.target as Node;
        
        if (Math.random() > 0.3) {
          const packet = packets.append('circle')
            .attr('r', 2)
            .attr('fill', source.status === 'compromised' ? '#ef4444' : '#06b6d4')
            .attr('filter', 'url(#glow)');

          const duration = 2000 + Math.random() * 3000;
          
          const repeat = () => {
            packet
              .attr('cx', source.x!)
              .attr('cy', source.y!)
              .transition()
              .duration(duration)
              .ease(d3.easeLinear)
              .attr('cx', target.x!)
              .attr('cy', target.y!)
              .on('end', repeat);
          };
          
          repeat();
        }
      });
    };

    animatePackets();

    // Nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
      });

    // Node outer ring (pulse for compromised)
    node.filter(d => d.status === 'compromised')
      .append('circle')
      .attr('r', 25)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 2)
      .append('animate')
      .attr('attributeName', 'r')
      .attr('from', '25')
      .attr('to', '40')
      .attr('dur', '1.5s')
      .attr('begin', '0s')
      .attr('repeatCount', 'indefinite');

    node.filter(d => d.status === 'compromised')
      .select('circle')
      .append('animate')
      .attr('attributeName', 'opacity')
      .attr('from', '1')
      .attr('to', '0')
      .attr('dur', '1.5s')
      .attr('begin', '0s')
      .attr('repeatCount', 'indefinite');

    // Node background
    node.append('circle')
      .attr('r', 22)
      .attr('fill', '#0a0a0a')
      .attr('stroke', d => {
        if (d.status === 'secure') return '#10b981';
        if (d.status === 'vulnerable') return '#f59e0b';
        return '#ef4444';
      })
      .attr('stroke-width', 2)
      .attr('filter', 'url(#glow)');

    // Node Icons (using simple shapes to represent icons)
    node.each(function(d) {
      const g = d3.select(this);
      if (d.type === 'server') {
        g.append('rect').attr('x', -8).attr('y', -10).attr('width', 16).attr('height', 20).attr('fill', 'none').attr('stroke', '#fff').attr('stroke-width', 1);
        g.append('line').attr('x1', -4).attr('y1', -4).attr('x2', 4).attr('y2', -4).attr('stroke', '#fff').attr('stroke-width', 1);
        g.append('line').attr('x1', -4).attr('y1', 2).attr('x2', 4).attr('y2', 2).attr('stroke', '#fff').attr('stroke-width', 1);
      } else if (d.type === 'router' || d.type === 'firewall') {
        g.append('circle').attr('r', 10).attr('fill', 'none').attr('stroke', '#fff').attr('stroke-width', 1);
        g.append('line').attr('x1', -6).attr('y1', 0).attr('x2', 6).attr('y2', 0).attr('stroke', '#fff').attr('stroke-width', 1);
        g.append('line').attr('x1', 0).attr('y1', -6).attr('x2', 0).attr('y2', 6).attr('stroke', '#fff').attr('stroke-width', 1);
      } else if (d.type === 'cloud') {
        g.append('path').attr('d', 'M-10,2 Q-12,-8 -2,-8 Q0,-12 8,-8 Q12,-8 10,2 Z').attr('fill', 'none').attr('stroke', '#fff').attr('stroke-width', 1);
      } else if (d.type === 'database') {
        g.append('ellipse').attr('cx', 0).attr('cy', -6).attr('rx', 8).attr('ry', 4).attr('fill', 'none').attr('stroke', '#fff').attr('stroke-width', 1);
        g.append('path').attr('d', 'M-8,-6 L-8,6 Q0,10 8,6 L8,-6').attr('fill', 'none').attr('stroke', '#fff').attr('stroke-width', 1);
      } else if (d.type === 'iot') {
        g.append('circle').attr('r', 6).attr('fill', 'none').attr('stroke', '#fff').attr('stroke-width', 1);
        g.append('circle').attr('r', 10).attr('fill', 'none').attr('stroke', '#fff').attr('stroke-width', 0.5).attr('stroke-dasharray', '2,2');
      } else {
        g.append('rect').attr('x', -10).attr('y', -6).attr('width', 20).attr('height', 12).attr('fill', 'none').attr('stroke', '#fff').attr('stroke-width', 1);
        g.append('line').attr('x1', -12).attr('y1', 8).attr('x2', 12).attr('y2', 8).attr('stroke', '#fff').attr('stroke-width', 1);
      }
    });

    // Node labels
    node.append('text')
      .attr('dy', 35)
      .attr('text-anchor', 'middle')
      .text(d => d.label)
      .attr('fill', '#888')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

    // IP labels (only if zoomed in)
    node.append('text')
      .attr('dy', 45)
      .attr('text-anchor', 'middle')
      .text(d => d.ip || '')
      .attr('fill', '#444')
      .attr('font-size', '8px')
      .attr('font-family', 'monospace')
      .attr('opacity', zoomLevel > 1.2 ? 1 : 0);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
        
      packets.selectAll('circle').each(function() {
        // Packets follow the simulation tick by being re-animated or updated
        // For performance, we just let the transition handle it, but we need to update source/target refs
      });
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Handle resize
    const handleResize = () => {
      const newWidth = containerRef.current?.clientWidth || 800;
      const newHeight = containerRef.current?.clientHeight || 600;
      svg.attr('width', newWidth).attr('height', newHeight);
      simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2)).alpha(0.3).restart();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      simulation.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, [nodes, zoomLevel]);

  return (
    <div className="flex flex-col h-full cyber-card rounded-lg overflow-hidden bg-black/20 backdrop-blur-sm border border-white/5 relative">
      <div className="corner-accent corner-tl" />
      <div className="corner-accent corner-tr" />
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/40 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <Globe className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-white">Network Topology</h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-[10px] font-mono text-cyan-500/60 uppercase">Real-time Monitoring Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-mono text-gray-500 uppercase">Traffic</span>
              <span className="text-xs font-mono text-cyan-400">{stats.traffic}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-mono text-gray-500 uppercase">Nodes</span>
              <span className="text-xs font-mono text-white">{stats.totalNodes}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-mono text-red-500 uppercase">Breaches</span>
              <span className="text-xs font-mono text-red-500">{stats.compromised}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleScan}
              disabled={isScanning}
              className={cn(
                "p-2 rounded-lg border transition-all flex items-center gap-2",
                isScanning 
                  ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400" 
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              <Search size={14} className={isScanning ? "animate-spin" : ""} />
              <span className="text-[10px] font-mono uppercase hidden sm:inline">Deep Scan</span>
            </button>
            <button 
              onClick={fetchNetworkData}
              className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Visualization Area */}
      <div ref={containerRef} className="flex-1 relative overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/5 via-transparent to-transparent">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-cyan-500/20 rounded-full" />
                <div className="absolute inset-0 w-16 h-16 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <Globe className="absolute inset-0 m-auto w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-mono text-cyan-400 tracking-[0.2em] uppercase">Initializing Neural Map</span>
                <span className="text-[10px] font-mono text-cyan-500/40 mt-1">Mapping network interfaces...</span>
              </div>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2, opacity: [0, 0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 m-auto w-96 h-96 rounded-full border-2 border-cyan-500/30"
            />
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full backdrop-blur-md">
              <span className="text-[10px] font-mono text-cyan-400 animate-pulse uppercase tracking-widest">Active Scan in Progress</span>
            </div>
          </div>
        )}

        <svg 
          ref={svgRef} 
          className="w-full h-full"
          onClick={() => setSelectedNode(null)}
        />

        {/* Zoom Controls */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-10">
          <button className="p-2 bg-black/60 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-black/80 transition-all shadow-xl">
            <ZoomIn size={16} />
          </button>
          <button className="p-2 bg-black/60 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-black/80 transition-all shadow-xl">
            <ZoomOut size={16} />
          </button>
          <button className="p-2 bg-black/60 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-black/80 transition-all shadow-xl mt-2">
            <Maximize2 size={16} />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 right-6 p-4 bg-black/60 border border-white/10 rounded-xl backdrop-blur-md z-10 shadow-xl">
          <h4 className="text-[10px] font-mono text-gray-500 uppercase mb-3 tracking-widest">Node Status</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-mono text-gray-300 uppercase">Secure</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <span className="text-[10px] font-mono text-gray-300 uppercase">Vulnerable</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" />
              <span className="text-[10px] font-mono text-gray-300 uppercase">Compromised</span>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="absolute top-6 right-6 w-80 bg-black/80 border border-white/10 rounded-2xl backdrop-blur-2xl z-30 shadow-2xl overflow-hidden"
            >
              {/* Panel Header */}
              <div className={cn(
                "p-4 flex items-center justify-between border-b",
                selectedNode.status === 'secure' ? "bg-emerald-500/10 border-emerald-500/20" :
                selectedNode.status === 'vulnerable' ? "bg-amber-500/10 border-amber-500/20" :
                "bg-red-500/10 border-red-500/20"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    selectedNode.status === 'secure' ? "bg-emerald-500/20 text-emerald-400" :
                    selectedNode.status === 'vulnerable' ? "bg-amber-500/20 text-amber-400" :
                    "bg-red-500/20 text-red-400"
                  )}>
                    {selectedNode.type === 'server' ? <Server size={18} /> :
                     selectedNode.type === 'router' ? <Router size={18} /> :
                     selectedNode.type === 'firewall' ? <Shield size={18} /> :
                     <Laptop size={18} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-mono font-bold text-white uppercase tracking-tight">{selectedNode.label}</h3>
                    <span className="text-[10px] font-mono text-gray-500">{selectedNode.ip}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="p-1 text-gray-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Panel Content */}
              <div className="p-5 space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity size={12} className="text-cyan-400" />
                      <span className="text-[9px] font-mono text-gray-500 uppercase">Traffic</span>
                    </div>
                    <span className="text-sm font-mono text-white">{selectedNode.traffic}%</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield size={12} className={cn(
                        selectedNode.threatLevel! > 70 ? "text-red-500" : "text-emerald-500"
                      )} />
                      <span className="text-[9px] font-mono text-gray-500 uppercase">Threat</span>
                    </div>
                    <span className="text-sm font-mono text-white">{selectedNode.threatLevel}%</span>
                  </div>
                </div>

                {/* System Info */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-gray-500 uppercase">Operating System</span>
                    <span className="text-white">{selectedNode.os}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-gray-500 uppercase">System Uptime</span>
                    <span className="text-white">{selectedNode.uptime}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-gray-500 uppercase">Status</span>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase",
                      selectedNode.status === 'secure' ? "bg-emerald-500/20 text-emerald-400" :
                      selectedNode.status === 'vulnerable' ? "bg-amber-500/20 text-amber-400" :
                      "bg-red-500/20 text-red-400"
                    )}>
                      {selectedNode.status}
                    </span>
                  </div>
                </div>

                {/* Analysis Box */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <Info size={14} className="text-cyan-400" />
                    <span className="text-[10px] font-mono text-white uppercase tracking-widest">Core Analysis</span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed font-sans">
                    {selectedNode.status === 'secure' ? 
                      'Node integrity verified. All cryptographic signatures match. Traffic patterns are consistent with baseline behavior.' :
                      selectedNode.status === 'vulnerable' ?
                      'Potential entry point detected. Outdated software versions found. Immediate patching recommended to prevent lateral movement.' :
                      'ACTIVE BREACH DETECTED. Unauthorized access in progress. System isolation required to prevent data exfiltration.'
                    }
                  </p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-mono text-white transition-all group">
                    <Lock size={12} className="text-gray-500 group-hover:text-white" />
                    ISOLATE
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-[10px] font-mono text-cyan-400 transition-all">
                    <Zap size={12} />
                    DIAGNOSE
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
