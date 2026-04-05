import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

interface ScanVisualizationProps {
  results: any;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6'];

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
      <div className="bg-cyber-card border border-cyber-border p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-white mb-4">Vulnerability Distribution</h3>
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
            >
              {severityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333' }} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-cyber-card border border-cyber-border p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-white mb-4">Risk Score Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={[{ name: 'Scan 1', score: 80 }, { name: 'Scan 2', score: 65 }, { name: 'Scan 3', score: results.riskScore }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #333' }} />
            <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
