/* ============================================================
   NOVAMARK – Auth JavaScript
   ============================================================ */

// ── Simple Local Auth Storage ────────────────────────────
const AuthService = {
  getUsers() {
    return JSON.parse(localStorage.getItem('novamark_users') || '[]');
  },
  saveUsers(users) {
    localStorage.setItem('novamark_users', JSON.stringify(users));
  },
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('novamark_current_user') || 'null');
  },
  setCurrentUser(user) {
    localStorage.setItem('novamark_current_user', JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem('novamark_current_user');
  },
  register(name, email, password, plan = 'starter') {
    const users = this.getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: btoa(password), // simple encode (not secure, demo only)
      plan,
      createdAt: new Date().toISOString(),
      avatar: name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
    };
    users.push(user);
    this.saveUsers(users);
    this.setCurrentUser({ id: user.id, name: user.name, email: user.email, plan: user.plan, avatar: user.avatar });
    return { success: true };
  },
  login(email, password) {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && atob(u.password) === password);
    if (!user) {
      return { success: false, message: 'Invalid email or password. Please try again.' };
    }
    this.setCurrentUser({ id: user.id, name: user.name, email: user.email, plan: user.plan, avatar: user.avatar });
    return { success: true };
  },
};

// ── Redirect if already logged in ───────────────────────
(function () {
  const user = AuthService.getCurrentUser();
  const isAuthPage = window.location.pathname.includes('login') || window.location.pathname.includes('register');
  if (user && isAuthPage) {
    window.location.href = 'dashboard.html';
  }
})();

// ── Form Utilities ───────────────────────────────────────
function showFieldError(fieldId, message) {
  const group = document.getElementById(fieldId)?.closest('.form-group');
  if (!group) return;
  group.classList.add('has-error');
  const errorEl = group.querySelector('.field-error');
  if (errorEl) errorEl.textContent = message;
}

function clearFieldError(fieldId) {
  const group = document.getElementById(fieldId)?.closest('.form-group');
  if (!group) return;
  group.classList.remove('has-error');
}

function showFormMessage(formId, message, type = 'error') {
  const form = document.getElementById(formId);
  if (!form) return;
  // Search inside the form first, then fall back to the parent container
  let msgEl = form.querySelector('.form-message')
            || form.closest('.auth-card')?.querySelector('.form-message')
            || document.getElementById('formMessage');
  if (!msgEl) return;
  msgEl.textContent = message;
  msgEl.className = `form-message ${type} show`;
  setTimeout(() => msgEl.classList.remove('show'), 5000);
}

function setButtonLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.classList.toggle('btn-loading', loading);
  btn.disabled = loading;
}

// ── Register Page ────────────────────────────────────────
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  const passwordInput = document.getElementById('password');
  const confirmInput = document.getElementById('confirmPassword');

  // Password strength indicator
  if (passwordInput) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      const segments = document.querySelectorAll('.strength-segment');
      const label = document.querySelector('.strength-label');

      let strength = 0;
      if (val.length >= 8) strength++;
      if (/[A-Z]/.test(val)) strength++;
      if (/[0-9]/.test(val)) strength++;
      if (/[^A-Za-z0-9]/.test(val)) strength++;

      segments.forEach((seg, i) => {
        seg.className = 'strength-segment';
        if (i < strength) {
          if (strength <= 1) seg.classList.add('active-weak');
          else if (strength <= 3) seg.classList.add('active-medium');
          else seg.classList.add('active-strong');
        }
      });

      if (label) {
        if (val.length === 0) label.textContent = '';
        else if (strength <= 1) label.textContent = 'Weak password';
        else if (strength <= 3) label.textContent = 'Moderate password';
        else label.textContent = 'Strong password ✓';
      }

      clearFieldError('password');
    });
  }

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = passwordInput ? passwordInput.value : '';
    const confirm = confirmInput ? confirmInput.value : '';
    const plan = document.getElementById('plan')?.value || 'starter';
    const terms = document.getElementById('terms')?.checked;

    // Validation
    let valid = true;
    if (!name || name.length < 2) {
      showFieldError('fullName', 'Please enter your full name.');
      valid = false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError('email', 'Please enter a valid email address.');
      valid = false;
    }
    if (!password || password.length < 8) {
      showFieldError('password', 'Password must be at least 8 characters.');
      valid = false;
    }
    if (password !== confirm) {
      showFieldError('confirmPassword', 'Passwords do not match.');
      valid = false;
    }
    if (!terms) {
      showFormMessage('registerForm', 'Please accept the Terms of Service to continue.', 'error');
      valid = false;
    }

    if (!valid) return;

    setButtonLoading('registerBtn', true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1200));

    const result = AuthService.register(name, email, password, plan);
    if (result.success) {
      showFormMessage('registerForm', '🎉 Account created! Redirecting to your dashboard...', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
    } else {
      showFormMessage('registerForm', result.message, 'error');
      setButtonLoading('registerBtn', false);
    }
  });

  // Clear errors on input
  ['fullName', 'email', 'confirmPassword'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => clearFieldError(id));
  });
}

// ── Login Page ───────────────────────────────────────────
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    let valid = true;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError('email', 'Please enter a valid email address.');
      valid = false;
    }
    if (!password) {
      showFieldError('password', 'Please enter your password.');
      valid = false;
    }
    if (!valid) return;

    setButtonLoading('loginBtn', true);
    await new Promise(r => setTimeout(r, 1000));

    const result = AuthService.login(email, password);
    if (result.success) {
      showFormMessage('loginForm', '✓ Login successful! Redirecting...', 'success');
      setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    } else {
      showFormMessage('loginForm', result.message, 'error');
      setButtonLoading('loginBtn', false);
    }
  });

  ['email', 'password'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => clearFieldError(id));
  });
}

// ── Password Toggle ──────────────────────────────────────
document.querySelectorAll('.password-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;
    if (!input) return;
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    btn.textContent = isText ? '👁️' : '🙈';
  });
});

// ── Demo Login Fill ──────────────────────────────────────
const demoBtn = document.getElementById('demoLoginBtn');
if (demoBtn) {
  demoBtn.addEventListener('click', () => {
    const emailEl = document.getElementById('email');
    const passEl = document.getElementById('password');
    if (emailEl) emailEl.value = 'demo@novamark.io';
    if (passEl) passEl.value = 'Demo@12345';
    // Auto-register demo user if not exists, then submit
    AuthService.register('Demo User', 'demo@novamark.io', 'Demo@12345', 'pro');
    const form = document.getElementById('loginForm');
    if (form) form.requestSubmit();
  });
}
