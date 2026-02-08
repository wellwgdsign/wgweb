const firebaseConfig = {
    apiKey: "AIzaSyBxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx",
    authDomain: "wgdsign-studio.firebaseapp.com",
    projectId: "wgdsign-studio",
    storageBucket: "wgdsign-studio.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:xxxxxxxxxxxxxxxxxxxx"
};

let firebaseApp = null;
let firebaseAuth = null;
let googleProvider = null;
let currentUser = null;

function initFirebase() {
    if (typeof firebase !== 'undefined') {
        firebaseApp = firebase.initializeApp(firebaseConfig);
        firebaseAuth = firebase.auth();
        googleProvider = new firebase.auth.GoogleAuthProvider();

        firebaseAuth.onAuthStateChanged((user) => {
            if (user) {
                currentUser = {
                    uid: user.uid,
                    name: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    avatar: user.photoURL || null,
                    provider: user.providerData[0]?.providerId || 'email'
                };
                saveUserData(currentUser);
                updateAuthUI(true);
            } else {
                currentUser = null;
                updateAuthUI(false);
            }
        });
    } else {
        const saved = localStorage.getItem('wgdsign_user');
        if (saved) {
            currentUser = JSON.parse(saved);
            updateAuthUI(true);
        }
    }
}

function saveUserData(user) {
    localStorage.setItem('wgdsign_user', JSON.stringify(user));
}

function updateAuthUI(isLoggedIn) {
    const authBtn = document.getElementById('authBtn');
    const authBtnMobile = document.getElementById('authBtnMobile');

    if (isLoggedIn && currentUser) {
        const avatarHTML = currentUser.avatar
            ? `<img src="${currentUser.avatar}" alt="${currentUser.name}" class="user-avatar-small">`
            : `<i class="ri-user-line"></i>`;

        if (authBtn) {
            authBtn.innerHTML = `${avatarHTML} <span class="auth-btn-name">${currentUser.name.split(' ')[0]}</span>`;
            authBtn.onclick = () => { window.location.href = getBasePath() + 'pages/painel.html'; };
            authBtn.classList.add('logged-in');
        }
        if (authBtnMobile) {
            authBtnMobile.innerHTML = `${avatarHTML} <span>Meu Painel</span>`;
            authBtnMobile.onclick = () => { window.location.href = getBasePath() + 'pages/painel.html'; };
        }
    } else {
        if (authBtn) {
            authBtn.innerHTML = `<i class="ri-user-line"></i> <span class="auth-btn-name">Entrar</span>`;
            authBtn.onclick = openAuthModal;
            authBtn.classList.remove('logged-in');
        }
        if (authBtnMobile) {
            authBtnMobile.innerHTML = `<i class="ri-user-line"></i> <span>Entrar / Cadastrar</span>`;
            authBtnMobile.onclick = openAuthModal;
        }
    }
}

function getBasePath() {
    const path = window.location.pathname;
    if (path.includes('/pages/')) {
        return '../';
    }
    return '';
}

