/* COPYRIGHT ALEN PEPA */
import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";
import dns from "dns";
import https from "https";
import http from "http";
import net from "net";

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
      { id: 'internet', type: 'cloud', status: 'secure', label: 'Global Network', ip: '8.8.8.8' },
      { id: 'gateway', type: 'firewall', status: 'secure', label: 'Main Firewall', ip: '172.17.0.1' },
      { id: 'host', type: 'server', status: 'secure', label: os.hostname(), ip: '127.0.0.1' },
      { id: 'db-01', type: 'database', status: 'secure', label: 'Core DB Cluster', ip: '10.0.0.5' },
      { id: 'nas-01', type: 'server', status: 'vulnerable', label: 'Storage NAS', ip: '10.0.0.10' }
    ];
    const links: any[] = [
      { source: 'internet', target: 'gateway' },
      { source: 'gateway', target: 'host' },
      { source: 'host', target: 'db-01' },
      { source: 'host', target: 'nas-01' }
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

    // Add some "discovered" neighbors and IoT devices
    const neighbors = ['172.17.0.2', '172.17.0.3', '172.17.0.4'];
    neighbors.forEach((ip, i) => {
      const id = `neighbor-${i}`;
      nodes.push({
        id,
        type: 'laptop',
        status: Math.random() > 0.8 ? 'compromised' : 'secure',
        label: `Workstation ${ip}`,
        ip
      });
      links.push({ source: 'gateway', target: id });
    });

    const iotDevices = ['Smart Camera', 'IoT Sensor Hub', 'VoIP Phone'];
    iotDevices.forEach((label, i) => {
      const id = `iot-${i}`;
      nodes.push({
        id,
        type: 'iot',
        status: i === 0 ? 'vulnerable' : 'secure',
        label,
        ip: `192.168.1.${100 + i}`
      });
      links.push({ source: 'gateway', target: id });
    });

    res.json({ nodes, links });
  });

  // Advanced Vulnerability Scanner API
  app.get("/api/scan", async (req, res) => {
    const target = req.query.target as string;
    if (!target) {
      return res.status(400).json({ error: "Target is required" });
    }

    const results: any = {
      target,
      timestamp: new Date().toISOString(),
      dns: {},
      headers: {},
      ssl: null,
      whois: { status: "Simulated for privacy/performance" },
      ports: [],
      subdomains: [],
      tech: []
    };

    try {
      // 1. DNS Lookup / IP Detection
      const hostname = target.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
      const isIP = net.isIP(hostname);
      
      if (isIP) {
        results.dns.a = [hostname];
        results.ip = hostname;
      } else {
        try {
          const addresses = await new Promise<string[]>((resolve, reject) => {
            dns.resolve4(hostname, (err, addrs) => err ? reject(err) : resolve(addrs));
          });
          results.dns.a = addresses;
          results.ip = addresses[0];
          
          try {
            const mx = await new Promise<any[]>((resolve, reject) => {
              dns.resolveMx(hostname, (err, addrs) => err ? reject(err) : resolve(addrs));
            });
            results.dns.mx = mx;
          } catch (e) {}

          try {
            const txt = await new Promise<string[][]>((resolve, reject) => {
              dns.resolveTxt(hostname, (err, addrs) => err ? reject(err) : resolve(addrs));
            });
            results.dns.txt = txt;
          } catch (e) {}

          // Subdomain Simulation
          const commonSubdomains = ['www', 'mail', 'dev', 'api', 'staging', 'blog', 'vpn', 'ns1', 'ns2', 'mx'];
          results.subdomains = commonSubdomains.map(sub => `${sub}.${hostname}`).slice(0, 4 + Math.floor(Math.random() * 6));
          
        } catch (e) {
          results.dns.error = "DNS resolution failed";
        }
      }

      // 2. Port Scanning (Basic)
      const portsToScan = [80, 443, 22, 21, 25, 53, 3306, 8080, 8443, 27017, 5432];
      
      const scanPort = (port: number) => {
        return new Promise((resolve) => {
          const socket = new net.Socket();
          socket.setTimeout(1500); // Slightly longer timeout for local/slow networks
          socket.on('connect', () => {
            results.ports.push({ port, status: 'open' });
            socket.destroy();
            resolve(null);
          });
          socket.on('timeout', () => {
            socket.destroy();
            resolve(null);
          });
          socket.on('error', () => {
            socket.destroy();
            resolve(null);
          });
          socket.connect(port, hostname);
        });
      };

      await Promise.all(portsToScan.map(scanPort));

      // 3. HTTP Headers & SSL
      const protocol = target.startsWith('https') ? https : http;
      const url = target.startsWith('http') ? target : `http://${target}`;
      
      await new Promise((resolve) => {
        const req = protocol.get(url, (response) => {
          results.headers = response.headers;
          results.statusCode = response.statusCode;
          
          // Technology Detection Simulation based on headers
          const server = response.headers['server'] || '';
          const xPoweredBy = response.headers['x-powered-by'] || '';
          results.tech = [];
          if (server.includes('Apache')) results.tech.push('Apache HTTP Server');
          if (server.includes('nginx')) results.tech.push('Nginx');
          if (server.includes('Cloudflare')) results.tech.push('Cloudflare CDN');
          if (xPoweredBy.includes('PHP')) results.tech.push('PHP');
          if (xPoweredBy.includes('Express')) results.tech.push('Express.js');
          if (response.headers['x-nextjs-cache']) results.tech.push('Next.js');

          if (response.socket && (response.socket as any).getPeerCertificate) {
            const cert = (response.socket as any).getPeerCertificate();
            if (cert && Object.keys(cert).length > 0) {
              results.ssl = {
                subject: cert.subject,
                issuer: cert.issuer,
                valid_from: cert.valid_from,
                valid_to: cert.valid_to,
                fingerprint: cert.fingerprint,
                serialNumber: cert.serialNumber
              };
            }
          }
          resolve(null);
        });
        
        req.on('error', (e) => {
          results.error = e.message;
          resolve(null);
        });
        
        req.setTimeout(5000, () => {
          req.destroy();
          resolve(null);
        });
      });

      // 3. WHOIS Simulation (More detailed)
      results.whois = {
        registrar: "Example Registrar, Inc.",
        creationDate: "2010-05-15T10:00:00Z",
        expirationDate: "2027-05-15T10:00:00Z",
        updatedDate: "2023-05-15T10:00:00Z",
        status: ["clientTransferProhibited", "serverDeleteProhibited"],
        nameServers: [`ns1.${hostname}`, `ns2.${hostname}`],
        registrant: {
          organization: "Privacy Protection Service",
          country: "US",
          city: "San Francisco",
          state: "CA"
        }
      };

    } catch (error) {
      results.error = "Scan failed";
    }

    res.json(results);
  });

  // CVE Proxy to avoid CORS issues on localhost
  app.get("/api/cve/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const response = await new Promise((resolve, reject) => {
        const request = https.get(`https://cve.circl.lu/api/cve/${id}`, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => resolve(JSON.parse(data)));
        });
        request.on('error', reject);
      });
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch CVE data" });
    }
  });

  // CVE Search Proxy
  app.get("/api/cve-search/:query", async (req, res) => {
    const { query } = req.params;
    try {
      const response = await new Promise((resolve, reject) => {
        const request = https.get(`https://cve.circl.lu/api/search/${query}`, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => resolve(JSON.parse(data)));
        });
        request.on('error', reject);
      });
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: "Failed to search CVE database" });
    }
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

  // Global scan history storage
let globalScanHistory: any[] = [
  { target: 'enterprise-node-01.io', score: 88, type: 'Full Scan', time: '2 mins ago', user: 'cyber_ghost' },
  { target: 'api.fintech-secure.net', score: 42, type: 'Web Scan', time: '15 mins ago', user: 'root_admin' },
  { target: '104.21.44.12', score: 15, type: 'Infra Scan', time: '45 mins ago', user: 'sec_ops' },
  { target: 'dev-portal.internal.cloud', score: 94, type: 'Deep Scan', time: '1 hour ago', user: 'shadow_walker' },
];

app.get('/api/global-history', (req, res) => {
  res.json(globalScanHistory);
});

app.post('/api/global-history', express.json(), (req, res) => {
  const { target, score, type, user } = req.body;
  const newItem = {
    target,
    score,
    type,
    user: user || 'anonymous',
    time: 'Just now'
  };
  globalScanHistory = [newItem, ...globalScanHistory].slice(0, 20);
  res.json({ status: 'ok' });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
