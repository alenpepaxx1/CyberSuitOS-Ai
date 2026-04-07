import { Dork } from '../components/DorkExplorer';

export const EXTENDED_DORKS: Dork[] = [
  // --- SENSITIVE DATA ---
  { id: 's1', title: 'Exposed .env Files', query: 'filetype:env "DB_PASSWORD"', category: 'sensitive', description: 'Finds exposed environment configuration files containing database credentials.', severity: 'critical' },
  { id: 's2', title: 'Exposed SQL Dumps', query: 'filetype:sql "dump" "password"', category: 'sensitive', description: 'Locates SQL database dumps containing sensitive information.', severity: 'critical' },
  { id: 's3', title: 'SSH Private Keys', query: 'intitle:"index of" "id_rsa" OR "id_rsa.pub"', category: 'sensitive', description: 'Finds exposed SSH private and public keys.', severity: 'critical' },
  { id: 's4', title: 'AWS Credentials', query: 'filetype:txt "AKIA" "aws_secret_access_key"', category: 'sensitive', description: 'Finds exposed AWS access keys and secrets.', severity: 'critical' },
  { id: 's5', title: 'PHP Info Pages', query: 'ext:php intitle:phpinfo "published by the PHP Group"', category: 'sensitive', description: 'Finds exposed phpinfo() pages revealing server details.', severity: 'medium' },
  { id: 's6', title: 'Docker Compose Configs', query: 'filetype:yaml "docker-compose" "MYSQL_ROOT_PASSWORD"', category: 'sensitive', description: 'Finds exposed docker-compose.yml files with passwords.', severity: 'critical' },
  { id: 's7', title: 'WordPress Config Files', query: 'filetype:txt "wp-config.php" "DB_PASSWORD"', category: 'sensitive', description: 'Finds exposed WordPress configuration files.', severity: 'critical' },
  { id: 's8', title: 'Firebase Configurations', query: 'filetype:json "firebase" "apiKey" "databaseURL"', category: 'sensitive', description: 'Finds exposed Firebase configuration files.', severity: 'high' },
  { id: 's9', title: 'Generic API Keys', query: '"api_key" OR "apikey" ext:txt OR ext:env OR ext:log', category: 'sensitive', description: 'Finds exposed API keys in various text files.', severity: 'critical' },
  { id: 's10', title: 'FTP Credentials', query: 'filetype:txt "ftp" "username" "password"', category: 'sensitive', description: 'Finds exposed FTP credentials in text files.', severity: 'critical' },
  { id: 's11', title: 'Exposed .git-credentials', query: 'filetype:txt ".git-credentials"', category: 'sensitive', description: 'Finds exposed Git credentials files.', severity: 'critical' },
  { id: 's12', title: 'Exposed .bash_history', query: 'filetype:history OR inurl:.bash_history', category: 'sensitive', description: 'Finds exposed bash history files which may contain passwords.', severity: 'high' },
  { id: 's13', title: 'Exposed .htpasswd', query: 'filetype:passwd OR inurl:.htpasswd', category: 'sensitive', description: 'Finds exposed Apache password files.', severity: 'critical' },
  { id: 's14', title: 'Exposed wp-config.php.bak', query: 'inurl:wp-config.php.bak', category: 'sensitive', description: 'Finds backup copies of WordPress config files.', severity: 'critical' },
  { id: 's15', title: 'Exposed Jenkins Credentials', query: 'filetype:xml "credentials.xml" "password"', category: 'sensitive', description: 'Finds exposed Jenkins credentials files.', severity: 'critical' },
  { id: 's16', title: 'Exposed Kubeconfig', query: 'filetype:yaml "kubeconfig" "clusters"', category: 'sensitive', description: 'Finds exposed Kubernetes configuration files.', severity: 'critical' },
  { id: 's17', title: 'Exposed Terraform State', query: 'filetype:tfstate "outputs"', category: 'sensitive', description: 'Finds exposed Terraform state files containing infrastructure details.', severity: 'high' },
  { id: 's18', title: 'Exposed Azure Service Principal', query: 'filetype:json "clientSecret" "tenantId" "subscriptionId"', category: 'sensitive', description: 'Finds exposed Azure Service Principal credentials.', severity: 'critical' },
  { id: 's19', title: 'Exposed GCP Service Account', query: 'filetype:json "private_key_id" "client_email"', category: 'sensitive', description: 'Finds exposed Google Cloud Service Account keys.', severity: 'critical' },
  { id: 's20', title: 'Exposed Stripe Secret Keys', query: 'filetype:env "sk_live_"', category: 'sensitive', description: 'Finds exposed live Stripe secret keys.', severity: 'critical' },

  // --- FILE DISCOVERY ---
  { id: 'f1', title: 'Public Log Files', query: 'filetype:log "error" "password"', category: 'files', description: 'Locates log files that might contain sensitive error details or credentials.', severity: 'medium' },
  { id: 'f2', title: 'Exposed Git Directories', query: 'intitle:"index of" ".git"', category: 'files', description: 'Finds servers where the .git directory is publicly accessible.', severity: 'high' },
  { id: 'f3', title: 'Open Directory Listings', query: 'intitle:"index of" "parent directory"', category: 'files', description: 'Finds servers with directory listing enabled.', severity: 'low' },
  { id: 'f4', title: 'Exposed SVN Directories', query: 'intitle:"index of" ".svn"', category: 'files', description: 'Finds servers where the .svn directory is publicly accessible.', severity: 'high' },
  { id: 'f5', title: 'Apache Access Logs', query: 'intitle:"index of" "access.log"', category: 'files', description: 'Finds exposed Apache access logs.', severity: 'medium' },
  { id: 'f6', title: 'MySQL Error Logs', query: 'filetype:log "mysql" "error"', category: 'files', description: 'Finds exposed MySQL error logs.', severity: 'medium' },
  { id: 'f7', title: 'Bash History Files', query: 'intitle:"index of" ".bash_history"', category: 'files', description: 'Finds exposed bash history files.', severity: 'high' },
  { id: 'f8', title: 'Excel with Passwords', query: 'filetype:xls OR filetype:xlsx "password" OR "confidential"', category: 'files', description: 'Finds exposed Excel documents containing sensitive information.', severity: 'high' },
  { id: 'f9', title: 'Confidential PDFs', query: 'filetype:pdf "confidential" OR "internal use only"', category: 'files', description: 'Finds exposed PDF documents containing sensitive information.', severity: 'medium' },
  { id: 'f10', title: 'Word Docs with Passwords', query: 'filetype:doc OR filetype:docx "password" OR "confidential"', category: 'files', description: 'Finds exposed Word documents containing sensitive information.', severity: 'high' },
  { id: 'f11', title: 'Exposed .vscode Settings', query: 'intitle:"index of" ".vscode"', category: 'files', description: 'Finds exposed VS Code settings which may contain extensions or paths.', severity: 'low' },
  { id: 'f12', title: 'Exposed .idea Directories', query: 'intitle:"index of" ".idea"', category: 'files', description: 'Finds exposed IntelliJ IDEA project directories.', severity: 'low' },
  { id: 'f13', title: 'Exposed .npmrc Files', query: 'filetype:npmrc "_auth"', category: 'files', description: 'Finds exposed NPM configuration files with auth tokens.', severity: 'critical' },
  { id: 'f14', title: 'Exposed .dockercfg Files', query: 'filetype:dockercfg "auth"', category: 'files', description: 'Finds exposed Docker registry credentials.', severity: 'critical' },
  { id: 'f15', title: 'Exposed .ssh Directories', query: 'intitle:"index of" ".ssh"', category: 'files', description: 'Finds exposed SSH directories.', severity: 'critical' },
  { id: 'f16', title: 'Exposed Backup .tar.gz', query: 'intitle:"index of" "backup.tar.gz"', category: 'files', description: 'Finds exposed backup archives.', severity: 'high' },
  { id: 'f17', title: 'Exposed Backup .zip', query: 'intitle:"index of" "backup.zip"', category: 'files', description: 'Finds exposed backup zip files.', severity: 'high' },
  { id: 'f18', title: 'Exposed .DS_Store Files', query: 'filetype:DS_Store', category: 'files', description: 'Finds exposed macOS metadata files which can reveal directory structures.', severity: 'low' },
  { id: 'f19', title: 'Exposed robots.txt', query: 'filetype:txt "robots.txt" "disallow"', category: 'files', description: 'Finds robots.txt files which can reveal hidden paths.', severity: 'low' },
  { id: 'f20', title: 'Exposed sitemap.xml', query: 'filetype:xml "sitemap.xml"', category: 'files', description: 'Finds sitemap files which list all public pages.', severity: 'low' },

  // --- LOGIN PAGES ---
  { id: 'l1', title: 'Admin Login Panels', query: 'intitle:"admin login" "username" "password"', category: 'login', description: 'Locates administrative login interfaces.', severity: 'low' },
  { id: 'l2', title: 'WordPress Login', query: 'intitle:"Log In" "WordPress" inurl:wp-login.php', category: 'login', description: 'Locates WordPress login interfaces.', severity: 'low' },
  { id: 'l3', title: 'Joomla Admin Login', query: 'intitle:"Joomla! Administration Login"', category: 'login', description: 'Locates Joomla administrative login interfaces.', severity: 'low' },
  { id: 'l4', title: 'Drupal Login', query: 'inurl:user/login intitle:"Log in" "Drupal"', category: 'login', description: 'Locates Drupal login interfaces.', severity: 'low' },
  { id: 'l5', title: 'Magento Admin Panel', query: 'intitle:"Magento Admin Panel" "Log in"', category: 'login', description: 'Locates Magento administrative login interfaces.', severity: 'low' },
  { id: 'l6', title: 'cPanel Login', query: 'intitle:"cPanel Login" "username" "password"', category: 'login', description: 'Locates cPanel login interfaces.', severity: 'low' },
  { id: 'l7', title: 'phpMyAdmin Login', query: 'intitle:"phpMyAdmin" "Welcome to phpMyAdmin"', category: 'login', description: 'Locates phpMyAdmin login interfaces.', severity: 'low' },
  { id: 'l8', title: 'Router Login Panels', query: 'intitle:"router" "login" "password"', category: 'login', description: 'Locates router login interfaces.', severity: 'low' },
  { id: 'l9', title: 'Webcam Login Panels', query: 'intitle:"webcam" "login" "password"', category: 'login', description: 'Locates webcam login interfaces.', severity: 'low' },
  { id: 'l10', title: 'Jenkins Dashboard', query: 'intitle:"Sign in [Jenkins]"', category: 'login', description: 'Locates Jenkins login interfaces.', severity: 'low' },
  { id: 'l11', title: 'Grafana Login', query: 'intitle:"Grafana" "Welcome to Grafana"', category: 'login', description: 'Locates Grafana dashboards.', severity: 'low' },
  { id: 'l12', title: 'Kibana Login', query: 'intitle:"Kibana" "Welcome to Kibana"', category: 'login', description: 'Locates Kibana dashboards.', severity: 'low' },
  { id: 'l13', title: 'Elasticsearch Status', query: 'intitle:"Elasticsearch" "status" "nodes"', category: 'login', description: 'Locates Elasticsearch status pages.', severity: 'medium' },
  { id: 'l14', title: 'RabbitMQ Management', query: 'intitle:"RabbitMQ Management"', category: 'login', description: 'Locates RabbitMQ management interfaces.', severity: 'low' },
  { id: 'l15', title: 'Redis Commander', query: 'intitle:"Redis Commander"', category: 'login', description: 'Locates Redis Commander interfaces.', severity: 'low' },
  { id: 'l16', title: 'MongoDB Express', query: 'intitle:"Mongo Express"', category: 'login', description: 'Locates Mongo Express interfaces.', severity: 'low' },
  { id: 'l17', title: 'Docker Registry UI', query: 'intitle:"Docker Registry UI"', category: 'login', description: 'Locates Docker Registry user interfaces.', severity: 'low' },
  { id: 'l18', title: 'Portainer Login', query: 'intitle:"Portainer" "Login"', category: 'login', description: 'Locates Portainer management interfaces.', severity: 'low' },
  { id: 'l19', title: 'Proxmox Login', query: 'intitle:"Proxmox Virtual Environment" "Login"', category: 'login', description: 'Locates Proxmox login interfaces.', severity: 'low' },
  { id: 'l20', title: 'ESXi Login', query: 'intitle:"VMware ESXi" "Login"', category: 'login', description: 'Locates VMware ESXi login interfaces.', severity: 'low' },

  // --- VULNERABILITIES ---
  { id: 'v1', title: 'RevSlider Vulnerability', query: 'inurl:/wp-content/plugins/revslider/', category: 'vuln', description: 'Identifies sites using potentially vulnerable versions of RevSlider.', severity: 'high' },
  { id: 'v2', title: 'SQL Syntax Errors', query: '"SQL syntax error" intext:"check the manual that corresponds"', category: 'vuln', description: 'Finds pages displaying SQL syntax errors, indicating potential SQL injection.', severity: 'high' },
  { id: 'v3', title: 'Potential XSS Points', query: 'inurl:"search.php?q="', category: 'vuln', description: 'Finds pages potentially vulnerable to Cross-Site Scripting (XSS).', severity: 'medium' },
  { id: 'v4', title: 'Potential LFI Points', query: 'inurl:"page=" OR inurl:"file="', category: 'vuln', description: 'Finds pages potentially vulnerable to Local File Inclusion (LFI).', severity: 'high' },
  { id: 'v5', title: 'Potential RFI Points', query: 'inurl:"include=" OR inurl:"require="', category: 'vuln', description: 'Finds pages potentially vulnerable to Remote File Inclusion (RFI).', severity: 'critical' },
  { id: 'v6', title: 'Open Redirect Points', query: 'inurl:"redirect=" OR inurl:"url="', category: 'vuln', description: 'Finds pages potentially vulnerable to Open Redirects.', severity: 'medium' },
  { id: 'v7', title: 'Directory Traversal Points', query: 'inurl:"../" OR inurl:"..%2f"', category: 'vuln', description: 'Finds pages potentially vulnerable to Directory Traversal.', severity: 'high' },
  { id: 'v8', title: 'Command Injection Points', query: 'inurl:"cmd=" OR inurl:"exec="', category: 'vuln', description: 'Finds pages potentially vulnerable to Command Injection.', severity: 'critical' },
  { id: 'v9', title: 'Potential SSRF Points', query: 'inurl:"url=" OR inurl:"uri="', category: 'vuln', description: 'Finds pages potentially vulnerable to Server-Side Request Forgery (SSRF).', severity: 'high' },
  { id: 'v10', title: 'Potential XXE Points', query: 'inurl:"xml=" OR inurl:"data="', category: 'vuln', description: 'Finds pages potentially vulnerable to XML External Entity (XXE).', severity: 'high' },
  { id: 'v11', title: 'Exposed Django Debug', query: '"DisallowedHost at /" "DEBUG = True"', category: 'vuln', description: 'Finds Django applications with debug mode enabled.', severity: 'high' },
  { id: 'v12', title: 'Exposed Rails Development', query: '"Routing Error" "Rails.root:"', category: 'vuln', description: 'Finds Ruby on Rails applications in development mode.', severity: 'medium' },
  { id: 'v13', title: 'Exposed Laravel Debug', query: '"APP_DEBUG=true" "Laravel"', category: 'vuln', description: 'Finds Laravel applications with debug mode enabled.', severity: 'high' },
  { id: 'v14', title: 'Exposed Symfony Profiler', query: 'inurl:"/_profiler/empty/search/results"', category: 'vuln', description: 'Finds Symfony applications with the profiler enabled.', severity: 'medium' },
  { id: 'v15', title: 'Exposed Spring Boot Actuator', query: 'inurl:"/actuator/health" OR inurl:"/actuator/env"', category: 'vuln', description: 'Finds Spring Boot applications with actuator endpoints exposed.', severity: 'high' },
  { id: 'v16', title: 'Exposed .env in Laravel', query: 'inurl:".env" "APP_KEY"', category: 'vuln', description: 'Finds Laravel .env files exposed publicly.', severity: 'critical' },
  { id: 'v17', title: 'Exposed .git in Production', query: 'inurl:"/.git/config"', category: 'vuln', description: 'Finds production sites with exposed .git configuration.', severity: 'high' },
  { id: 'v18', title: 'Exposed SVN in Production', query: 'inurl:"/.svn/entries"', category: 'vuln', description: 'Finds production sites with exposed SVN metadata.', severity: 'high' },
  { id: 'v19', title: 'Exposed CVS in Production', query: 'inurl:"/CVS/Entries"', category: 'vuln', description: 'Finds production sites with exposed CVS metadata.', severity: 'medium' },
  { id: 'v20', title: 'Exposed Bazzar in Production', query: 'inurl:"/.bzr/checkout/dirstate"', category: 'vuln', description: 'Finds production sites with exposed Bazaar metadata.', severity: 'medium' },

  // --- IOT & DEVICES ---
  { id: 'i1', title: 'Exposed IP Cameras', query: 'intitle:"IP Camera" "Live View"', category: 'files', description: 'Locates exposed IP camera interfaces.', severity: 'medium' },
  { id: 'i2', title: 'Exposed Printers', query: 'intitle:"Printer Status" "HP" OR "Canon"', category: 'files', description: 'Locates exposed network printers.', severity: 'low' },
  { id: 'i3', title: 'Exposed Smart Home Hubs', query: 'intitle:"Home Assistant" "Login"', category: 'files', description: 'Locates exposed Home Assistant hubs.', severity: 'low' },
  { id: 'i4', title: 'Exposed Industrial Controllers', query: 'intitle:"SCADA" "Login"', category: 'files', description: 'Locates exposed SCADA/ICS interfaces.', severity: 'high' },
  { id: 'i5', title: 'Exposed VoIP Phones', query: 'intitle:"Polycom" "Login"', category: 'files', description: 'Locates exposed VoIP phone management pages.', severity: 'low' },

  // --- CLOUD & INFRA ---
  { id: 'c1', title: 'Exposed S3 Buckets', query: 'site:s3.amazonaws.com "index of"', category: 'sensitive', description: 'Finds exposed AWS S3 buckets.', severity: 'high' },
  { id: 'c2', title: 'Exposed Azure Blobs', query: 'site:blob.core.windows.net "index of"', category: 'sensitive', description: 'Finds exposed Azure Blob storage.', severity: 'high' },
  { id: 'c3', title: 'Exposed GCP Buckets', query: 'site:storage.googleapis.com "index of"', category: 'sensitive', description: 'Finds exposed Google Cloud Storage buckets.', severity: 'high' },
  { id: 'c4', title: 'Exposed DigitalOcean Spaces', query: 'site:digitaloceanspaces.com "index of"', category: 'sensitive', description: 'Finds exposed DigitalOcean Spaces.', severity: 'high' },
  { id: 'c5', title: 'Exposed Cloudflare Workers', query: 'site:workers.dev "TODO"', category: 'sensitive', description: 'Finds exposed Cloudflare Workers with developer comments.', severity: 'low' },

  // --- SOCIAL & OSINT ---
  { id: 'o1', title: 'Public Trello Boards', query: 'site:trello.com "confidential"', category: 'custom', description: 'Finds public Trello boards containing confidential information.', severity: 'medium' },
  { id: 'o2', title: 'Public Google Drive Docs', query: 'site:docs.google.com "confidential"', category: 'custom', description: 'Finds public Google Drive documents containing confidential information.', severity: 'medium' },
  { id: 'o3', title: 'Public Pastebin Pastes', query: 'site:pastebin.com "password" OR "api_key"', category: 'custom', description: 'Finds public Pastebin pastes containing sensitive data.', severity: 'high' },
  { id: 'o4', title: 'Public GitHub Gists', query: 'site:gist.github.com "password" OR "token"', category: 'custom', description: 'Finds public GitHub Gists containing sensitive data.', severity: 'high' },
  { id: 'o5', title: 'Public LinkedIn Profiles', query: 'site:linkedin.com/in/ "cybersecurity"', category: 'custom', description: 'Finds LinkedIn profiles related to cybersecurity.', severity: 'low' },

  // --- DATABASE & STORAGE ---
  { id: 'db1', title: 'Exposed MongoDB Status', query: 'intitle:"MongoDB" "status" "version"', category: 'database', description: 'Finds exposed MongoDB status pages.', severity: 'high' },
  { id: 'db2', title: 'Exposed Redis Info', query: 'intitle:"Redis" "info" "version"', category: 'database', description: 'Finds exposed Redis info pages.', severity: 'high' },
  { id: 'db3', title: 'Exposed Memcached Stats', query: 'intitle:"Memcached" "stats" "version"', category: 'database', description: 'Finds exposed Memcached stats pages.', severity: 'medium' },
  { id: 'db4', title: 'Exposed CouchDB Dashboard', query: 'intitle:"CouchDB" "Welcome"', category: 'database', description: 'Finds exposed CouchDB Fauxton dashboards.', severity: 'high' },
  { id: 'db5', title: 'Exposed Cassandra Status', query: 'intitle:"Cassandra" "status" "cluster"', category: 'database', description: 'Finds exposed Cassandra status pages.', severity: 'high' },

  // --- CI/CD & DEV TOOLS ---
  { id: 'dev1', title: 'Exposed GitLab Sign-in', query: 'intitle:"GitLab" "Sign in"', category: 'login', description: 'Locates GitLab login pages.', severity: 'low' },
  { id: 'dev2', title: 'Exposed Bitbucket Login', query: 'intitle:"Bitbucket" "Log in"', category: 'login', description: 'Locates Bitbucket login pages.', severity: 'low' },
  { id: 'dev3', title: 'Exposed TeamCity Login', query: 'intitle:"TeamCity" "Log in"', category: 'login', description: 'Locates TeamCity login pages.', severity: 'low' },
  { id: 'dev4', title: 'Exposed Bamboo Login', query: 'intitle:"Bamboo" "Log in"', category: 'login', description: 'Locates Bamboo login pages.', severity: 'low' },
  { id: 'dev5', title: 'Exposed CircleCI Config', query: 'filetype:yml "circleci" "auth_token"', category: 'sensitive', description: 'Finds exposed CircleCI configuration files.', severity: 'critical' },

  // --- NETWORK & INFRA ---
  { id: 'net1', title: 'Exposed Cisco VPN', query: 'intitle:"Cisco AnyConnect" "Login"', category: 'network', description: 'Locates Cisco AnyConnect VPN login pages.', severity: 'medium' },
  { id: 'net2', title: 'Exposed FortiGate VPN', query: 'intitle:"FortiGate" "Login"', category: 'network', description: 'Locates FortiGate VPN login pages.', severity: 'medium' },
  { id: 'net3', title: 'Exposed Palo Alto VPN', query: 'intitle:"GlobalProtect" "Login"', category: 'network', description: 'Locates Palo Alto GlobalProtect VPN login pages.', severity: 'medium' },
  { id: 'net4', title: 'Exposed Juniper VPN', query: 'intitle:"Juniper Networks" "Login"', category: 'network', description: 'Locates Juniper VPN login pages.', severity: 'medium' },
  { id: 'net5', title: 'Exposed F5 BIG-IP', query: 'intitle:"BIG-IP" "Login"', category: 'network', description: 'Locates F5 BIG-IP management interfaces.', severity: 'high' },

  // --- CLOUD SERVICES ---
  { id: 'cloud1', title: 'Exposed Heroku Config', query: 'filetype:env "HEROKU_API_KEY"', category: 'sensitive', description: 'Finds exposed Heroku API keys.', severity: 'critical' },
  { id: 'cloud2', title: 'Exposed Netlify Config', query: 'filetype:toml "netlify" "token"', category: 'sensitive', description: 'Finds exposed Netlify configuration files.', severity: 'high' },
  { id: 'cloud3', title: 'Exposed Vercel Config', query: 'filetype:json "vercel" "token"', category: 'sensitive', description: 'Finds exposed Vercel configuration files.', severity: 'high' },
  { id: 'cloud4', title: 'Exposed Supabase Config', query: 'filetype:env "SUPABASE_KEY"', category: 'sensitive', description: 'Finds exposed Supabase API keys.', severity: 'critical' },
  { id: 'cloud5', title: 'Exposed PlanetScale Config', query: 'filetype:env "PLANETSCALE_TOKEN"', category: 'sensitive', description: 'Finds exposed PlanetScale tokens.', severity: 'critical' },

  // --- MISC SENSITIVE ---
  { id: 'm1', title: 'Exposed Zoom Meetings', query: 'site:zoom.us/j/ "password"', category: 'custom', description: 'Finds public Zoom meeting links with passwords.', severity: 'medium' },
  { id: 'm2', title: 'Exposed Slack Webhooks', query: 'filetype:env "hooks.slack.com/services/"', category: 'sensitive', description: 'Finds exposed Slack incoming webhooks.', severity: 'high' },
  { id: 'm3', title: 'Exposed Discord Webhooks', query: 'filetype:env "discord.com/api/webhooks/"', category: 'sensitive', description: 'Finds exposed Discord webhooks.', severity: 'high' },
  { id: 'm4', title: 'Exposed Telegram Bot Tokens', query: 'filetype:env "api.telegram.org/bot"', category: 'sensitive', description: 'Finds exposed Telegram bot tokens.', severity: 'critical' },
  { id: 'm5', title: 'Exposed Twilio Credentials', query: 'filetype:env "TWILIO_ACCOUNT_SID" "TWILIO_AUTH_TOKEN"', category: 'sensitive', description: 'Finds exposed Twilio credentials.', severity: 'critical' },

  // --- E-COMMERCE & PAYMENT ---
  { id: 'pay1', title: 'Exposed PayPal Client ID', query: 'filetype:env "PAYPAL_CLIENT_ID"', category: 'sensitive', description: 'Finds exposed PayPal client IDs.', severity: 'high' },
  { id: 'pay2', title: 'Exposed Braintree Config', query: 'filetype:env "BRAINTREE_PRIVATE_KEY"', category: 'sensitive', description: 'Finds exposed Braintree private keys.', severity: 'critical' },
  { id: 'pay3', title: 'Exposed Razorpay Key', query: 'filetype:env "RAZORPAY_KEY_SECRET"', category: 'sensitive', description: 'Finds exposed Razorpay secrets.', severity: 'critical' },
  { id: 'pay4', title: 'Exposed Paystack Secret', query: 'filetype:env "PAYSTACK_SECRET_KEY"', category: 'sensitive', description: 'Finds exposed Paystack secrets.', severity: 'critical' },

  // --- MONITORING & LOGS ---
  { id: 'mon1', title: 'Exposed Sentry DSN', query: 'filetype:env "SENTRY_DSN"', category: 'sensitive', description: 'Finds exposed Sentry DSNs.', severity: 'medium' },
  { id: 'mon2', title: 'Exposed New Relic Key', query: 'filetype:env "NEW_RELIC_LICENSE_KEY"', category: 'sensitive', description: 'Finds exposed New Relic license keys.', severity: 'high' },
  { id: 'mon3', title: 'Exposed Datadog API Key', query: 'filetype:env "DATADOG_API_KEY"', category: 'sensitive', description: 'Finds exposed Datadog API keys.', severity: 'high' },
  { id: 'mon4', title: 'Exposed Splunk Token', query: 'filetype:env "SPLUNK_TOKEN"', category: 'sensitive', description: 'Finds exposed Splunk tokens.', severity: 'high' },

  // --- AUTH & IDENTITY ---
  { id: 'auth1', title: 'Exposed Auth0 Domain', query: 'filetype:env "AUTH0_DOMAIN"', category: 'sensitive', description: 'Finds exposed Auth0 domains.', severity: 'medium' },
  { id: 'auth2', title: 'Exposed Okta Token', query: 'filetype:env "OKTA_API_TOKEN"', category: 'sensitive', description: 'Finds exposed Okta API tokens.', severity: 'critical' },
  { id: 'auth3', title: 'Exposed Keycloak Config', query: 'filetype:json "keycloak" "realm" "auth-server-url"', category: 'sensitive', description: 'Finds exposed Keycloak configuration files.', severity: 'high' },
  { id: 'auth4', title: 'Exposed JWT Secret', query: 'filetype:env "JWT_SECRET" OR "JWT_KEY"', category: 'sensitive', description: 'Finds exposed JWT secrets.', severity: 'critical' },

  // --- MISC TOOLS ---
  { id: 'tool1', title: 'Exposed Mailchimp API Key', query: 'filetype:env "MAILCHIMP_API_KEY"', category: 'sensitive', description: 'Finds exposed Mailchimp API keys.', severity: 'high' },
  { id: 'tool2', title: 'Exposed SendGrid API Key', query: 'filetype:env "SENDGRID_API_KEY"', category: 'sensitive', description: 'Finds exposed SendGrid API keys.', severity: 'high' },
  { id: 'tool3', title: 'Exposed Algolia Admin Key', query: 'filetype:env "ALGOLIA_ADMIN_KEY"', category: 'sensitive', description: 'Finds exposed Algolia admin keys.', severity: 'critical' },
  { id: 'tool4', title: 'Exposed Pusher App Secret', query: 'filetype:env "PUSHER_APP_SECRET"', category: 'sensitive', description: 'Finds exposed Pusher secrets.', severity: 'high' },
];