function openAuthModal() {
    const modal = document.getElementById('authModal');
    const overlay = document.getElementById('authOverlay');
    if (modal && overlay) {
        modal.classList.add('open');
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        showLoginTab();
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    const overlay = document.getElementById('authOverlay');
    if (modal && overlay) {
        modal.classList.remove('open');
        overlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function showLoginTab() {
    document.getElementById('loginForm')?.classList.add('active');
    document.getElementById('registerForm')?.classList.remove('active');
    const header = document.getElementById('authModalHeader');
    if (header) {
        header.querySelector('h2').textContent = 'Entrar na conta';
        header.querySelector('p').textContent = 'Acesse seu painel para gerenciar compras e downloads';
    }
}

function showRegisterTab() {
    document.getElementById('loginForm')?.classList.remove('active');
    document.getElementById('registerForm')?.classList.add('active');
    const header = document.getElementById('authModalHeader');
    if (header) {
        header.querySelector('h2').textContent = 'Criar uma conta';
        header.querySelector('p').textContent = 'Cadastre-se para acessar todos os recursos da loja';
    }
}

async function handleGoogleLogin() {
    if (firebaseAuth && googleProvider) {
        try {
            const result = await firebaseAuth.signInWithPopup(googleProvider);
            closeAuthModal();
            showToast('Login realizado com sucesso!', 'success');
        } catch (error) {
            if (error.code === 'auth/popup-closed-by-user') return;
            showToast('Erro ao fazer login com Google: ' + error.message, 'error');
        }
    } else {
        simulateGoogleLogin();
    }
}

function simulateGoogleLogin() {
    const mockUser = {
        uid: 'google_' + Date.now(),
        name: 'Usuario Google',
        email: 'usuario@gmail.com',
        avatar: null,
        provider: 'google.com'
    };
    currentUser = mockUser;
    saveUserData(currentUser);
    updateAuthUI(true);
    closeAuthModal();
    showToast('Login com Google realizado!', 'success');
}

async function handleEmailLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) {
        showToast('Preencha todos os campos!', 'error');
        return;
    }

    if (firebaseAuth) {
        try {
            await firebaseAuth.signInWithEmailAndPassword(email, password);
            closeAuthModal();
            showToast('Login realizado com sucesso!', 'success');
        } catch (error) {
            const errorMessages = {
                'auth/user-not-found': 'Usuario nao encontrado.',
                'auth/wrong-password': 'Senha incorreta.',
                'auth/invalid-email': 'Email invalido.',
                'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.'
            };
            showToast(errorMessages[error.code] || 'Erro ao fazer login.', 'error');
        }
    } else {
        const users = JSON.parse(localStorage.getItem('wgdsign_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            currentUser = { uid: user.uid, name: user.name, email: user.email, avatar: null, provider: 'email' };
            saveUserData(currentUser);
            updateAuthUI(true);
            closeAuthModal();
            showToast('Login realizado com sucesso!', 'success');
        } else {
            showToast('Email ou senha incorretos.', 'error');
        }
    }
}

async function handleEmailRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName')?.value;
    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;
    const confirmPassword = document.getElementById('registerConfirmPassword')?.value;

    if (!name || !email || !password || !confirmPassword) {
        showToast('Preencha todos os campos!', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('A senha deve ter pelo menos 6 caracteres.', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('As senhas nao coincidem!', 'error');
        return;
    }

    if (firebaseAuth) {
        try {
            const result = await firebaseAuth.createUserWithEmailAndPassword(email, password);
            await result.user.updateProfile({ displayName: name });
            closeAuthModal();
            showToast('Conta criada com sucesso!', 'success');
        } catch (error) {
            const errorMessages = {
                'auth/email-already-in-use': 'Este email ja esta em uso.',
                'auth/invalid-email': 'Email invalido.',
                'auth/weak-password': 'Senha muito fraca.'
            };
            showToast(errorMessages[error.code] || 'Erro ao criar conta.', 'error');
        }
    } else {
        const users = JSON.parse(localStorage.getItem('wgdsign_users') || '[]');

        if (users.find(u => u.email === email)) {
            showToast('Este email ja esta cadastrado.', 'error');
            return;
        }

        const newUser = {
            uid: 'local_' + Date.now(),
            name: name,
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('wgdsign_users', JSON.stringify(users));

        currentUser = { uid: newUser.uid, name: newUser.name, email: newUser.email, avatar: null, provider: 'email' };
        saveUserData(currentUser);
        updateAuthUI(true);
        closeAuthModal();
        showToast('Conta criada com sucesso!', 'success');
    }
}

function logoutUser() {
    if (firebaseAuth) {
        firebaseAuth.signOut();
    }
    currentUser = null;
    localStorage.removeItem('wgdsign_user');
    updateAuthUI(false);

    if (window.location.pathname.includes('painel.html')) {
        window.location.href = '../index.html';
    } else {
        showToast('Voce saiu da sua conta.', 'success');
    }
}

function addPurchaseToHistory(orderData) {
    if (!currentUser) return;

    try {
        var purchases = JSON.parse(localStorage.getItem('wgdsign_purchases_' + currentUser.uid) || '[]');

        var purchase = {
            id: 'ORD-' + Date.now(),
            date: new Date().toISOString(),
            items: orderData.items.map(function(item) {
                return { id: Number(item.id), name: item.name, price: Number(item.price), image: item.image };
            }),
            total: Number(orderData.total),
            paymentMethod: orderData.paymentMethod,
            status: 'approved'
        };

        purchases.unshift(purchase);
        localStorage.setItem('wgdsign_purchases_' + currentUser.uid, JSON.stringify(purchases));

        var downloads = JSON.parse(localStorage.getItem('wgdsign_downloads_' + currentUser.uid) || '[]');
        var allFiles = JSON.parse(localStorage.getItem('wgdsign_download_files') || '{}');

        orderData.items.forEach(function(item) {
            var itemId = Number(item.id);
            if (!downloads.find(function(d) { return Number(d.productId) === itemId; })) {
                var productFiles = allFiles[itemId] || allFiles[item.id] || [];
                downloads.push({
                    productId: itemId,
                    name: item.name,
                    image: item.image,
                    purchaseDate: new Date().toISOString(),
                    files: productFiles.map(function(f) {
                        return { id: f.id, name: f.name, size: f.size, type: f.type, storedInIDB: f.storedInIDB || false };
                    }),
                    downloaded: false
                });
            }
        });
        localStorage.setItem('wgdsign_downloads_' + currentUser.uid, JSON.stringify(downloads));
    } catch (e) {
        if (typeof showToast === 'function') {
            showToast('Erro ao registrar compra: ' + e.message, 'error');
        }
    }
}

function getPurchaseHistory() {
    if (!currentUser) return [];
    try {
        return JSON.parse(localStorage.getItem('wgdsign_purchases_' + currentUser.uid) || '[]');
    } catch (e) { return []; }
}

function getDownloads() {
    if (!currentUser) return [];
    try {
        return JSON.parse(localStorage.getItem('wgdsign_downloads_' + currentUser.uid) || '[]');
    } catch (e) { return []; }
}

function createAuthModalHTML() {
    return `
    <div class="auth-modal" id="authModal">
        <div class="auth-modal-content">
            <button class="auth-modal-close" onclick="closeAuthModal()">
                <i class="ri-close-line"></i>
            </button>
            <div class="auth-modal-header" id="authModalHeader">
                <h2>Entrar na conta</h2>
                <p>Acesse seu painel para gerenciar compras e downloads</p>
            </div>
            <div class="auth-forms">
                <form class="auth-form active" id="loginForm" onsubmit="handleEmailLogin(event)">
                    <button type="button" class="google-btn" onclick="handleGoogleLogin()">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Continuar com Google</span>
                    </button>
                    <div class="auth-divider">
                        <span>ou entre com email</span>
                    </div>
                    <div class="auth-field">
                        <i class="ri-mail-line"></i>
                        <input type="email" id="loginEmail" placeholder="Seu email" required>
                    </div>
                    <div class="auth-field">
                        <i class="ri-lock-line"></i>
                        <input type="password" id="loginPassword" placeholder="Sua senha" required>
                    </div>
                    <button type="submit" class="auth-submit">Entrar</button>
                    <p class="auth-switch">Nao tem conta? <a onclick="showRegisterTab(); return false;">Cadastre-se gratuitamente</a></p>
                </form>
                <form class="auth-form" id="registerForm" onsubmit="handleEmailRegister(event)">
                    <button type="button" class="google-btn" onclick="handleGoogleLogin()">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span>Cadastrar com Google</span>
                    </button>
                    <div class="auth-divider">
                        <span>ou cadastre com email</span>
                    </div>
                    <div class="auth-field">
                        <i class="ri-user-line"></i>
                        <input type="text" id="registerName" placeholder="Seu nome completo" required>
                    </div>
                    <div class="auth-field">
                        <i class="ri-mail-line"></i>
                        <input type="email" id="registerEmail" placeholder="Seu email" required>
                    </div>
                    <div class="auth-field">
                        <i class="ri-lock-line"></i>
                        <input type="password" id="registerPassword" placeholder="Criar senha (min. 6 caracteres)" required>
                    </div>
                    <div class="auth-field">
                        <i class="ri-lock-line"></i>
                        <input type="password" id="registerConfirmPassword" placeholder="Confirmar senha" required>
                    </div>
                    <button type="submit" class="auth-submit">Criar Conta</button>
                    <p class="auth-switch">Ja tem conta? <a onclick="showLoginTab(); return false;">Entrar</a></p>
                    <p class="auth-terms">Ao criar conta, voce aceita os <a href="#">Termos de Uso</a> e <a href="#">Politica de Privacidade</a></p>
                </form>
            </div>
        </div>
    </div>
    <div class="auth-overlay" id="authOverlay" onclick="closeAuthModal()"></div>`;
}

document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    const authHTML = createAuthModalHTML();
    body.insertAdjacentHTML('beforeend', authHTML);
    initFirebase();
});

function isAdminUser() {
    var adminEmails = ['admin@wgdsign.com', 'wgdsign@gmail.com'];
    if (!currentUser) {
        var saved = localStorage.getItem('wgdsign_user');
        if (saved) {
            var u = JSON.parse(saved);
            return adminEmails.includes(u.email.toLowerCase());
        }
        return false;
    }
    return adminEmails.includes(currentUser.email.toLowerCase());
}
