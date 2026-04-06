import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

interface ScanVisualizationProps {
  results: any;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#00FF41'];

export const ScanVisualization: React.FC<ScanVisualizationProps> = ({ results }) => {
  if (!results || !results.vulnerabilities) return null;

  const severityData = [
    { name: 'Critical', value: results.vulnerabilities.filter((v: any) => v.severity === 'critical').length },
    { name: 'High', value: results.vulnerabilities.filter((v: any) => v.severity === 'high').length },
    { name: 'Medium', value: results.vulnerabilities.filter((v: any) => v.severity === 'medium').length },
    { name: 'Low', value: results.vulnerabilities.filter((v: any) => v.severity === 'low').length },
  ].filter(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-black/60 border border-[#00FF41]/30 p-6 rounded-2xl shadow-[inset_0_0_20px_rgba(0,255,65,0.05)]">
        <h3 className="text-sm font-mono font-bold text-[#00FF41] uppercase tracking-widest mb-4 drop-shadow-[0_0_2px_currentColor]">Vulnerability Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={severityData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="#00FF41"
              strokeWidth={1}
            >
              {severityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                border: '1px solid rgba(0, 255, 65, 0.3)',
                color: '#00FF41',
                fontFamily: 'monospace',
                boxShadow: '0 0 10px rgba(0, 255, 65, 0.1)'
              }} 
              itemStyle={{ color: '#00FF41' }}
            />
            <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '10px', color: '#00FF41' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-black/60 border border-[#00FF41]/30 p-6 rounded-2xl shadow-[inset_0_0_20px_rgba(0,255,65,0.05)]">
        <h3 className="text-sm font-mono font-bold text-[#00FF41] uppercase tracking-widest mb-4 drop-shadow-[0_0_2px_currentColor]">Risk Score Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={[{ name: 'Scan 1', score: 80 }, { name: 'Scan 2', score: 65 }, { name: 'Scan 3', score: results.riskScore }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 255, 65, 0.1)" />
            <XAxis dataKey="name" stroke="rgba(0, 255, 65, 0.5)" tick={{ fill: 'rgba(0, 255, 65, 0.5)', fontSize: 10, fontFamily: 'monospace' }} />
            <YAxis stroke="rgba(0, 255, 65, 0.5)" tick={{ fill: 'rgba(0, 255, 65, 0.5)', fontSize: 10, fontFamily: 'monospace' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                border: '1px solid rgba(0, 255, 65, 0.3)',
                color: '#00FF41',
                fontFamily: 'monospace',
                boxShadow: '0 0 10px rgba(0, 255, 65, 0.1)'
              }} 
              itemStyle={{ color: '#00FF41' }}
            />
            <Line type="monotone" dataKey="score" stroke="#00FF41" strokeWidth={2} dot={{ fill: '#00FF41', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#00FF41', stroke: '#00FF41', strokeWidth: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
