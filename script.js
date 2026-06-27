// ================================================================
// TRAVELVOICE - FRONTEND SCRIPT (PHP Backend)
// ================================================================
// All data is stored in MySQL via PHP API endpoints.
// API base URL — change this if the server is remote.
// ================================================================

const API_BASE = '/travelvoice/api';

// ==================== UTILITY: API Call Helper ====================

async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
    };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(API_BASE + endpoint, options);
    const data = await res.json();
    if (!res.ok && data.error) throw new Error(data.error);
    return data;
}

// ==================== Mobile Hamburger Menu ====================

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

// ==================== Active Nav Link on Scroll ====================

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

// ==================== Modal System ====================

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

// ==================== Toast System ====================

function showToast(message, type = 'success') {
    const toast = document.getElementById('complaintToast');
    toast.textContent = message;
    toast.className = 'toast ' + type + ' show';
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// ==================== Dark Mode ====================

const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

function getTheme() {
    return localStorage.getItem('tv_theme') || 'light';
}

function setTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeIcon.className = 'fas fa-moon';
    }
    localStorage.setItem('tv_theme', theme);
}

setTheme(getTheme());

themeToggle.addEventListener('click', () => {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
});

// ==================== Auth UI State ====================

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

// ==================== Admin Access Control ====================

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

// ==================== Check Session on Page Load ====================

(async function initAuth() {
    try {
        const data = await apiCall('/check_session.php');
        if (data.logged_in && data.user) {
            currentUser = data.user;
        }
    } catch (e) {
        // Not logged in — that's fine
    }
    updateAuthUI();
})();

// ==================== Signup ====================

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

    document.getElementById('signupForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const role = document.getElementById('signupRole').value;
        const adminCode = document.getElementById('adminCode')?.value || '';

        try {
            const data = await apiCall('/signup.php', 'POST', {
                name, email, password, role, admin_code: adminCode
            });
            currentUser = data.user;
            updateAuthUI();
            closeModal();
            showToast('Account created! Welcome, ' + data.user.name + '.', 'success');
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    document.getElementById('switchToLogin')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
        document.getElementById('loginBtn').click();
    });
});

// ==================== Login ====================

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

    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        try {
            const data = await apiCall('/login.php', 'POST', { email, password });
            currentUser = data.user;
            updateAuthUI();
            closeModal();
            showToast('Logged in as ' + data.user.name + ' (' + data.user.role + ')', 'success');
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    document.getElementById('switchToSignup')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
        document.getElementById('signupBtn').click();
    });
});

// ==================== Logout ====================

document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await apiCall('/logout.php', 'POST');
    } catch (e) { /* ignore */ }
    currentUser = null;
    updateAuthUI();
    showToast('Logged out successfully.', 'success');
});

// ==================== Search ====================

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
        searchPlace(category);
        document.getElementById('explore').scrollIntoView({ behavior: 'smooth' });
    });
});

// ==================== Review Buttons ====================

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
        document.getElementById('reviewForm').addEventListener('submit', async function(e) {
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
            try {
                await apiCall('/reviews.php', 'POST', {
                    place, rating: selectedRating, review, user_name: userName
                });
                closeModal();
                showToast('Review for ' + place + ' submitted! Thank you.', 'success');
            } catch (err) {
                showToast(err.message, 'error');
            }
        });
    });
});

// ==================== Complaint Form ====================

document.getElementById('complaintForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('complaintName').value.trim();
    const place = document.getElementById('complaintPlace').value.trim();
    const title = document.getElementById('complaintTitle').value.trim();
    const description = document.getElementById('complaintBody').value.trim();

    if (!name || !place || !title || !description) {
        showToast('Please fill in all fields.', 'error');
        return;
    }

    try {
        const data = await apiCall('/complaints.php', 'POST', {
            name, place, title, description
        });
        this.reset();

        // If admin is logged in, refresh dashboard table
        if (currentUser && currentUser.role === 'admin') {
            loadDashboardData();
        }

        showToast('Complaint submitted successfully!', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
});

// ==================== Dashboard (Admin Only) ====================

async function loadDashboardData() {
    if (!currentUser || currentUser.role !== 'admin') return;

    try {
        const data = await apiCall('/dashboard.php');

        // Update stats
        document.getElementById('totalComplaints').textContent = data.stats.total.toLocaleString();
        document.getElementById('pendingComplaints').textContent = data.stats.pending.toLocaleString();
        document.getElementById('resolvedComplaints').textContent = data.stats.resolved.toLocaleString();
        document.getElementById('avgDays').textContent = data.stats.avg_days;

        // Update table
        const tbody = document.querySelector('#complaintTable tbody');
        tbody.innerHTML = '';
        data.complaints.forEach(c => {
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

        // Re-bind resolve buttons
        document.querySelectorAll('.resolve-btn').forEach(btn => {
            btn.addEventListener('click', resolveComplaint);
        });

    } catch (err) {
        console.error('Failed to load dashboard:', err);
    }
}

// ==================== Resolve Complaint (Admin Only) ====================

async function resolveComplaint() {
    const btn = this;
    const id = parseInt(btn.dataset.id);
    const row = btn.closest('tr');

    try {
        await apiCall('/resolve.php', 'POST', { id });
        const statusCell = row.querySelector('.status');
        statusCell.className = 'status status-resolved';
        statusCell.textContent = 'Resolved';
        btn.textContent = 'Resolved';
        btn.disabled = true;
        btn.className = 'btn btn-sm btn-outline';
        loadDashboardData();
        showToast('Complaint #' + id + ' marked as resolved.', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ==================== Load public hero stats from DB ====================

(async function loadPublicStats() {
    try {
        const data = await apiCall('/stats.php');
        const statDivs = document.querySelectorAll('.hero-stats div strong');
        if (statDivs.length >= 3) {
            statDivs[0].textContent = data.stats.reviews;
            statDivs[1].textContent = data.stats.complaints;
            statDivs[2].textContent = data.stats.resolved;
        }
    } catch (e) {
        // Keep default static numbers if API fails
    }
})();

// ==================== Load reviews from DB onto page ====================

(async function loadReviews() {
    const container = document.getElementById('reviewsList');
    try {
        const data = await apiCall('/reviews.php');
        if (!data.reviews || data.reviews.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-light);">No reviews yet. Be the first!</p>';
            return;
        }
        container.innerHTML = data.reviews.map(r => {
            const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
            const date = new Date(r.created_at).toLocaleDateString();
            return `
                <div class="review-item">
                    <div class="review-item-header">
                        <span class="review-item-place">${r.place}</span>
                        <span class="review-item-rating">${stars}</span>
                    </div>
                    <div class="review-item-text">${r.review}</div>
                    <div class="review-item-meta">
                        <span>👤 ${r.user_name}</span>
                        <span>📅 ${date}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-light);">Could not load reviews.</p>';
    }
})();