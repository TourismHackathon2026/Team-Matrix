;(function() {
'use strict';

// ================== LOCALSTORAGE DATA LAYER ==================

function lsGet(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch(e) { return def; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
}

function genId() {
  return Date.now() + '_' + Math.random().toString(36).substr(2, 6);
}

// Users
function getUsers() { return lsGet('tv_users', []); }
function saveUsers(u) { lsSet('tv_users', u); }

function getCurrentUser() { return lsGet('tv_current_user', null); }
function setCurrentUser(u) {
  lsSet('tv_current_user', u);
  currentUser = u;
  updateAuthUI();
}
function clearCurrentUser() {
  localStorage.removeItem('tv_current_user');
  currentUser = null;
  updateAuthUI();
}

function createUser(name, email, password, role) {
  const users = getUsers();
  if (users.find(u => u.email === email)) return { error: 'Email already registered.' };
  const user = { id: genId(), name, email, password, role, created_at: new Date().toISOString() };
  users.push(user);
  saveUsers(users);
  return { user };
}

function authenticateUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return { error: 'Invalid email or password.' };
  return { user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}

// Reviews
function getReviews() { return lsGet('tv_reviews', []); }
function saveReviews(r) { lsSet('tv_reviews', r); }

function addReview(place, rating, review, userName) {
  const reviews = getReviews();
  const r = { id: genId(), place, rating, review, user_name: userName, created_at: new Date().toISOString() };
  reviews.push(r);
  saveReviews(reviews);
  return r;
}

function getReviewsByPlace(place) {
  return getReviews().filter(r => r.place.toLowerCase() === place.toLowerCase());
}

// Complaints
function getComplaints() { return lsGet('tv_complaints', []); }
function saveComplaints(c) { lsSet('tv_complaints', c); }

function addComplaint(name, place, title, description, userId) {
  const complaints = getComplaints();
  const c = { id: genId(), user_id: userId || null, name, place, title, description, status: 'pending', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  complaints.push(c);
  saveComplaints(complaints);
  return c;
}

function resolveComplaintById(id) {
  const complaints = getComplaints();
  const c = complaints.find(x => x.id === id);
  if (c) { c.status = 'resolved'; c.updated_at = new Date().toISOString(); saveComplaints(complaints); }
  return c;
}

// Seed demo admin if not present
(function seedDemo() {
  const users = getUsers();
  if (!users.find(u => u.email === 'admin@travelvoice.com')) {
    users.push({
      id: 'admin_demo',
      name: 'Admin',
      email: 'admin@travelvoice.com',
      password: 'admin123',
      role: 'admin',
      created_at: new Date().toISOString()
    });
  }
  saveUsers(users);

  const complaints = getComplaints();
  if (complaints.length === 0) {
    complaints.push(
      { id: 'c1', user_id: null, name: 'Ram', place: 'Hotel Himalayan Pokhara', title: 'Overcharged in Hotel', description: 'They charged me extra for room service without my consent.', status: 'pending', created_at: new Date(Date.now() - 86400000).toISOString(), updated_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 'c2', user_id: null, name: 'Sita', place: 'Lakeside Restaurant', title: 'Dirty Environment', description: 'The tables were sticky and the floor was dirty.', status: 'resolved', created_at: new Date(Date.now() - 172800000).toISOString(), updated_at: new Date(Date.now() - 86400000).toISOString() }
    );
    saveComplaints(complaints);
  }
})();

// ================== NAVIGATION ==================

const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('open');
});

document.querySelectorAll('#nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('open');
    });
});

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('#nav-menu a');

