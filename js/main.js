// Dark Mode Toggle using Bootstrap 5 data-bs-theme attribute
function initTheme() {
    const themeToggleBtns = document.querySelectorAll('.theme-toggle');
    const htmlElement = document.documentElement;
    
    // Check local storage or system preference
    const currentTheme = localStorage.getItem('color-theme') || 
                        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    htmlElement.setAttribute('data-bs-theme', currentTheme);
    updateToggleIcons(currentTheme);

    themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const isDark = htmlElement.getAttribute('data-bs-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            
            htmlElement.setAttribute('data-bs-theme', newTheme);
            localStorage.setItem('color-theme', newTheme);
            updateToggleIcons(newTheme);
        });
    });
}

function updateToggleIcons(theme) {
    const themeToggleBtns = document.querySelectorAll('.theme-toggle');
    themeToggleBtns.forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon) {
            if (theme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }
    });
}

// Sticky Navbar Logic
function initStickyNavbar() {
    const header = document.querySelector('.navbar-custom');
    if(header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                header.classList.add('sticky-scroll');
            } else {
                header.classList.remove('sticky-scroll');
            }
        });
    }
}

// Toast Notifications
function showToast(message, type = 'success') {
    let toast = document.getElementById('global-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'global-toast';
        toast.className = 'custom-toast';
        toast.innerHTML = `<i class="fa-solid fa-check-circle"></i> <span id="toast-message"></span>`;
        document.body.appendChild(toast);
    }
    
    const icon = toast.querySelector('i');
    if (type === 'success') {
        icon.className = 'fa-solid fa-check-circle';
        toast.style.background = 'var(--primary-color)';
    } else if (type === 'error') {
        icon.className = 'fa-solid fa-triangle-exclamation';
        toast.style.background = '#dc3545'; // BS danger
    }
    
    toast.querySelector('#toast-message').textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

window.showToast = showToast;


// --- AUTHENTICATION LOGIC ---

const USERS_STORAGE_KEY = 'studyshare_users';
const CURRENT_USER_KEY = 'studyshare_current_user';

// Get current logged-in user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}

// Check if user is logged in
function isLoggedIn() {
    return !!getCurrentUser();
}

// Redirect if not logged in (Page Protection)
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
    }
}

// Redirect if logged in (Skip Auth Pages)
function redirectIfLoggedIn() {
    if (isLoggedIn()) {
        window.location.href = 'dashboard.html';
    }
}

// Handle User Signup
async function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const roleElement = document.getElementById('role');
    const role = roleElement ? roleElement.value : 'student';

    if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        return;
    }

    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data));
            showToast('Account created successfully!');
            setTimeout(() => window.location.href = 'dashboard.html', 1500);
        } else {
            showToast(data.message || 'Error signing up.', 'error');
        }
    } catch (error) {
        showToast('Server error during signup.', 'error');
    }
}

// Handle User Login
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data));
            showToast('Logged in successfully!');
            setTimeout(() => window.location.href = 'dashboard.html', 1000);
        } else {
            showToast(data.message || 'Invalid email or password.', 'error');
        }
    } catch (error) {
        showToast('Server error during login.', 'error');
    }
}

// Handle Logout
function handleLogout(event) {
    if(event) event.preventDefault();
    localStorage.removeItem(CURRENT_USER_KEY);
    showToast('Logged out.');
    setTimeout(() => window.location.href = 'login.html', 1000);
}

// Update User PFP
function updateUserPfp(base64Image) {
    const currentUser = getCurrentUser();
    if (currentUser) {
        currentUser.pfp = base64Image;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        
        let users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex].pfp = base64Image;
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
    }
}

// Update User Name
function updateUserName(newName) {
    const currentUser = getCurrentUser();
    if (currentUser && newName && newName.trim() !== '') {
        currentUser.name = newName.trim();
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        
        let users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || [];
        const userIndex = users.findIndex(u => u.email === currentUser.email);
        if (userIndex !== -1) {
            users[userIndex].name = currentUser.name;
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
        updateNavbarDisplay(); // Refresh global displays (like PFP initials if no image)
        return currentUser.name;
    }
    return currentUser ? currentUser.name : '';
}

// Make globally available
window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.updateUserPfp = updateUserPfp;
window.updateUserName = updateUserName;


// --- UI UPDATES BASED ON AUTH ---
function updateNavbarDisplay() {
    const loggedIn = isLoggedIn();
    const user = getCurrentUser();
    
    // Desktop views
    const guestLinksDesktop = document.querySelectorAll('.guest-only');
    const authLinksDesktop = document.querySelectorAll('.auth-only');
    
    guestLinksDesktop.forEach(el => el.classList.toggle('d-none', loggedIn));
    authLinksDesktop.forEach(el => {
        el.classList.toggle('d-none', !loggedIn);
        // Specifically for nav-items, they need d-block when visible inline
        if(loggedIn && el.classList.contains('nav-item')) {
           el.classList.remove('d-none');
        }
        // Specific for d-md-block classes
        if(loggedIn && el.classList.contains('d-md-block-auth')) {
            el.classList.remove('d-none');
            el.classList.add('d-md-block');
        } else if (!loggedIn && el.classList.contains('d-md-block-auth')) {
            el.classList.add('d-none');
            el.classList.remove('d-md-block');
        }
    });

    // Mobile views
    const guestLinksMobile = document.querySelectorAll('.guest-only-mobile');
    const authLinksMobile = document.querySelectorAll('.auth-only-mobile');
    
    guestLinksMobile.forEach(el => el.classList.toggle('d-none', loggedIn));
    authLinksMobile.forEach(el => el.classList.toggle('d-none', !loggedIn));

    // Update global PFP images across site
    if (loggedIn && user) {
        const defaultPfp = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6C63FF&color=fff&size=150&bold=true`;
        const avatarUrl = user.pfp ? user.pfp : defaultPfp;
        
        document.querySelectorAll('.current-user-pfp').forEach(img => {
            img.src = avatarUrl;
            img.classList.remove('d-none');
        });
    }
}


// --- DOM LOAD INTIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initStickyNavbar();
    updateNavbarDisplay();
});
