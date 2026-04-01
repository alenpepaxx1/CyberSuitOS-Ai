/* COPYRIGHT ALEN PEPA */
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Shield, Server, Laptop, Router, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  type: 'server' | 'laptop' | 'router' | 'firewall';
  status: 'secure' | 'vulnerable' | 'compromised';
  label: string;
  ip?: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}

export default function NetworkTopology() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNetworkData = async () => {
    try {
      const res = await fetch('/api/network');
      const data = await res.json();
      setNodes(data.nodes);
      setLinks(data.links);
      setIsLoading(false);
    } catch (e) {
      console.error("Failed to fetch network data:", e);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkData();
    const interval = setInterval(fetchNetworkData, 10000); // 10s refresh
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const width = 800;
    const height = 500;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.selectAll('*').remove();

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .attr('stroke', '#333')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 2);

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => setSelectedNode(d));

    // Node circles
    node.append('circle')
      .attr('r', 20)
      .attr('fill', d => {
        if (d.status === 'secure') return '#10b981';
        if (d.status === 'vulnerable') return '#f59e0b';
        return '#ef4444';
      })
      .attr('stroke', '#000')
      .attr('stroke-width', 2);

    // Node icons (simplified as text for D3)
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-family', 'lucide-react')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .text(d => {
        if (d.type === 'server') return 'S';
        if (d.type === 'firewall') return 'F';
        if (d.type === 'router') return 'R';
        return 'L';
      });

    // Node labels
    node.append('text')
      .attr('dx', 25)
      .attr('dy', '.35em')
      .text(d => d.label)
      .attr('fill', '#888')
      .attr('font-size', '10px');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
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

    return () => {
      simulation.stop();
    };
  }, [nodes]);

  return (
    <div className="flex flex-col h-full cyber-card rounded-lg overflow-hidden">
      <div className="corner-accent corner-tl" />
      <div className="corner-accent corner-tr" />
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/40">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-500" />
          <h2 className="text-sm font-mono uppercase tracking-wider text-white">Network Topology Map</h2>
        </div>
        <div className="flex gap-4 text-[10px] font-mono">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-500/70">SECURE</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-amber-500/70">VULNERABLE</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-red-500/70">COMPROMISED</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]/80 z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-cyber-green border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-mono text-cyber-green animate-pulse">SCANNING NETWORK...</span>
            </div>
          </div>
        ) : null}
        <svg ref={svgRef} className="w-full h-full" />
        
        {selectedNode && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 w-64 bg-[#151619] border border-[#333] rounded-lg p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono text-white uppercase">{selectedNode.label}</h3>
              <button onClick={() => setSelectedNode(null)} className="text-[#555] hover:text-white">×</button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-[#555]">TYPE:</span>
                <span className="text-white uppercase">{selectedNode.type}</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-[#555]">STATUS:</span>
                <span className={
                  selectedNode.status === 'secure' ? 'text-emerald-500' :
                  selectedNode.status === 'vulnerable' ? 'text-amber-500' : 'text-red-500'
                }>
                  {selectedNode.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-[#555]">IP ADDR:</span>
                <span className="text-white">{selectedNode.ip || 'N/A'}</span>
              </div>
              
              <div className="pt-3 border-t border-[#333]">
                <p className="text-[9px] text-[#888] leading-relaxed">
                  {selectedNode.status === 'secure' ? 
                    'System is operating within normal parameters. No active threats detected.' :
                    selectedNode.status === 'vulnerable' ?
                    'Potential entry point detected. Outdated software versions found. Immediate patching recommended.' :
                    'ACTIVE BREACH DETECTED. Unauthorized access in progress. System isolation required.'
                  }
                </p>
              </div>
              
              <button className="w-full py-2 bg-[#222] hover:bg-[#333] text-white text-[10px] font-mono rounded border border-[#444] transition-colors">
                ISOLATE NODE
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
