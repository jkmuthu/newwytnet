const http = require('http');
const { execSync } = require('child_process');
const os = require('os');

const PORT = 3001;

function checkService(command) {
  try {
    execSync(command, { encoding: 'utf8', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

function getSystemInfo() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memoryPercent = Math.round((usedMem / totalMem) * 100);

  let diskInfo = { used: 0, total: 0, percent: 0 };
  try {
    const dfOutput = execSync("df -h / | tail -1 | awk '{print $3,$4,$5}'", { encoding: 'utf8' });
    const [used, available, percent] = dfOutput.trim().split(' ');
    diskInfo = { used, available, percent: parseInt(percent) };
  } catch {}

  const uptime = os.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);

  return {
    memory: {
      total: Math.round(totalMem / 1024 / 1024 / 1024 * 10) / 10 + ' GB',
      used: Math.round(usedMem / 1024 / 1024 / 1024 * 10) / 10 + ' GB',
      free: Math.round(freeMem / 1024 / 1024 / 1024 * 10) / 10 + ' GB',
      percent: memoryPercent
    },
    disk: diskInfo,
    uptime: `${days}d ${hours}h ${minutes}m`,
    loadAverage: os.loadavg().map(l => l.toFixed(2)),
    cpuCount: os.cpus().length,
    hostname: os.hostname(),
    platform: os.platform(),
    nodeVersion: process.version
  };
}

function getHealthStatus() {
  const services = {
    nodejs: {
      name: 'Node.js',
      status: true,
      version: process.version
    },
    nginx: {
      name: 'Nginx',
      status: checkService('systemctl is-active nginx'),
      message: ''
    },
    postgresql: {
      name: 'PostgreSQL',
      status: checkService('systemctl is-active postgresql'),
      message: ''
    },
    pm2: {
      name: 'PM2',
      status: checkService('pm2 ping'),
      message: ''
    },
    firewall: {
      name: 'Firewall (UFW)',
      status: checkService('ufw status | grep -q "Status: active"'),
      message: ''
    }
  };

  const systemInfo = getSystemInfo();
  const allHealthy = Object.values(services).every(s => s.status);

  return {
    success: true,
    healthy: allHealthy,
    timestamp: new Date().toISOString(),
    server: {
      ip: process.env.SERVER_IP || 'Unknown',
      hostname: systemInfo.hostname
    },
    services,
    system: systemInfo
  };
}

const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(getHealthStatus(), null, 2));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Health check server running on port ${PORT}`);
});
