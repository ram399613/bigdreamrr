// site.js - updated: mobile menu, reveal, loader, demo auth helpers
(() => {
  /* -------------------------
     Mobile menu toggle + reveal
     ------------------------- */
  const btn = document.getElementById('menuBtn');
  const nav = document.querySelector('.nav');
  let open = false;
  if (btn) {
    btn.addEventListener('click', () => {
      open = !open;
      btn.setAttribute('aria-expanded', open);
      if (!nav) return;
      if (open) {
        nav.style.display = 'flex';
        nav.style.flexDirection = 'column';
        nav.style.position = 'fixed';
        nav.style.right = '16px';
        nav.style.top = '76px';
        nav.style.background = 'rgba(2,6,23,0.92)';
        nav.style.padding = '12px';
        nav.style.borderRadius = '10px';
        nav.style.boxShadow = '0 12px 40px rgba(0,0,0,0.6)';
      } else {
        nav.style.display = '';
        nav.style.position = '';
        nav.style.flexDirection = '';
        nav.removeAttribute('style');
      }
    });
  }

  function revealAll() {
    const els = document.querySelectorAll('.reveal');
    const h = window.innerHeight;
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < h - 80) el.classList.add('show');
    });
  }
  window.addEventListener('scroll', revealAll);
  window.addEventListener('load', revealAll);
  revealAll();

  /* -------------------------
     Loader (global)
     ------------------------- */
  const loader = document.getElementById('siteLoader');
  function hideLoader() {
    if (!loader) return;
    loader.classList.add('hidden');
    // remove element after transition to free DOM
    setTimeout(() => loader && loader.remove(), 600);
  }
  // hide loader after DOM loaded + a small minimum time
  window.addEventListener('load', () => {
    setTimeout(hideLoader, 600);
  });

  /* -------------------------
     Auto highlight nav current page
     ------------------------- */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (href === path) a.classList.add('active');
  });

  /* -------------------------
     DEMO Authentication helpers (localStorage)
     - Storage keys:
       bd_users -> array of {email, name, passwordHash (not secure)}
       bd_current -> logged-in email
     - NOTE: This is demo-only. Replace with Firebase SDK in future.
     ------------------------- */

  function getUsers() {
    try { return JSON.parse(localStorage.getItem('bd_users') || '[]'); }
    catch(e) { return []; }
  }
  function saveUsers(users){ localStorage.setItem('bd_users', JSON.stringify(users)); }
  function findUser(email){ return getUsers().find(u => u.email === (email||'').toLowerCase()); }

  // register user (returns {ok, msg})
  window.demoRegister = function({name, email, password}) {
    email = (email||'').toLowerCase();
    if (!email || !password || !name) return {ok:false, msg: 'All fields required.'};
    if (findUser(email)) return {ok:false, msg: 'User already exists.'};
    const users = getUsers();
    // WARNING: password stored in plain text in demo. Replace with proper hashing in production.
    users.push({name, email, password});
    saveUsers(users);
    localStorage.setItem('bd_current', email);
    return {ok:true, msg: 'Registered successfully.'};
  };

  // login user (returns {ok,msg})
  window.demoLogin = function({email, password}) {
    email = (email||'').toLowerCase();
    const user = findUser(email);
    if (!user) return {ok:false, msg: 'No account found.'};
    if (user.password !== password) return {ok:false, msg: 'Incorrect password.'};
    localStorage.setItem('bd_current', email);
    return {ok:true, msg:'Logged in.'};
  };

  // logout
  window.demoLogout = function() {
    localStorage.removeItem('bd_current');
    // redirect to index
    window.location = 'index.html';
  };

  // get current user object
  window.demoCurrentUser = function(){
    const email = localStorage.getItem('bd_current');
    if (!email) return null;
    return findUser(email) || null;
  };

  // guard pages (call on pages that require auth)
  window.demoRequireAuth = function(redirectTo='login.html'){
    const u = demoCurrentUser();
    if (!u) {
      window.location = redirectTo;
      return null;
    }
    return u;
  };

  // helper: populate nav with login/register or profile/logout depending on state
  function adaptNavForAuth(){
    const navEl = document.querySelector('.nav');
    if (!navEl) return;
    // remove existing auth items if any
    navEl.querySelectorAll('.auth-item').forEach(n => n.remove());

    const me = demoCurrentUser();
    if (me) {
      const a = document.createElement('a');
      a.href = 'profile.html';
      a.className = 'auth-item';
      a.textContent = 'Profile';
      navEl.appendChild(a);

      const b = document.createElement('a');
      b.href = '#';
      b.className = 'auth-item';
      b.textContent = 'Logout';
      b.addEventListener('click', (e)=>{ e.preventDefault(); demoLogout(); });
      navEl.appendChild(b);
    } else {
      const r = document.createElement('a');
      r.href = 'register.html';
      r.className = 'auth-item';
      r.textContent = 'Register';
      navEl.appendChild(r);

      const l = document.createElement('a');
      l.href = 'login.html';
      l.className = 'auth-item';
      l.textContent = 'Login';
      navEl.appendChild(l);
    }
  }
  // run on load
  adaptNavForAuth();
  window.addEventListener('storage', adaptNavForAuth);

})();
