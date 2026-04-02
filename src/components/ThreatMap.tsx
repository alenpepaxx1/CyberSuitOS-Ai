/* COPYRIGHT ALEN PEPA */
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, ShieldCheck, Zap, Search, Globe, X, Terminal as TerminalIcon, Activity } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface MapItem {
  id: string;
  long: number;
  lat: number;
  type: 'attack' | 'node';
  country: string;
  city: string;
  ip: string;
  threatLevel?: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'compromised' | 'secure';
  lastSeen: string;
  attackType?: string;
  targetedPorts?: number[];
  reputation?: number;
}

interface ThreatMapProps {
  onAction?: (toolId: string, target?: string) => void;
  initialNodes?: MapItem[];
}

export default function ThreatMap({ onAction, initialNodes }: ThreatMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);
  const [nodes, setNodes] = useState<MapItem[]>([]);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 300;
    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Clear previous
    svg.selectAll('*').remove();

    // Projection
    const projection = d3.geoMercator()
      .scale(120)
      .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    // Draw world map (simplified)
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then((data: any) => {
      const countries = topojson.feature(data, data.objects.countries) as any;

      svg.append('g')
        .selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('d', path as any)
        .attr('fill', '#0a0a0a')
        .attr('stroke', '#222')
        .attr('stroke-width', 0.5)
        .attr('class', 'country-path');

      // Use initialNodes if provided, otherwise generate random ones
      let generatedNodes: MapItem[] = [];
      
      if (initialNodes && initialNodes.length > 0) {
        generatedNodes = initialNodes.map((node, i) => ({
          ...node,
          id: node.id || `node-${i}`,
          status: node.status || 'active',
          lastSeen: node.lastSeen || 'Just now',
          reputation: node.reputation ?? Math.floor(Math.random() * 100)
        }));
      } else {
        const locations = [
          { long: -74.006, lat: 40.7128, city: 'New York', country: 'USA' },
          { long: 0.1278, lat: 51.5074, city: 'London', country: 'UK' },
          { long: 139.6503, lat: 35.6762, city: 'Tokyo', country: 'Japan' },
          { long: 37.6173, lat: 55.7558, city: 'Moscow', country: 'Russia' },
          { long: 116.4074, lat: 39.9042, city: 'Beijing', country: 'China' },
          { long: 151.2093, lat: -33.8688, city: 'Sydney', country: 'Australia' },
          { long: -43.1729, lat: -22.9068, city: 'Rio de Janeiro', country: 'Brazil' },
          { long: 18.4241, lat: -33.9249, city: 'Cape Town', country: 'South Africa' },
          { long: 77.209, lat: 28.6139, city: 'New Delhi', country: 'India' },
          { long: 103.8198, lat: 1.3521, city: 'Singapore', country: 'Singapore' },
          { long: -122.4194, lat: 37.7749, city: 'San Francisco', country: 'USA' },
          { long: 2.3522, lat: 48.8566, city: 'Paris', country: 'France' },
          { long: 12.4964, lat: 41.9028, city: 'Rome', country: 'Italy' },
          { long: -70.6483, lat: -33.4489, city: 'Santiago', country: 'Chile' },
          { long: 55.2708, lat: 25.2048, city: 'Dubai', country: 'UAE' },
        ];

        generatedNodes = locations.map((loc, i) => {
          const type = Math.random() > 0.7 ? 'attack' : 'node';
          return {
            id: `node-${i}`,
            ...loc,
            type,
            ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
            threatLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
            status: Math.random() > 0.8 ? 'compromised' : Math.random() > 0.5 ? 'active' : 'secure',
            lastSeen: 'Just now',
            attackType: type === 'attack' ? ['DDoS', 'SQL Injection', 'Brute Force', 'Malware C2'][Math.floor(Math.random() * 4)] : undefined,
            targetedPorts: type === 'attack' ? [80, 443, 22, 3389].sort(() => Math.random() - 0.5).slice(0, 2) : undefined,
            reputation: Math.floor(Math.random() * 100)
          };
        });
      }

      setNodes(generatedNodes);

      const nodeGroup = svg.append('g').attr('class', 'nodes');

      nodeGroup.selectAll('circle')
        .data(generatedNodes)
        .enter()
        .append('circle')
        .attr('cx', d => projection([d.long, d.lat])![0])
        .attr('cy', d => projection([d.long, d.lat])![1])
        .attr('r', d => d.type === 'attack' ? 4 : 3)
        .attr('fill', d => d.type === 'attack' ? '#ef4444' : '#00ff41')
        .attr('class', 'map-node')
        .style('cursor', 'pointer')
        .style('filter', d => d.type === 'attack' ? 'drop-shadow(0 0 4px #ef4444)' : 'drop-shadow(0 0 4px #00ff41)')
        .on('click', (event, d) => {
          event.stopPropagation();
          setSelectedItem(d);
        })
        .on('mouseover', function() {
          d3.select(this).transition().duration(200).attr('r', 6);
        })
        .on('mouseout', function(event, d) {
          d3.select(this).transition().duration(200).attr('r', d.type === 'attack' ? 4 : 3);
        })
        .each(function(d) {
          if (d.type === 'attack') {
            d3.select(this)
              .append('animate')
              .attr('attributeName', 'r')
              .attr('values', '4;7;4')
              .attr('dur', '1.5s')
              .attr('repeatCount', 'indefinite');
            
            d3.select(this)
              .append('animate')
              .attr('attributeName', 'opacity')
              .attr('values', '0.8;0.3;0.8')
              .attr('dur', '1.5s')
              .attr('repeatCount', 'indefinite');
          }
        });

      // Add "attack lines"
      const attacks = Array.from({ length: 6 }, () => ({
        from: generatedNodes[Math.floor(Math.random() * generatedNodes.length)],
        to: generatedNodes[Math.floor(Math.random() * generatedNodes.length)]
      })).filter(a => a.from.id !== a.to.id);

      const attackGroup = svg.append('g').attr('class', 'attacks');

      attackGroup.selectAll('path')
        .data(attacks)
        .enter()
        .append('path')
        .attr('d', d => {
          const start = projection([d.from.long, d.from.lat])!;
          const end = projection([d.to.long, d.to.lat])!;
          const dx = end[0] - start[0];
          const dy = end[1] - start[1];
          const dr = Math.sqrt(dx * dx + dy * dy);
          return `M${start[0]},${start[1]}A${dr},${dr} 0 0,1 ${end[0]},${end[1]}`;
        })
        .attr('fill', 'none')
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 0.8)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.5)
        .style('cursor', 'pointer')
        .on('click', (event, d) => {
          event.stopPropagation();
          setSelectedItem({
            id: `attack-${Math.random()}`,
            long: (d.from.long + d.to.long) / 2,
            lat: (d.from.lat + d.to.lat) / 2,
            type: 'attack',
            country: d.to.country,
            city: d.to.city,
            ip: d.from.ip,
            threatLevel: 'critical',
            status: 'compromised',
            lastSeen: 'Active',
            attackType: ['DDoS Flood', 'Exfiltration', 'Zero-day Exploit'][Math.floor(Math.random() * 3)],
            targetedPorts: [443, 8080],
            reputation: 0
          });
        })
        .on('mouseover', function() {
          d3.select(this).transition().duration(200).attr('stroke-width', 2).attr('opacity', 1);
        })
        .on('mouseout', function() {
          d3.select(this).transition().duration(200).attr('stroke-width', 0.8).attr('opacity', 0.5);
        })
        .append('animate')
        .attr('attributeName', 'stroke-dashoffset')
        .attr('from', '40')
        .attr('to', '0')
        .attr('dur', '2s')
        .attr('repeatCount', 'indefinite');
    });

  }, [initialNodes]);

  return (
    <div className="w-full h-full relative group">
      <div className="w-full h-full flex items-center justify-center p-4">
        <svg ref={svgRef} className="w-full h-full" />
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-6 left-6 right-6 md:left-auto md:w-80 bg-cyber-card/95 backdrop-blur-xl border border-cyber-border rounded-2xl shadow-2xl overflow-hidden z-30"
          >
            <div className="p-4 border-b border-cyber-border flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-2">
                {selectedItem.type === 'attack' ? (
                  <ShieldAlert className="text-red-500" size={16} />
                ) : (
                  <Activity className="text-cyber-green" size={16} />
                )}
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-white">
                  {selectedItem.type === 'attack' ? 'Threat Detected' : 'Node Intelligence'}
                </span>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-bold text-white leading-tight">{selectedItem.city}</h4>
                    <p className="text-[10px] font-mono text-gray-500 uppercase">{selectedItem.country}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-mono uppercase border",
                      selectedItem.threatLevel === 'critical' ? "bg-red-500/20 text-red-500 border-red-500/30" :
                      selectedItem.threatLevel === 'high' ? "bg-orange-500/20 text-orange-500 border-orange-500/30" :
                      "bg-cyber-green/20 text-cyber-green border-cyber-green/30"
                    )}>
                      {selectedItem.threatLevel} risk
                    </span>
                    {selectedItem.reputation !== undefined && (
                      <span className="text-[8px] font-mono text-gray-600 uppercase">Reputation: {selectedItem.reputation}/100</span>
                    )}
                  </div>
                </div>

                {selectedItem.type === 'attack' && (
                  <div className="p-2 bg-red-500/5 border border-red-500/10 rounded-lg">
                    <div className="text-[9px] font-mono text-red-400 uppercase mb-1">Attack Intelligence</div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">{selectedItem.attackType}</span>
                      <span className="text-[10px] font-mono text-gray-500">Ports: {selectedItem.targetedPorts?.join(', ')}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-cyber-border/50">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-gray-600 uppercase">IP Address</span>
                    <div className="text-xs font-mono text-gray-300">{selectedItem.ip}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-gray-600 uppercase">Status</span>
                    <div className={cn(
                      "text-xs font-mono uppercase",
                      selectedItem.status === 'compromised' ? "text-red-500" : "text-cyber-green"
                    )}>
                      {selectedItem.status}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => onAction?.('scanner', selectedItem.ip)}
                  className="flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-[10px] font-mono font-bold text-red-500 transition-all uppercase"
                >
                  <Search size={12} /> Scan Target
                </button>
                <button 
                  onClick={() => onAction?.('network', selectedItem.ip)}
                  className="flex items-center justify-center gap-2 py-2 bg-cyber-green/10 hover:bg-cyber-green/20 border border-cyber-green/20 rounded-lg text-[10px] font-mono font-bold text-cyber-green transition-all uppercase"
                >
                  <Globe size={12} /> OSINT Trace
                </button>
                <button 
                  onClick={() => onAction?.('topology', selectedItem.ip)}
                  className="flex items-center justify-center gap-2 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-[10px] font-mono font-bold text-blue-500 transition-all uppercase"
                >
                  <Activity size={12} /> Map Topology
                </button>
                <button 
                  onClick={() => onAction?.('payloads', selectedItem.ip)}
                  className="flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-mono font-bold text-gray-400 hover:text-white transition-all uppercase"
                >
                  <TerminalIcon size={12} /> Deploy Payload
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