function updateActiveNav() {
    let current = '';
    sections.forEach(section => {
        const top = section.offsetTop - 150;
        const bottom = top + section.offsetHeight;
        if (window.scrollY >= top && window.scrollY < bottom) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
}

window.addEventListener('scroll', updateActiveNav);
window.addEventListener('load', updateActiveNav);

// ================== MODAL ==================

const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');

function openModal(html) {
    modalContent.innerHTML = html;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// ================== TOAST ==================

function showToast(message, type = 'success') {
    const toast = document.getElementById('complaintToast');
    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// ================== THEME ==================

function getStorage(key, def) {
  try { return localStorage.getItem(key) || def; } catch(e) { return def; }
}
function setStorage(key, val) {
  try { localStorage.setItem(key, val); } catch(e) {}
}

const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

function getTheme() {
    return getStorage('tv_theme', 'light');
}

function setTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-moon';
    }
    setStorage('tv_theme', theme);
}

setTheme(getTheme());

themeToggle.addEventListener('click', () => {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
});

// ================== AUTH UI ==================

const authButtons = document.getElementById('authButtons');
const userBadge = document.getElementById('userBadge');
const userNameDisplay = document.getElementById('userNameDisplay');
const userRoleBadge = document.getElementById('userRoleBadge');

let currentUser = null;

function updateAuthUI() {
    if (currentUser) {
        authButtons.style.display = 'none';
        userBadge.style.display = 'flex';
        userNameDisplay.textContent = currentUser.name;
        userRoleBadge.textContent = currentUser.role;
        userRoleBadge.className = 'user-role-badge role-' + currentUser.role;
    } else {
        authButtons.style.display = 'flex';
        userBadge.style.display = 'none';
    }
    updateDashboardAccess();
}

function updateDashboardAccess() {
    const dashboardSection = document.getElementById('dashboard');
    const navDashboard = document.getElementById('navDashboard');

    if (currentUser && currentUser.role === 'admin') {
        dashboardSection.classList.add('visible');
        navDashboard.style.display = 'inline';
        loadDashboardData();
    } else {
        dashboardSection.classList.remove('visible');
        navDashboard.style.display = 'none';
    }
}

// Restore session
const savedUser = getCurrentUser();
if (savedUser) {
  currentUser = savedUser;
  updateAuthUI();
}

// ================== SIGNUP ==================

document.getElementById('signupBtn').addEventListener('click', () => {
    openModal(`
        <h2 style="margin-bottom:24px;text-align:center;">Create Account</h2>
        <form id="signupForm">
            <div class="form-group">
                <label><i class="fas fa-user"></i> Full Name</label>
                <input type="text" id="signupName" placeholder="John Doe" required>
            </div>
            <div class="form-group">
                <label><i class="fas fa-envelope"></i> Email</label>
                <input type="email" id="signupEmail" placeholder="your@email.com" required>
            </div>
            <div class="form-group">
                <label><i class="fas fa-lock"></i> Password</label>
                <input type="password" id="signupPassword" placeholder="At least 6 characters" required>
            </div>
            <div class="form-group">
                <label><i class="fas fa-user-tag"></i> Role</label>
                <select id="signupRole" style="width:100%;padding:14px 16px;border:2px solid var(--border);border-radius:var(--radius-sm);font-size:.95rem;background:var(--input-bg);color:var(--text);font-family:inherit;">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <div class="form-group" id="adminCodeGroup" style="display:none;">
                <label><i class="fas fa-shield-alt"></i> Admin Secret Code</label>
                <input type="password" id="adminCode" placeholder="Enter admin secret code">
                <p style="font-size:.8rem;color:var(--text-light);margin-top:6px;">Hint: ADMIN2024</p>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Create Account</button>
            <p style="text-align:center;margin-top:16px;color:var(--text-light);font-size:.85rem;">
                Already have an account? <a href="#" id="switchToLogin" style="color:var(--primary);font-weight:600;">Login</a>
            </p>
        </form>
    `);

    document.getElementById('signupRole').addEventListener('change', function() {
        document.getElementById('adminCodeGroup').style.display = this.value === 'admin' ? 'block' : 'none';
    });

    document.getElementById('signupForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const role = document.getElementById('signupRole').value;
        const adminCode = document.getElementById('adminCode')?.value || '';
        const finalRole = (role === 'admin' && adminCode === 'ADMIN2024') ? 'admin' : 'user';

        if (password.length < 6) {
            showToast('Password must be at least 6 characters.', 'error');
            return;
        }

        const result = createUser(name, email, password, finalRole);
        if (result.error) {
            showToast(result.error, 'error');
            return;
        }

        showToast('Account created! Welcome, ' + name + '.', 'success');
        setCurrentUser({ id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role });
        closeModal();
    });

    document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
        document.getElementById('loginBtn').click();
    });
});

// ================== LOGIN ==================

