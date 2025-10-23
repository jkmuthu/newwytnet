import { Express, Request, Response, NextFunction } from "express";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { devdocAuthMiddleware } from "./middleware/devdocAuth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security: Mandatory environment variables - no defaults for production safety
const DOC_SITE_PASSWORD = process.env.DOC_SITE_PASSWORD;
const DOC_SITE_API_TOKEN = process.env.DOC_SITE_API_TOKEN;

if (!DOC_SITE_PASSWORD) {
  throw new Error('SECURITY ERROR: DOC_SITE_PASSWORD environment variable is required for DevDoc authentication. Set it in your environment.');
}

if (!DOC_SITE_API_TOKEN) {
  throw new Error('SECURITY ERROR: DOC_SITE_API_TOKEN environment variable is required for Replit Agent access. Set it in your environment.');
}

declare module 'express-session' {
  interface SessionData {
    docsAuthenticated?: boolean;
  }
}

/**
 * Documentation Authentication Middleware (Layer 1: Basic Auth)
 * 
 * Three authentication methods:
 * 1. Replit Agent Token (Bearer token in Authorization header)
 * 2. WytPass Session (any authenticated user - granular permissions checked by devdocAuthMiddleware)
 * 3. Password-only (for external developers - backward compatibility)
 * 
 * Note: This is a basic authentication gate. Granular permission checking
 * (public/developer/internal/admin levels) is handled by devdocAuthMiddleware (Layer 2).
 */
function checkDocsAuth(req: Request, res: Response, next: NextFunction) {
  // Method 1: Check Bearer token for Replit Agent
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === DOC_SITE_API_TOKEN) {
      console.log('📖 Replit Agent accessing DevDoc via API token');
      return next();
    }
  }
  
  // Method 2: Check WytPass session (any authenticated user)
  // Granular permission checking happens in devdocAuthMiddleware
  const principal = req.session.wytpassPrincipal;
  if (principal) {
    console.log(`📖 WytPass user ${principal.name || principal.email} accessing DevDoc`);
    return next();
  }
  
  // Method 3: Check password-based session (backward compatibility)
  if (req.session.docsAuthenticated) {
    console.log('📖 Password-authenticated user accessing DevDoc');
    return next();
  }
  
  // Allow access to login endpoints
  if (req.path === '/devdoc-login' || req.path === '/devdoc-auth') {
    return next();
  }
  
  // Redirect to login page
  res.redirect('/devdoc-login');
}

/**
 * Setup documentation routes on main server
 */
