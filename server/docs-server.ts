import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'docs-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

declare module 'express-session' {
  interface SessionData {
    authenticated?: boolean;
    isSuperAdmin?: boolean;
  }
}

const DOC_SITE_PASSWORD = process.env.DOC_SITE_PASSWORD || 'wytnet123';
const DOC_SITE_API_TOKEN = process.env.DOC_SITE_API_TOKEN || 'replit-agent-token-12345';

interface AuthenticatedRequest extends Request {
  user?: any;
}

function checkAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === DOC_SITE_API_TOKEN) {
      return next();
    }
  }
  
  if (req.session.authenticated || req.session.isSuperAdmin) {
    return next();
  }
  
  if (req.path === '/docs-login' || req.path.startsWith('/docs-login/')) {
    return next();
  }
  
  if (req.path === '/docs-auth' || req.method === 'POST') {
    return next();
  }
  
  res.redirect('/docs-login');
}

app.post('/docs-auth', (req: Request, res: Response) => {
  const { password } = req.body;
  
  if (password === DOC_SITE_PASSWORD) {
    req.session.authenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

app.get('/docs-login', (req: Request, res: Response) => {
  const loginHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WytNet DevDoc - Login</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .login-card {
      background: white;
      border-radius: 16px;
      padding: 48px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 400px;
      width: 100%;
    }
    h1 {
      font-size: 28px;
      margin-bottom: 8px;
      color: #1a1a1a;
    }
    p {
      color: #666;
      margin-bottom: 32px;
      font-size: 14px;
    }
    .form-group {
      margin-bottom: 24px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
      font-size: 14px;
    }
    input[type="password"] {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.3s;
    }
    input[type="password"]:focus {
      outline: none;
      border-color: #667eea;
    }
    button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
    }
    button:active {
      transform: translateY(0);
    }
    .error {
      color: #e53e3e;
      font-size: 14px;
      margin-top: 12px;
      display: none;
    }
    .error.show {
      display: block;
    }
    .info {
      margin-top: 24px;
      padding: 16px;
      background: #f7fafc;
      border-radius: 8px;
      font-size: 13px;
      color: #4a5568;
    }
    .info strong {
      color: #2d3748;
    }
  </style>
</head>
<body>
  <div class="login-card">
    <h1>WytNet DevDoc</h1>
    <p>Developer Documentation Access</p>
    
    <form id="loginForm">
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          placeholder="Enter documentation password"
          required
          autocomplete="current-password"
        />
      </div>
      
      <button type="submit">Access Documentation</button>
      <div class="error" id="error">Invalid password. Please try again.</div>
    </form>
    
    <div class="info">
      <strong>Note:</strong> If you're already logged in as a Super Admin on WytNet Engine, you can access the documentation directly without a password.
    </div>
  </div>

  <script>
    const form = document.getElementById('loginForm');
    const error = document.getElementById('error');
    const passwordInput = document.getElementById('password');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      error.classList.remove('show');

      const password = passwordInput.value;

      try {
        const response = await fetch('/docs-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (data.success) {
          window.location.href = '/docs/';
        } else {
          error.classList.add('show');
          passwordInput.value = '';
          passwordInput.focus();
        }
      } catch (err) {
        error.textContent = 'Connection error. Please try again.';
        error.classList.add('show');
      }
    });
  </script>
</body>
</html>
  `;
  
  res.send(loginHtml);
});

app.get('/docs-logout', (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.redirect('/docs-login');
  });
});

app.use('/docs', checkAuth, express.static(path.join(__dirname, '../docs/.vitepress/dist')));

app.get('/', (req: Request, res: Response) => {
  res.redirect('/docs/');
});

const PORT = process.env.DOCS_PORT || 3001;

app.listen(PORT, () => {
  console.log(`📚 WytNet DevDoc server running on port ${PORT}`);
  console.log(`🔐 Documentation password: ${DOC_SITE_PASSWORD}`);
  console.log(`🤖 Replit Agent token: ${DOC_SITE_API_TOKEN}`);
  console.log(`📖 Access at: http://localhost:${PORT}/docs/`);
});

export default app;