document.getElementById('loginBtn').addEventListener('click', () => {
    openModal(`
        <h2 style="margin-bottom:24px;text-align:center;">Welcome Back</h2>
        <form id="loginForm">
            <div class="form-group">
                <label><i class="fas fa-envelope"></i> Email</label>
                <input type="email" id="loginEmail" placeholder="your@email.com" required>
            </div>
            <div class="form-group">
                <label><i class="fas fa-lock"></i> Password</label>
                <input type="password" id="loginPassword" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block">Login</button>
            <p style="text-align:center;margin-top:16px;color:var(--text-light);font-size:.85rem;">
                Don't have an account? <a href="#" id="switchToSignup" style="color:var(--primary);font-weight:600;">Sign Up</a>
            </p>
            <p style="text-align:center;margin-top:8px;color:var(--text-light);font-size:.75rem;">
                Admin demo: admin@travelvoice.com / admin123
            </p>
        </form>
    `);

    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        const result = authenticateUser(email, password);
        if (result.error) {
            showToast(result.error, 'error');
            return;
        }

        setCurrentUser(result.user);
        closeModal();
        showToast('Logged in as ' + result.user.name + ' (' + result.user.role + ')', 'success');
    });

    document.getElementById('switchToSignup')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
        document.getElementById('signupBtn').click();
    });
});

// ================== LOGOUT ==================

document.getElementById('logoutBtn').addEventListener('click', () => {
    clearCurrentUser();
    showToast('Logged out successfully.', 'success');
});

// ================== SEARCH ==================

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');

const places = [
    { name: 'Hotel Himalayan', category: 'Hotels', location: 'Pokhara', rating: 4.6 },
    { name: 'Mo:Mo Station', category: 'Restaurants', location: 'Lakeside', rating: 4.3 },
    { name: 'Sarangkot View Point', category: 'Attractions', location: 'Pokhara', rating: 4.8 },
    { name: 'Peace Stupa', category: 'Attractions', location: 'Anadu Hill', rating: 4.7 },
    { name: 'Pokhara Bus Terminal', category: 'Transport', location: 'Pokhara', rating: 3.2 },
    { name: 'City Taxi Service', category: 'Transport', location: 'Pokhara', rating: 4.0 },
    { name: 'Local Guide Ram', category: 'Guides', location: 'Lakeside', rating: 4.5 },
    { name: 'Mountain Trek Guides', category: 'Guides', location: 'Annapurna', rating: 4.9 },
    { name: 'Lake View Restaurant', category: 'Restaurants', location: 'Pokhara', rating: 4.2 },
    { name: 'Fewa Park', category: 'Attractions', location: 'Pokhara', rating: 4.1 },
];

function searchPlace(query) {
    const q = query.toLowerCase().trim();
    if (!q) {
        searchResults.classList.remove('show');
        return;
    }
    const matches = places.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
    if (matches.length === 0) {
        searchResults.innerHTML = '<p style="color:var(--text-light);text-align:center;">No results found. Try a different search.</p>';
    } else {
        searchResults.innerHTML = matches.map(p => `
            <div class="search-result-item">
                <h4>${p.name}</h4>
                <p>${p.category} &middot; ${p.location} &middot; ⭐ ${p.rating}</p>
            </div>
        `).join('');
    }
    searchResults.classList.add('show');
}

searchBtn.addEventListener('click', () => searchPlace(searchInput.value));
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchPlace(searchInput.value);
});

document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
        const category = card.dataset.category;
        searchInput.value = category;

        if (category === 'hotels') {
            const reviews = getReviews().filter(r => r.place.toLowerCase().includes('hotel'));
            const html = reviews.map(r => `
                <div class="hotel-result">
                    <h4>${r.place}</h4>
                    <p class="hotel-meta">${'⭐'.repeat(r.rating)} (${r.rating}/5)</p>
                    <p class="hotel-desc">${r.review}</p>
                </div>
            `).join('');
            searchResults.innerHTML = `<h3 style="margin-bottom:16px;">🏨 ${reviews.length} Hotel Reviews</h3>${html || '<p>No reviews yet.</p>'}`;
            searchResults.classList.add('show');
        } else {
            searchPlace(category);
        }
        document.getElementById('explore').scrollIntoView({ behavior: 'smooth' });
    });
});

// ================== REVIEW SUBMISSION ==================