export function setupDocsRoutes(app: Express) {
  
  // Password authentication endpoint for external developers
  app.post('/devdoc-auth', (req: Request, res: Response) => {
    try {
      const { password } = req.body;
      
      if (password === DOC_SITE_PASSWORD) {
        req.session.docsAuthenticated = true;
        
        // Save session explicitly
        req.session.save((err) => {
          if (err) {
            console.error('DevDoc session save error:', err);
            return res.status(500).json({ 
              success: false, 
              message: 'Session save failed' 
            });
          }
          
          console.log('📖 External developer authenticated to DevDoc');
          res.json({ success: true });
        });
      } else {
        res.status(401).json({ 
          success: false, 
          message: 'Invalid password' 
        });
      }
    } catch (error) {
      console.error('DevDoc auth error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Authentication failed' 
      });
    }
  });
  
  // Login page for password authentication
  app.get('/devdoc-login', (req: Request, res: Response) => {
    // Check if already authenticated via Super Admin session
    const principal = req.session.wytpassPrincipal;
    if (principal && principal.isSuperAdmin) {
      return res.redirect('/devdoc/');
    }
    
    if (req.session.docsAuthenticated) {
      return res.redirect('/devdoc/');
    }
    
    const loginHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WytNet DevDoc - Authentication Required</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
      max-width: 450px;
      width: 100%;
    }
    .logo {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo h1 {
      font-size: 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 4px;
    }
    .logo p {
      font-size: 14px;
      color: #718096;
    }
    h2 {
      font-size: 24px;
      margin-bottom: 8px;
      color: #1a202c;
    }
    .subtitle {
      color: #718096;
      margin-bottom: 32px;
      font-size: 14px;
      line-height: 1.5;
    }
    .form-group {
      margin-bottom: 24px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #2d3748;
      font-size: 14px;
    }
    input[type="password"] {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.2s;
    }
    input[type="password"]:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }
    button:active {
      transform: translateY(0);
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    .error {
      color: #f56565;
      font-size: 14px;
      margin-top: 12px;
      padding: 12px;
      background: #fff5f5;
      border-radius: 6px;
      border-left: 3px solid #f56565;
      display: none;
    }
    .error.show {
      display: block;
    }
    .info-box {
      margin-top: 24px;
      padding: 16px;
      background: #f7fafc;
      border-radius: 8px;
      border-left: 3px solid #4299e1;
    }
    .info-box h3 {
      font-size: 14px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 8px;
    }
    .info-box ul {
      list-style: none;
      padding-left: 0;
    }
    .info-box li {
      font-size: 13px;
      color: #4a5568;
      margin-bottom: 6px;
      padding-left: 20px;
      position: relative;
    }
    .info-box li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #48bb78;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="login-card">
    <div class="logo">
      <h1>WytNet DevDoc</h1>
      <p>Developer Documentation Portal</p>
    </div>
    
    <h2>Welcome Back</h2>
    <p class="subtitle">Enter your documentation access password to continue. Super Admins are automatically authenticated.</p>
    
    <form id="loginForm">
      <div class="form-group">
        <label for="password">Documentation Password</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          placeholder="Enter your access password"
          required
          autocomplete="current-password"
        />
      </div>
      
      <button type="submit" id="submitBtn">Access Documentation</button>
      <div class="error" id="error">Invalid password. Please check and try again.</div>
    </form>
    
    <div class="info-box">
      <h3>Authentication Methods</h3>
      <ul>
        <li>Super Admin session (automatic)</li>
        <li>Password-based access (external developers)</li>
        <li>API token (Replit Assistant)</li>
      </ul>
    </div>
  </div>

  <script>
    const form = document.getElementById('loginForm');
    const error = document.getElementById('error');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submitBtn');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      error.classList.remove('show');
      
      const password = passwordInput.value;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Authenticating...';

      try {
        const response = await fetch('/devdoc-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (data.success) {
          submitBtn.textContent = 'Success! Redirecting...';
          setTimeout(() => {
            window.location.href = '/devdoc/';
          }, 500);
        } else {
          error.textContent = data.message || 'Invalid password. Please try again.';
          error.classList.add('show');
          passwordInput.value = '';
          passwordInput.focus();
          submitBtn.disabled = false;
          submitBtn.textContent = 'Access Documentation';
        }
      } catch (err) {
        console.error('Login error:', err);
        error.textContent = 'Connection error. Please try again.';
        error.classList.add('show');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Access Documentation';
      }
    });

    // Auto-focus password input
    passwordInput.focus();
  </script>
</body>
</html>
    `;
    
    res.send(loginHtml);
  });
  
  // Logout endpoint
  app.get('/devdoc-logout', (req: Request, res: Response) => {
    req.session.docsAuthenticated = false;
    req.session.save((err) => {
      if (err) {
        console.error('DevDoc logout error:', err);
      }
      res.redirect('/devdoc-login');
    });
  });
  
  // Session status check endpoint
  app.get('/api/devdoc/session', (req: Request, res: Response) => {
    const principal = req.session.wytpassPrincipal;
    const isAuthenticated = 
      (principal && principal.isSuperAdmin) || 
      req.session.docsAuthenticated || 
      false;
    
    res.json({
      authenticated: isAuthenticated,
      authMethod: principal?.isSuperAdmin ? 'super_admin' : 
                  req.session.docsAuthenticated ? 'password' : 'none',
      user: principal ? {
        name: principal.name,
        email: principal.email,
        isSuperAdmin: principal.isSuperAdmin
      } : null
    });
  });
  
  // Serve built VitePress documentation with auth middleware
  // Layer 1: Basic authentication (password/Super Admin/token)
  // Layer 2: Granular RBAC (section-level permissions based on WytPass role)
  app.use('/devdoc', checkDocsAuth, devdocAuthMiddleware, express.static(
    path.join(__dirname, '../docs/.vitepress/dist')
  ));
  
  console.log('✅ DevDoc routes initialized');
  console.log(`📚 Documentation URL: /devdoc/`);
  console.log(`🔐 Documentation password: ${DOC_SITE_PASSWORD}`);
  console.log(`🤖 Replit Agent token: ${DOC_SITE_API_TOKEN}`);
}
