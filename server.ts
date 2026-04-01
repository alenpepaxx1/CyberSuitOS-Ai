/* COPYRIGHT ALEN PEPA */
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // SIEM Real-time Logs API
  app.get("/api/logs", (req, res) => {
    // Simulate real system logs based on actual system state
    const logs = [
      {
        id: Math.random().toString(36).substr(2, 9),
        time: new Date().toLocaleTimeString(),
        event: "System Resource Check",
        source: os.hostname(),
        status: "Normal",
        severity: "low",
        details: `CPU Load: ${os.loadavg()[0].toFixed(2)} | Free Memory: ${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)}GB`
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        time: new Date().toLocaleTimeString(),
        event: "Network Interface Status",
        source: "eth0",
        status: "Active",
        severity: "low",
        details: `Interface up. IP: ${Object.values(os.networkInterfaces()).flat().find(i => i?.family === 'IPv4' && !i.internal)?.address || '127.0.0.1'}`
      }
    ];

    // Add some random "security" events to keep it interesting
    if (Math.random() > 0.7) {
      logs.push({
        id: Math.random().toString(36).substr(2, 9),
        time: new Date().toLocaleTimeString(),
        event: "Kernel Process Monitor",
        source: "kernel",
        status: "Alert",
        severity: "medium",
        details: "Detected unusual syscall pattern in background process."
      });
    }

    res.json(logs);
  });

  // System Stats API
  app.get("/api/stats", (req, res) => {
    res.json({
      cpu: (os.loadavg()[0] * 10).toFixed(1),
      ram: ((1 - os.freemem() / os.totalmem()) * 100).toFixed(1),
      uptime: os.uptime(),
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      loadAvg: os.loadavg(),
      totalMem: os.totalmem(),
      freeMem: os.freemem(),
      cpus: os.cpus().length,
      type: os.type(),
      release: os.release(),
      networkInterfaces: os.networkInterfaces()
    });
  });

  // Network Topology API
  app.get("/api/network", (req, res) => {
    const interfaces = os.networkInterfaces();
    const nodes: any[] = [
      { id: 'gateway', type: 'router', status: 'secure', label: 'Default Gateway', ip: '172.17.0.1' },
      { id: 'host', type: 'server', status: 'secure', label: os.hostname(), ip: '127.0.0.1' }
    ];
    const links: any[] = [
      { source: 'gateway', target: 'host' }
    ];

    Object.entries(interfaces).forEach(([name, netInterface], index) => {
      if (!netInterface) return;
      const ipv4 = netInterface.find(i => i.family === 'IPv4');
      if (ipv4) {
        const id = `iface-${index}`;
        nodes.push({
          id,
          type: 'laptop',
          status: ipv4.internal ? 'secure' : 'vulnerable',
          label: `${name} (${ipv4.address})`,
          ip: ipv4.address
        });
        links.push({ source: 'host', target: id });
      }
    });

    // Add some "discovered" neighbors
    const neighbors = ['172.17.0.2', '172.17.0.3', '172.17.0.4'];
    neighbors.forEach((ip, i) => {
      const id = `neighbor-${i}`;
      nodes.push({
        id,
        type: 'laptop',
        status: Math.random() > 0.7 ? 'compromised' : 'secure',
        label: `Neighbor ${ip}`,
        ip
      });
      links.push({ source: 'gateway', target: id });
    });

    res.json({ nodes, links });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