document.querySelectorAll('.review-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const place = btn.dataset.place;
        openModal(`
            <h2 style="margin-bottom:24px;text-align:center;">Write a Review</h2>
            <form id="reviewForm">
                <div class="form-group">
                    <label><i class="fas fa-store"></i> Place</label>
                    <input type="text" value="${place}" readonly style="background:var(--input-bg);">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-star"></i> Rating</label>
                    <div style="font-size:1.6rem;cursor:pointer;" id="starRating">
                        <span data-star="1">☆</span>
                        <span data-star="2">☆</span>
                        <span data-star="3">☆</span>
                        <span data-star="4">☆</span>
                        <span data-star="5">☆</span>
                    </div>
                    <input type="hidden" id="ratingValue" value="0">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-pen"></i> Your Review</label>
                    <textarea id="reviewText" placeholder="Share your experience..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-block">Submit Review</button>
            </form>
        `);
        let selectedRating = 0;
        const stars = document.querySelectorAll('#starRating span');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.star);
                document.getElementById('ratingValue').value = selectedRating;
                stars.forEach((s, i) => {
                    s.textContent = i < selectedRating ? '★' : '☆';
                });
            });
            star.addEventListener('mouseenter', () => {
                const hover = parseInt(star.dataset.star);
                stars.forEach((s, i) => {
                    s.textContent = i < hover ? '★' : '☆';
                });
            });
            star.addEventListener('mouseleave', () => {
                stars.forEach((s, i) => {
                    s.textContent = i < selectedRating ? '★' : '☆';
                });
            });
        });
        document.getElementById('reviewForm').addEventListener('submit', function(e) {
            e.preventDefault();
            if (selectedRating === 0) {
                showToast('Please select a rating.', 'error');
                return;
            }
            const review = document.getElementById('reviewText').value.trim();
            if (!review) {
                showToast('Please write a review.', 'error');
                return;
            }
            const userName = currentUser ? currentUser.name : 'Anonymous';
            addReview(place, selectedRating, review, userName);
            closeModal();
            showToast('Review for ' + place + ' submitted!', 'success');
        });
    });
});

// ================== COMPLAINT FORM ==================

document.getElementById('complaintForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('complaintName').value.trim();
    const place = document.getElementById('complaintPlace').value.trim();
    const title = document.getElementById('complaintTitle').value.trim();
    const description = document.getElementById('complaintBody').value.trim();

    if (!name || !place || !title || !description) {
        showToast('Please fill in all fields.', 'error');
        return;
    }

    addComplaint(name, place, title, description, currentUser ? currentUser.id : null);
    this.reset();

    if (currentUser && currentUser.role === 'admin') {
        loadDashboardData();
    }

    showToast('Complaint submitted! Stored locally.', 'success');
});

// ==================== Dashboard (Admin Only) ====================

function loadDashboardData() {
    if (!currentUser || currentUser.role !== 'admin') return;
    const complaints = getComplaints();

    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;

    document.getElementById('totalComplaints').textContent = total.toLocaleString();
    document.getElementById('pendingComplaints').textContent = pending.toLocaleString();
    document.getElementById('resolvedComplaints').textContent = resolved.toLocaleString();
    document.getElementById('avgDays').textContent = '—';

    const tbody = document.querySelector('#complaintTable tbody');
    tbody.innerHTML = '';
    complaints.forEach(c => {
        const statusClass = c.status === 'pending' ? 'status-pending' : 'status-resolved';
        const statusLabel = c.status.charAt(0).toUpperCase() + c.status.slice(1);
        const isResolved = c.status === 'resolved';
        const actionBtn = isResolved
            ? '<button class="btn btn-sm btn-outline" disabled>Resolved</button>'
            : `<button class="btn btn-sm btn-green resolve-btn" data-id="${c.id}">Resolve</button>`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="badge-id">#${c.id}</span></td>
            <td>${c.title}</td>
            <td>${c.place}</td>
            <td><span class="status ${statusClass}">${statusLabel}</span></td>
            <td>${actionBtn}</td>
        `;
        tbody.appendChild(row);
    });

    document.querySelectorAll('.resolve-btn').forEach(btn => {
        btn.addEventListener('click', resolveComplaint);
    });
}

function resolveComplaint() {
    const id = this.dataset.id;
    const row = this.closest('tr');
    resolveComplaintById(id);

    const statusCell = row.querySelector('.status');
    statusCell.className = 'status status-resolved';
    statusCell.textContent = 'Resolved';
    this.textContent = 'Resolved';
    this.disabled = true;
    this.className = 'btn btn-sm btn-outline';
    loadDashboardData();
    showToast('Complaint #' + id + ' marked as resolved.', 'success');
}

// ==================== Load public hero stats ====================

(function loadPublicStats() {
    const reviews = getReviews();
    const complaints = getComplaints();
    const resolved = complaints.filter(c => c.status === 'resolved').length;

    const statDivs = document.querySelectorAll('.hero-stats div strong');
    if (statDivs.length >= 3) {
        statDivs[0].textContent = reviews.length.toLocaleString();
        statDivs[1].textContent = complaints.length.toLocaleString();
        statDivs[2].textContent = resolved.toLocaleString();
    }
})();

})();
