const defaultProducts = [
    { id: 1, name: 'Launcher 01', price: 2.00, category: 'launchers', image: 'assets/img/launchers/l-1.jpg', description: 'Layout PSD moderno e impactante, criado especialmente para servidores de Mu Online que buscam um visual marcante e profissional.', badge: 'Premium', discount: 0, tag: 'Premium', fileTags: ['PSD'], active: true },
    { id: 2, name: 'Logo 01', price: 6.00, category: 'logos', image: 'assets/img/logos/logo-01.jpg', description: 'Identidade visual moderna e impactante, desenvolvida especialmente para servidores de Mu Online.', badge: '', discount: 0, tag: '', fileTags: ['PSD'], active: true },
    { id: 3, name: 'Launcher 02', price: 2.00, category: 'launchers', image: 'assets/img/launchers/l-2.jpg', description: 'Layout PSD moderno e impactante, com interface intuitiva e botoes bem posicionados.', badge: 'Premium', discount: 0, tag: 'Premium', fileTags: ['PSD'], active: true },
    { id: 4, name: 'Template 01', price: 10.00, oldPrice: 10.00, category: 'templates', image: 'assets/img/templates/tema-01.jpg', description: 'Layout PSD moderno e elegante, com janelas de login e cadastro totalmente editaveis.', badge: '-12%', discount: 12, tag: 'Promocao', fileTags: ['PSD', 'HTML', 'CSS'], sale: true, active: true },
    { id: 5, name: 'Pack 01', price: 8.00, category: 'banners', image: 'assets/img/banners/01.jpg', description: 'Colecao de banners em alta qualidade, prontos para serem ajustados ao estilo do seu servidor.', badge: '', discount: 0, tag: '', active: true },
    { id: 6, name: 'Launcher 03', price: 7.00, oldPrice: 5.00, category: 'launchers', image: 'assets/img/launchers/l-3.jpg', description: 'Layout PSD moderno e leve, desenvolvido para servidores de Mu Online que buscam um visual limpo.', badge: '-18%', discount: 18, tag: 'Promocao', sale: true, active: true },
    { id: 7, name: 'Pack 02', price: 8.00, category: 'banners', image: 'assets/img/banners/02.jpg', description: 'Colecao de 6 banners profissionais para redes sociais e divulgacao.', badge: '', discount: 0, tag: '', active: true },
    { id: 8, name: 'Template 02', price: 8.00, category: 'templates', image: 'assets/img/templates/tema-02.jpg', description: 'Template classico com tema de fogo para servidores MuOnline.', badge: '', discount: 0, tag: '', active: true }
];

function initDefaultProducts() {
    var existing = localStorage.getItem('wgdsign_products');
    if (!existing) {
        localStorage.setItem('wgdsign_products', JSON.stringify(defaultProducts));
    }
}

function getFileTagIcon(tag) {
    var icons = {
        'PSD': '<svg class="file-icon" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#31A8FF"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">Ps</text></svg>',
        'HTML': '<svg class="file-icon" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#E44D26"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">HTML</text></svg>',
        'CSS': '<svg class="file-icon" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#264DE4"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">CSS</text></svg>',
        'JS': '<svg class="file-icon" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F7DF1E"/><text x="12" y="16" text-anchor="middle" fill="#000" font-size="8" font-weight="bold">JS</text></svg>',
        'PHP': '<svg class="file-icon" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#777BB3"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">PHP</text></svg>',
        'PNG': '<svg class="file-icon" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#0D9488"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">PNG</text></svg>',
        'JPG': '<svg class="file-icon" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#0D9488"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">JPG</text></svg>',
        'SVG': '<svg class="file-icon" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#FFB13B"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">SVG</text></svg>',
        'AI': '<svg class="file-icon" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#FF9A00"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">Ai</text></svg>',
        'FIGMA': '<svg class="file-icon" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#A259FF"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="6" font-weight="bold">FIG</text></svg>'
    };
    return icons[tag] || '';
}

function renderFileTagsIcons(fileTags) {
    if (!fileTags || !fileTags.length) return '';
    var html = '<div class="file-tags-icons">';
    fileTags.forEach(function(tag) { html += getFileTagIcon(tag); });
    html += '</div>';
    return html;
}

function getActiveProducts() {
    initDefaultProducts();
    var stored = localStorage.getItem('wgdsign_products');
    if (stored) {
        var all = JSON.parse(stored);
        return all.filter(function(p) { return p.active !== false; });
    }
    return defaultProducts;
}

var products = getActiveProducts();

var CART_VERSION = 'v3';

function loadCart() {
    try {
        var ver = localStorage.getItem('mudesign_cart_version');
        if (ver !== CART_VERSION) {
            localStorage.removeItem('mudesign_cart');
            localStorage.setItem('mudesign_cart_version', CART_VERSION);
            return [];
        }
        var raw = localStorage.getItem('mudesign_cart');
        if (!raw) return [];
        var parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) { localStorage.removeItem('mudesign_cart'); return []; }
        var valid = [];
        for (var i = 0; i < parsed.length; i++) {
            var item = parsed[i];
            if (item && item.id !== undefined && item.id !== null && item.name) {
                valid.push({
                    id: Number(item.id),
                    name: String(item.name),
                    price: Number(item.price) || 0,
                    image: item.image || ''
                });
            }
        }
        return valid;
    } catch(e) {
        localStorage.removeItem('mudesign_cart');
        return [];
    }
}

var cart = loadCart();

function saveCart() {
    try {
        localStorage.setItem('mudesign_cart', JSON.stringify(cart));
    } catch(e) {}
}

function validateCart() {
    var activeProducts = getActiveProducts();
    var validCart = [];
    for (var i = 0; i < cart.length; i++) {
        var found = false;
        for (var j = 0; j < activeProducts.length; j++) {
            if (Number(activeProducts[j].id) === Number(cart[i].id)) {
                found = true;
                break;
            }
        }
        if (found) {
            validCart.push(cart[i]);
        }
    }
    if (validCart.length !== cart.length) {
        cart = validCart;
        saveCart();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initFrontendCategories();
    products = getActiveProducts();
    validateCart();
    initNavbar();
    initPortfolioFilters();
    initShopFilters();
    initCart();
    initContactForm();
    initSlider();
    updateCartUI();
    renderDynamicShop();
    renderDynamicPortfolio();
    initTestimonialsSlider();
    initLogoTypewriter();
});

function initLogoTypewriter() {
    var elements = document.querySelectorAll('nav .logo-text, .navbar .logo-text, header .logo-text');
    if (!elements.length) {
        elements = document.querySelectorAll('.logo .logo-text');
    }

    var texts = ['WGDS Studio', 'Web Design', 'Design Grafico'];
    var textIndex = 0;
    var charIndex = 0;
    var isDeleting = false;
    var typeSpeed = 100;
    var deleteSpeed = 60;
    var pauseAfterType = 2000;
    var pauseAfterDelete = 300;

    function tick() {
        var current = texts[textIndex];

        if (!isDeleting) {
            charIndex++;
            if (charIndex > current.length) {
                setTimeout(function() { isDeleting = true; tick(); }, pauseAfterType);
                return;
            }
        } else {
            charIndex--;
            if (charIndex < 0) {
                charIndex = 0;
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                setTimeout(tick, pauseAfterDelete);
                return;
            }
        }

        elements.forEach(function(el) {
            el.textContent = current.substring(0, charIndex);
        });

        setTimeout(tick, isDeleting ? deleteSpeed : typeSpeed);
    }

    tick();
}

function initFrontendCategories() {
    var existing = localStorage.getItem('wgdsign_categories');
    if (!existing) {
        var defaults = [
            { id: 1, name: 'Launchers', slug: 'launchers', icon: 'ri-rocket-2-line', description: 'Game Launchers para servidores', type: 'ambos', active: true },
            { id: 2, name: 'Templates', slug: 'templates', icon: 'ri-layout-4-line', description: 'Templates web para servidores', type: 'ambos', active: true },
            { id: 3, name: 'Logos', slug: 'logos', icon: 'ri-pen-nib-line', description: 'Logotipos e identidade visual', type: 'ambos', active: true },
            { id: 4, name: 'Banners', slug: 'banners', icon: 'ri-image-line', description: 'Banners para redes sociais', type: 'ambos', active: true }
        ];
        localStorage.setItem('wgdsign_categories', JSON.stringify(defaults));
    }
}

function initNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    mobileMenuBtn?.addEventListener('click', () => {
        navMenu?.classList.toggle('open');
        mobileMenuBtn.classList.toggle('active');
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            navMenu?.classList.remove('open');
            mobileMenuBtn?.classList.remove('active');
        });
    });
    
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(l => l.classList.remove('active'));
                navLink?.classList.add('active');
            }
        });
    });
}

function getFrontendCategories(type) {
    var stored = localStorage.getItem('wgdsign_categories');
    if (stored) {
        var all = JSON.parse(stored);
        var active = all.filter(function(c) { return c.active; });
        if (type === 'shop') return active.filter(function(c) { return c.type === 'shop' || c.type === 'ambos'; });
        if (type === 'portfolio') return active.filter(function(c) { return c.type === 'portfolio' || c.type === 'ambos'; });
        return active;
    }
    return [
        { name: 'Launchers', slug: 'launchers' },
        { name: 'Templates', slug: 'templates' },
        { name: 'Logos', slug: 'logos' },
        { name: 'Banners', slug: 'banners' }
    ];
}

function renderPortfolioFilterButtons() {
    var container = document.querySelector('.portfolio-filters');
    if (!container) return;

    var categories = getFrontendCategories('portfolio');
    container.innerHTML = '';

    var allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.dataset.filter = 'all';
    allBtn.textContent = 'Todos';
    container.appendChild(allBtn);

    categories.forEach(function(cat) {
        var btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.filter = cat.slug;
        btn.textContent = cat.name;
        container.appendChild(btn);
    });
}

function renderShopFilterButtons() {
    var container = document.querySelector('.shop-filters');
    if (!container) return;

    var categories = getFrontendCategories('shop');
    container.innerHTML = '';

    var allBtn = document.createElement('button');
    allBtn.className = 'shop-filter-btn active';
    allBtn.dataset.filter = 'all';
    allBtn.textContent = 'Todos';
    container.appendChild(allBtn);

    categories.forEach(function(cat) {
        var btn = document.createElement('button');
        btn.className = 'shop-filter-btn';
        btn.dataset.filter = cat.slug;
        btn.textContent = cat.name;
        container.appendChild(btn);
    });
}

function initPortfolioFilters() {
    var isSubPage = window.location.pathname.includes('/pages/');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            newBtn.classList.add('active');
            
            const filter = newBtn.dataset.filter;
            if (filter === 'all' && !isSubPage) {
                filterPortfolioOnePerCategory();
            } else {
                document.querySelectorAll('.portfolio-item').forEach(item => {
                    if (filter === 'all' || item.dataset.category === filter) {
                        item.style.display = 'block';
                        item.style.animation = 'fadeIn 0.5s ease';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }
        });
    });
}

function initShopFilters() {
    const filterBtns = document.querySelectorAll('.shop-filter-btn');
    
    filterBtns.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', () => {
            document.querySelectorAll('.shop-filter-btn').forEach(b => b.classList.remove('active'));
            newBtn.classList.add('active');
            
            const filter = newBtn.dataset.filter;
            document.querySelectorAll('.product-card').forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                    card.style.animation = 'fadeIn 0.5s ease';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

function initCart() {
    const cartBtn = document.getElementById('cartBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const cartClose = document.getElementById('cartClose');
    const cartOverlay = document.getElementById('cartOverlay');
    
    cartBtn?.addEventListener('click', () => {
        cartSidebar?.classList.add('open');
        cartOverlay?.classList.add('open');
        document.body.style.overflow = 'hidden';
    });
    
    const closeCart = () => {
        cartSidebar?.classList.remove('open');
        cartOverlay?.classList.remove('open');
        document.body.style.overflow = '';
    };
    
    cartClose?.addEventListener('click', closeCart);
    cartOverlay?.addEventListener('click', closeCart);
}

function addToCart(productId) {
    productId = Number(productId);
    products = getActiveProducts();

    var product = null;
    for (var i = 0; i < products.length; i++) {
        if (Number(products[i].id) === productId) {
            product = products[i];
            break;
        }
    }

    if (!product) {
        showToast('Produto nao encontrado!', 'error');
        return;
    }

    var alreadyInCart = false;
    for (var j = 0; j < cart.length; j++) {
        if (Number(cart[j].id) === productId) {
            alreadyInCart = true;
            break;
        }
    }

    if (alreadyInCart) {
        showToast('Produto ja esta no carrinho!', 'error');
        return;
    }

    cart.push({
        id: productId,
        name: String(product.name),
        price: Number(product.price) || 0,
        image: product.image || ''
    });

    saveCart();
    updateCartUI();
    showToast(product.name + ' adicionado ao carrinho!', 'success');
}

function removeFromCart(productId) {
    productId = Number(productId);
    var newCart = [];
    for (var i = 0; i < cart.length; i++) {
        if (Number(cart[i].id) !== productId) {
            newCart.push(cart[i]);
        }
    }
    cart = newCart;
    saveCart();
    updateCartUI();
    showToast('Produto removido do carrinho', 'success');
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
    
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="cart-empty"><i class="ri-shopping-cart-line"></i><p>Seu carrinho esta vazio</p></div>';
            if (cartFooter) cartFooter.style.display = 'none';
        } else {
            cartItems.innerHTML = cart.map(function(item) {
                var price = Number(item.price);
                return '<div class="cart-item">' +
                    '<div class="cart-item-image"><img src="' + item.image + '" alt="' + item.name + '"></div>' +
                    '<div class="cart-item-info">' +
                        '<div class="cart-item-name">' + item.name + '</div>' +
                        '<div class="cart-item-price">R$ ' + price.toFixed(2).replace('.', ',') + '</div>' +
                    '</div>' +
                    '<button class="cart-item-remove" onclick="removeFromCart(' + item.id + ')">' +
                        '<i class="ri-delete-bin-line"></i>' +
                    '</button>' +
                '</div>';
            }).join('');
            
            if (cartFooter) cartFooter.style.display = 'block';
            
            var total = cart.reduce(function(sum, item) { return sum + Number(item.price); }, 0);
            if (cartTotal) cartTotal.textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
        }
    }
}

function openCheckout() {
    if (cart.length === 0) {
        showToast('Adicione produtos ao carrinho primeiro!', 'error');
        return;
    }
    
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutOverlay = document.getElementById('checkoutOverlay');
    const summaryItems = document.getElementById('summaryItems');
    var summaryTotal = document.getElementById('summaryTotal');
    var cartSidebar = document.getElementById('cartSidebar');
    var cartOverlay = document.getElementById('cartOverlay');
    
    if (cartSidebar) cartSidebar.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('open');
    
    if (summaryItems) {
        summaryItems.innerHTML = cart.map(function(item) {
            return '<div class="summary-item">' +
                '<span class="summary-item-name">' + item.name + '</span>' +
                '<span>R$ ' + Number(item.price).toFixed(2).replace('.', ',') + '</span>' +
            '</div>';
        }).join('');
    }
    
    var total = cart.reduce(function(sum, item) { return sum + Number(item.price); }, 0);
    if (summaryTotal) summaryTotal.textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
    
    if (checkoutModal) checkoutModal.classList.add('open');
    if (checkoutOverlay) checkoutOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    initCheckoutForm();
}

function closeCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutOverlay = document.getElementById('checkoutOverlay');
    
    checkoutModal?.classList.remove('open');
    checkoutOverlay?.classList.remove('open');
    document.body.style.overflow = '';
}

var _checkoutInitialized = false;
function initCheckoutForm() {
    if (_checkoutInitialized) return;
    _checkoutInitialized = true;

    var checkoutForm = document.getElementById('checkoutForm');
    var checkoutOverlay = document.getElementById('checkoutOverlay');

    if (checkoutOverlay) checkoutOverlay.addEventListener('click', closeCheckout);
    if (checkoutForm) checkoutForm.addEventListener('submit', handleCheckout);
}

async function handleCheckout(e) {
    e.preventDefault();

    var name = document.getElementById('checkoutName') ? document.getElementById('checkoutName').value : '';
    var email = document.getElementById('checkoutEmail') ? document.getElementById('checkoutEmail').value : '';
    var phone = document.getElementById('checkoutPhone') ? document.getElementById('checkoutPhone').value : '';
    var name = document.getElementById('checkoutName') ? document.getElementById('checkoutName').value : '';
    var paymentRadio = document.querySelector('input[name="payment"]:checked');
    var paymentMethod = paymentRadio ? paymentRadio.value : 'pix';

    if (!name || !email || !phone || !name) {
        showToast('Preencha todos os campos!', 'error');
        return;
    }

    var total = cart.reduce(function(sum, item) { return sum + Number(item.price); }, 0);

    var orderData = {
        customer: { name: name, email: email, phone: phone, name: name },
        items: cart.map(function(item) { return { id: Number(item.id), name: item.name, price: Number(item.price), image: item.image }; }),
        total: total,
        paymentMethod: paymentMethod
    };

    var submitBtn = e.target.querySelector('button[type="submit"]');
    var originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Processando...';
    submitBtn.disabled = true;

    try {
        await processPayment(orderData);
    } catch (error) {
        console.error('Erro no checkout:', error);
        showToast('Erro ao processar pagamento. Tente novamente.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function processPayment(orderData) {
    switch (orderData.paymentMethod) {
        case 'pix':
            await processPixPaymentMP(orderData);
            break;
        case 'mercadopago':
            await processMercadoPagoCheckout(orderData);
            break;
        case 'boleto':
            await processBoletoPaymentMP(orderData);
            break;
        default:
            showToast('Metodo de pagamento invalido', 'error');
    }
}

function generatePix(orderData) {
    closeCheckout();
    
    const pixCode = generatePixCode(orderData);
    
    const pixModal = document.createElement('div');
    pixModal.className = 'pix-modal';
    pixModal.innerHTML = `
        <div class="pix-modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="pix-modal-content">
            <div class="pix-header">
                <h2><i class="ri-qr-code-line"></i> Pagamento via PIX</h2>
                <button onclick="this.closest('.pix-modal').remove()" class="pix-close">
                    <i class="ri-close-line"></i>
                </button>
            </div>
            <div class="pix-body">
                <div class="pix-qr">
                    <div class="qr-placeholder">
                        <i class="ri-qr-code-line"></i>
                        <p>QR Code PIX</p>
                    </div>
                </div>
                <div class="pix-info">
                    <p class="pix-value">Valor: <strong>R$ ${orderData.total.toFixed(2).replace('.', ',')}</strong></p>
                    <p class="pix-expiry">Valido por 30 minutos</p>
                </div>
                <div class="pix-copy">
                    <label>Codigo Pix Copia e Cola:</label>
                    <div class="pix-code-wrapper">
                        <input type="text" value="${pixCode}" readonly id="pixCodeInput">
                        <button onclick="copyPixCode()" class="copy-btn">
                            <i class="ri-file-copy-line"></i> Copiar
                        </button>
                    </div>
                </div>
                <div class="pix-instructions">
                    <h4>Como pagar:</h4>
                    <ol>
                        <li>Abra o app do seu banco</li>
                        <li>Escolha pagar com PIX</li>
                        <li>Escaneie o QR Code ou cole o codigo</li>
                        <li>Confirme o pagamento</li>
                    </ol>
                </div>
                <p class="pix-note">Apos o pagamento, voce recebera o acesso por email em ate 5 minutos.</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(pixModal);
    
    addPixStyles();
    
    sendOrderNotification(orderData, 'pix');
    if (typeof addPurchaseToHistory === 'function') addPurchaseToHistory(orderData);

    cart = [];
    saveCart();
    updateCartUI();
}

function generatePixCode(orderData) {
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `00020126580014BR.GOV.BCB.PIX0136${randomPart}${timestamp}5204000053039865802BR5925MUDESIGN STUDIO6009SAO PAULO62070503***6304`;
}

function copyPixCode() {
    const input = document.getElementById('pixCodeInput');
    input?.select();
    document.execCommand('copy');
    showToast('Codigo PIX copiado!', 'success');
}

function redirectMercadoPago(orderData) {
    closeCheckout();
    
    showToast('Redirecionando para Mercado Pago...', 'success');
    
    const mpModal = document.createElement('div');
    mpModal.className = 'mp-modal';
    mpModal.innerHTML = `
        <div class="mp-modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="mp-modal-content">
            <div class="mp-header">
                <h2><i class="ri-bank-card-line"></i> Mercado Pago</h2>
                <button onclick="this.closest('.mp-modal').remove()" class="mp-close">
                    <i class="ri-close-line"></i>
                </button>
            </div>
            <div class="mp-body">
                <div class="mp-loading">
                    <i class="ri-loader-4-line spinning"></i>
                    <p>Preparando checkout...</p>
                </div>
                <div class="mp-info">
                    <p>Valor: <strong>R$ ${orderData.total.toFixed(2).replace('.', ',')}</strong></p>
                </div>
                <div class="mp-options">
                    <h4>Opcoes de pagamento:</h4>
                    <ul>
                        <li><i class="ri-bank-card-line"></i> Cartao de Credito (ate 12x)</li>
                        <li><i class="ri-wallet-3-line"></i> Saldo Mercado Pago</li>
                        <li><i class="ri-money-dollar-circle-line"></i> Cartao de Debito</li>
                    </ul>
                </div>
                <a href="https://www.mercadopago.com.br" target="_blank" class="mp-btn">
                    <i class="ri-external-link-line"></i> Pagar com Mercado Pago
                </a>
                <p class="mp-note">Voce sera redirecionado para o ambiente seguro do Mercado Pago.</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(mpModal);
    addMPStyles();
    
    sendOrderNotification(orderData, 'mercadopago');
    if (typeof addPurchaseToHistory === 'function') addPurchaseToHistory(orderData);

    cart = [];
    saveCart();
    updateCartUI();
}

function generateBoleto(orderData) {
    closeCheckout();
    
    const boletoCode = generateBoletoCode();
    
    const boletoModal = document.createElement('div');
    boletoModal.className = 'boleto-modal';
    boletoModal.innerHTML = `
        <div class="boleto-modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="boleto-modal-content">
            <div class="boleto-header">
                <h2><i class="ri-file-text-line"></i> Pagamento via Boleto</h2>
                <button onclick="this.closest('.boleto-modal').remove()" class="boleto-close">
                    <i class="ri-close-line"></i>
                </button>
            </div>
            <div class="boleto-body">
                <div class="boleto-icon">
                    <i class="ri-file-text-line"></i>
                </div>
                <div class="boleto-info">
                    <p class="boleto-value">Valor: <strong>R$ ${orderData.total.toFixed(2).replace('.', ',')}</strong></p>
                    <p class="boleto-expiry">Vencimento: ${getExpiryDate()}</p>
                </div>
                <div class="boleto-copy">
                    <label>Codigo de Barras:</label>
                    <div class="boleto-code-wrapper">
                        <input type="text" value="${boletoCode}" readonly id="boletoCodeInput">
                        <button onclick="copyBoletoCode()" class="copy-btn">
                            <i class="ri-file-copy-line"></i> Copiar
                        </button>
                    </div>
                </div>
                <div class="boleto-actions">
                    <button onclick="downloadBoleto()" class="download-btn">
                        <i class="ri-download-line"></i> Baixar Boleto PDF
                    </button>
                </div>
                <div class="boleto-instructions">
                    <h4>Informacoes importantes:</h4>
                    <ul>
                        <li>O boleto pode ser pago em qualquer banco ou loteria</li>
                        <li>A compensacao pode levar ate 3 dias uteis</li>
                        <li>Apos confirmacao, o acesso sera enviado por email</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(boletoModal);
    addBoletoStyles();
    
    sendOrderNotification(orderData, 'boleto');
    if (typeof addPurchaseToHistory === 'function') addPurchaseToHistory(orderData);

    cart = [];
    saveCart();
    updateCartUI();
}

function generateBoletoCode() {
    const parts = [];
    for (let i = 0; i < 5; i++) {
        parts.push(Math.floor(Math.random() * 90000 + 10000));
    }
    return parts.join('.');
}

function getExpiryDate() {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toLocaleDateString('pt-BR');
}

function copyBoletoCode() {
    const input = document.getElementById('boletoCodeInput');
    input?.select();
    document.execCommand('copy');
    showToast('Codigo do boleto copiado!', 'success');
}

function downloadBoleto() {
    showToast('Gerando boleto PDF...', 'success');
    setTimeout(() => {
        showToast('Boleto gerado! Verifique seus downloads.', 'success');
    }, 2000);
}

function sendOrderNotification(orderData, method) {
    console.log('Pedido recebido:', {
        ...orderData,
        paymentMethod: method,
        timestamp: new Date().toISOString()
    });
    
    const message = `Novo pedido recebido!
Cliente: ${orderData.customer.name}
Email: ${orderData.customer.email}
WhatsApp: ${orderData.customer.phone}
Pagamento: ${method.toUpperCase()}
Total: R$ ${orderData.total.toFixed(2)}
Produtos: ${orderData.items.map(i => i.name).join(', ')}`;
    
    console.log('Notificacao:', message);
}

function openPreview(imageSrc) {
    const modal = document.getElementById('previewModal');
    const img = document.getElementById('previewImage');
    
    if (modal && img) {
        img.src = imageSrc;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closePreview() {
    const modal = document.getElementById('previewModal');
    modal?.classList.remove('open');
    document.body.style.overflow = '';
}

function openPortfolioModal(itemId) {
    itemId = Number(itemId);
    var items = getActivePortfolio();
    var item = null;
    for (var i = 0; i < items.length; i++) {
        if (Number(items[i].id) === itemId) { item = items[i]; break; }
    }
    if (!item) return;

    var isSubPage = window.location.pathname.includes('/pages/');
    var imgSrc = item.image;
    if (imgSrc && !imgSrc.startsWith('data:') && !imgSrc.startsWith('http')) {
        if (isSubPage && !imgSrc.startsWith('../')) { imgSrc = '../' + imgSrc; }
    }

    var allCats = getFrontendCategories();
    var catObj = allCats.find(function(c) { return c.slug === item.category; });
    var categoryLabel = catObj ? catObj.name : (item.category.charAt(0).toUpperCase() + item.category.slice(1));

    var existing = document.querySelector('.portfolio-modal');
    if (existing) existing.remove();

    var modal = document.createElement('div');
    modal.className = 'portfolio-modal';
    modal.innerHTML =
        '<div class="portfolio-modal-overlay" onclick="closePortfolioModal()"></div>' +
        '<div class="portfolio-modal-content">' +
            '<button class="portfolio-modal-close" onclick="closePortfolioModal()">' +
                '<i class="ri-close-line"></i>' +
            '</button>' +
            '<div class="portfolio-modal-image">' +
                '<img src="' + imgSrc + '" alt="' + item.title + '">' +
            '</div>' +
            '<div class="portfolio-modal-info">' +
                '<span class="portfolio-modal-category">' + categoryLabel + '</span>' +
                '<h2 class="portfolio-modal-title">' + item.title + '</h2>' +
                (item.description ? '<p class="portfolio-modal-description">' + item.description + '</p>' : '') +
            '</div>' +
        '</div>';

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function() { modal.classList.add('open'); });
}

function closePortfolioModal() {
    var modal = document.querySelector('.portfolio-modal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(function() { modal.remove(); }, 300);
    }
}

function openProductModal(productId) {
    productId = Number(productId);
    const product = products.find(p => Number(p.id) === productId);
    if (!product) return;

    var pPrice = Number(product.price);
    var oldPriceHTML = '';
    if (product.oldPrice) {
        oldPriceHTML = '<span class="price-old">R$ ' + Number(product.oldPrice).toFixed(2).replace('.', ',') + '</span>';
    }
    
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML =
        '<div class="product-modal-overlay" onclick="this.parentElement.remove()"></div>' +
        '<div class="product-modal-content">' +
            '<button onclick="this.closest(\'.product-modal\').remove()" class="product-modal-close">' +
                '<i class="ri-close-line"></i>' +
            '</button>' +
            '<div class="product-modal-image">' +
                '<img src="' + product.image + '" alt="' + product.name + '">' +
            '</div>' +
            '<div class="product-modal-info">' +
                '<span class="product-category">' + product.category + '</span>' +
                '<h2>' + product.name + '</h2>' +
                '<p>' + product.description + '</p>' +
                '<div class="product-modal-price">' +
                    oldPriceHTML +
                    '<span class="price-current">R$ ' + pPrice.toFixed(2).replace('.', ',') + '</span>' +
                '</div>' +
                '<div class="product-modal-features">' +
                    '<div class="feature"><i class="ri-file-psd-2-line"></i> Arquivo PSD</div>' +
                    '<div class="feature"><i class="ri-edit-line"></i> Editavel</div>' +
                    '<div class="feature"><i class="ri-download-line"></i> Download Imediato</div>' +
                '</div>' +
                '<button onclick="addToCart(' + product.id + '); this.closest(\'.product-modal\').remove();" class="btn btn-primary btn-full">' +
                    '<i class="ri-shopping-cart-line"></i> Adicionar ao Carrinho' +
                '</button>' +
            '</div>' +
        '</div>';
    
    document.body.appendChild(modal);
    addProductModalStyles();
}

function initContactForm() {
    const form = document.getElementById('contactForm');
    
    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name')?.value;
        const email = document.getElementById('email')?.value;
        const service = document.getElementById('service')?.value;
        const message = document.getElementById('message')?.value;
        
        if (!name || !email || !service || !message) {
            showToast('Preencha todos os campos!', 'error');
            return;
        }
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="ri-loader-4-line"></i> Enviando...';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    access_key: '006f2849-f613-4df6-9933-37a96174c892',
                    from_name: 'Contato WGDesign',
                    subject: 'Novo contato: ' + service + ' - ' + name,
                    name: name,
                    email: email,
                    service: service,
                    message: message
                })
            });
            const data = await response.json();
            if (data.success) {
                showToast('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
                form.reset();
            } else {
                showToast('Erro ao enviar mensagem. Tente novamente.', 'error');
            }
        } catch (err) {
            showToast('Erro de conexao. Tente novamente.', 'error');
        }
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

function showToast(message, type) {
    if (!type) type = 'success';
    var container = document.getElementById('toastContainer');
    if (!container) return;
    
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    var icon = type === 'success' ? 'ri-check-line' : 'ri-error-warning-line';
    toast.innerHTML = '<i class="' + icon + '"></i><span>' + message + '</span>';
    
    container.appendChild(toast);
    
    setTimeout(function() {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(function() { toast.remove(); }, 300);
    }, 3000);
}

function addPixStyles() {
    if (document.getElementById('pixStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'pixStyles';
    style.textContent = `
        .pix-modal { position: fixed; inset: 0; z-index: 3000; display: flex; align-items: center; justify-content: center; }
        .pix-modal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.8); }
        .pix-modal-content { position: relative; background: var(--bg-card); border-radius: var(--radius-lg); max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; }
        .pix-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid var(--border-color); }
        .pix-header h2 { display: flex; align-items: center; gap: 10px; font-size: 1.2rem; }
        .pix-close { background: transparent; border: none; color: var(--text-secondary); font-size: 1.5rem; cursor: pointer; }
        .pix-body { padding: 2rem; }
        .pix-qr { text-align: center; margin-bottom: 1.5rem; }
        .qr-placeholder { background: var(--bg-dark); padding: 3rem; border-radius: var(--radius-md); display: inline-block; }
        .qr-placeholder i { font-size: 5rem; color: var(--primary); }
        .qr-placeholder p { margin-top: 0.5rem; color: var(--text-secondary); }
        .pix-info { text-align: center; margin-bottom: 1.5rem; }
        .pix-value { font-size: 1.3rem; margin-bottom: 0.5rem; }
        .pix-value strong { color: var(--primary); }
        .pix-expiry { color: var(--text-muted); font-size: 0.9rem; }
        .pix-copy { margin-bottom: 1.5rem; }
        .pix-copy label { display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem; }
        .pix-code-wrapper { display: flex; gap: 0.5rem; }
        .pix-code-wrapper input { flex: 1; background: var(--bg-dark); border: 1px solid var(--border-color); padding: 12px; border-radius: var(--radius-sm); color: var(--text-primary); font-size: 0.8rem; }
        .copy-btn { background: var(--primary); color: var(--bg-dark); border: none; padding: 12px 20px; border-radius: var(--radius-sm); cursor: pointer; display: flex; align-items: center; gap: 5px; font-weight: 600; }
        .pix-instructions { background: var(--bg-dark); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; }
        .pix-instructions h4 { margin-bottom: 0.5rem; font-size: 0.95rem; }
        .pix-instructions ol { padding-left: 1.2rem; color: var(--text-secondary); font-size: 0.9rem; }
        .pix-instructions li { margin-bottom: 0.3rem; }
        .pix-note { text-align: center; color: var(--text-muted); font-size: 0.85rem; }
    `;
    document.head.appendChild(style);
}

function addMPStyles() {
    if (document.getElementById('mpStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'mpStyles';
    style.textContent = `
        .mp-modal { position: fixed; inset: 0; z-index: 3000; display: flex; align-items: center; justify-content: center; }
        .mp-modal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.8); }
        .mp-modal-content { position: relative; background: var(--bg-card); border-radius: var(--radius-lg); max-width: 450px; width: 90%; }
        .mp-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid var(--border-color); }
        .mp-header h2 { display: flex; align-items: center; gap: 10px; font-size: 1.2rem; }
        .mp-close { background: transparent; border: none; color: var(--text-secondary); font-size: 1.5rem; cursor: pointer; }
        .mp-body { padding: 2rem; }
        .mp-loading { text-align: center; margin-bottom: 1.5rem; }
        .mp-loading i { font-size: 3rem; color: var(--primary); }
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .mp-info { text-align: center; font-size: 1.2rem; margin-bottom: 1.5rem; }
        .mp-info strong { color: var(--primary); }
        .mp-options { background: var(--bg-dark); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; }
        .mp-options h4 { margin-bottom: 0.5rem; font-size: 0.95rem; }
        .mp-options ul { list-style: none; }
        .mp-options li { display: flex; align-items: center; gap: 10px; padding: 8px 0; color: var(--text-secondary); font-size: 0.9rem; }
        .mp-options i { color: var(--primary); }
        .mp-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: #009ee3; color: white; padding: 14px; border-radius: var(--radius-sm); font-weight: 600; text-decoration: none; margin-bottom: 1rem; }
        .mp-note { text-align: center; color: var(--text-muted); font-size: 0.85rem; }
    `;
    document.head.appendChild(style);
}

function addBoletoStyles() {
    if (document.getElementById('boletoStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'boletoStyles';
    style.textContent = `
        .boleto-modal { position: fixed; inset: 0; z-index: 3000; display: flex; align-items: center; justify-content: center; }
        .boleto-modal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.8); }
        .boleto-modal-content { position: relative; background: var(--bg-card); border-radius: var(--radius-lg); max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; }
        .boleto-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid var(--border-color); }
        .boleto-header h2 { display: flex; align-items: center; gap: 10px; font-size: 1.2rem; }
        .boleto-close { background: transparent; border: none; color: var(--text-secondary); font-size: 1.5rem; cursor: pointer; }
        .boleto-body { padding: 2rem; }
        .boleto-icon { text-align: center; margin-bottom: 1.5rem; }
        .boleto-icon i { font-size: 5rem; color: var(--primary); }
        .boleto-info { text-align: center; margin-bottom: 1.5rem; }
        .boleto-value { font-size: 1.3rem; margin-bottom: 0.5rem; }
        .boleto-value strong { color: var(--primary); }
        .boleto-expiry { color: var(--text-muted); font-size: 0.9rem; }
        .boleto-copy { margin-bottom: 1.5rem; }
        .boleto-copy label { display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9rem; }
        .boleto-code-wrapper { display: flex; gap: 0.5rem; }
        .boleto-code-wrapper input { flex: 1; background: var(--bg-dark); border: 1px solid var(--border-color); padding: 12px; border-radius: var(--radius-sm); color: var(--text-primary); font-size: 0.85rem; }
        .boleto-actions { margin-bottom: 1.5rem; }
        .download-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; background: var(--primary); color: var(--bg-dark); padding: 14px; border-radius: var(--radius-sm); border: none; cursor: pointer; font-weight: 600; }
        .boleto-instructions { background: var(--bg-dark); padding: 1rem; border-radius: var(--radius-md); }
        .boleto-instructions h4 { margin-bottom: 0.5rem; font-size: 0.95rem; }
        .boleto-instructions ul { padding-left: 1.2rem; color: var(--text-secondary); font-size: 0.9rem; }
        .boleto-instructions li { margin-bottom: 0.3rem; }
    `;
    document.head.appendChild(style);
}

function addProductModalStyles() {
    if (document.getElementById('productModalStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'productModalStyles';
    style.textContent = `
        .product-modal { position: fixed; inset: 0; z-index: 3000; display: flex; align-items: center; justify-content: center; }
        .product-modal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.8); }
        .product-modal-content { position: relative; background: var(--bg-card); border-radius: var(--radius-lg); max-width: 800px; width: 90%; display: grid; grid-template-columns: 1fr 1fr; overflow: hidden; }
        .product-modal-close { position: absolute; top: 15px; right: 15px; background: var(--primary); color: var(--bg-dark); width: 40px; height: 40px; border-radius: 50%; border: none; cursor: pointer; font-size: 1.3rem; z-index: 10; display: flex; align-items: center; justify-content: center; }
        .product-modal-image { height: 400px; }
        .product-modal-image img { width: 100%; height: auto%; object-fit: cover; }
        .product-modal-info { padding: 2rem; display: flex; flex-direction: column; }
        .product-modal-info h2 { font-size: 1.5rem; margin-bottom: 1rem; }
        .product-modal-info p { color: var(--text-secondary); margin-bottom: 1.5rem; flex: 1; }
        .product-modal-price { margin-bottom: 1.5rem; }
        .product-modal-price .price-old { color: var(--text-muted); text-decoration: line-through; font-size: 1rem; margin-right: 10px; }
        .product-modal-price .price-current { color: var(--primary); font-size: 1.8rem; font-weight: 700; }
        .product-modal-features { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .feature { display: flex; align-items: center; gap: 5px; background: var(--bg-dark); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--text-secondary); }
        .feature i { color: var(--primary); }
        @media (max-width: 768px) {
            .product-modal-content { grid-template-columns: 1fr; }
            .product-modal-image { height: 250px; }
        }
    `;
    document.head.appendChild(style);
}

const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .toast { display: flex; align-items: center; gap: 10px; }
    .toast i { font-size: 1.2rem; }
    .toast.success i { color: var(--primary); }
    .toast.error i { color: #e74c3c; }
`;
document.head.appendChild(styleSheet);

function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    
    if (!slides.length) return;
    
    let currentSlide = 0;
    let autoPlayInterval;
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            indicators[i]?.classList.remove('active');
        });
        
        slides[index]?.classList.add('active');
        indicators[index]?.classList.add('active');
        currentSlide = index;
    }
    
    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }
    
    function prevSlide() {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    }
    
    function startAutoPlay() {
        autoPlayInterval = setInterval(nextSlide, 5000);
    }
    
    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }
    
    nextBtn?.addEventListener('click', () => {
        stopAutoPlay();
        nextSlide();
        startAutoPlay();
    });
    
    prevBtn?.addEventListener('click', () => {
        stopAutoPlay();
        prevSlide();
        startAutoPlay();
    });
    
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            stopAutoPlay();
            showSlide(index);
            startAutoPlay();
        });
    });
    
    const sliderContainer = document.querySelector('.slider-container');
    sliderContainer?.addEventListener('mouseenter', stopAutoPlay);
    sliderContainer?.addEventListener('mouseleave', startAutoPlay);
    
    startAutoPlay();
}

function getActiveSlides() {
    var defaultSlides = [
        { id: 1, title: 'Design Profissional para', subtitle: 'Servidores RPG Online', description: 'Transformo sua visao em realidade digital. Templates, Launchers, Logos e materiais graficos exclusivos para destacar seu servidor no universo MuOnline.', image: '', tag: 'Especialista em RPG Online', buttonText: 'Ver Produtos', buttonLink: '#shop', active: true, order: 1 }
    ];

    var stored = localStorage.getItem('wgdsign_slides');
    if (stored) {
        var all = JSON.parse(stored);
        var active = all.filter(function(s) { return s.active !== false; });
        active.sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
        return active.length > 0 ? active : defaultSlides;
    }
    return defaultSlides;
}

function initHeroCarousel() {
    var slides = getActiveSlides();
    if (slides.length === 0) return;

    var bgContainer = document.getElementById('heroCarouselBg');

    if (bgContainer) {
        bgContainer.innerHTML = '';
        slides.forEach(function(slide, i) {
            var div = document.createElement('div');
            div.className = 'hero-carousel-slide' + (i === 0 ? ' active' : '');
            if (slide.image) {
                div.style.backgroundImage = 'url(\'' + slide.image + '\')';
            }
            bgContainer.appendChild(div);
        });
    }

    var currentIndex = 0;
    applySlideContent(slides[0]);

    if (slides.length > 1) {
        setInterval(function() {
            var bgSlides = document.querySelectorAll('.hero-carousel-slide');
            if (bgSlides.length > 0) {
                bgSlides[currentIndex].classList.remove('active');
            }
            currentIndex = (currentIndex + 1) % slides.length;
            if (bgSlides.length > 0) {
                bgSlides[currentIndex].classList.add('active');
            }
            applySlideContent(slides[currentIndex]);
        }, 6000);
    }
}

function applySlideContent(slide) {
    var heroTag = document.getElementById('heroTag');
    var heroTitle = document.getElementById('heroTitle');
    var heroSubtitle = document.getElementById('heroSubtitle');
    var heroDescription = document.getElementById('heroDescription');
    var heroCta = document.getElementById('heroCta');
    var heroContent = document.getElementById('heroContent');

    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(15px)';
    }

    setTimeout(function() {
        if (heroTag && slide.tag) heroTag.textContent = slide.tag;
        if (heroTitle && slide.title) heroTitle.textContent = slide.title;
        if (heroSubtitle && slide.subtitle) heroSubtitle.textContent = slide.subtitle;
        if (heroDescription && slide.description) heroDescription.textContent = slide.description;

        if (heroCta && slide.buttonText) {
            heroCta.innerHTML =
                '<a href="' + (slide.buttonLink || '#') + '" class="btn btn-primary">' +
                    '<i class="ri-arrow-right-line"></i> ' +
                    '<span>' + slide.buttonText + '</span>' +
                '</a>' +
                '<a href="#portfolio" class="btn btn-secondary">' +
                    '<i class="ri-gallery-line"></i> ' +
                    '<span>Portfolio</span>' +
                '</a>';
        }

        if (heroContent) {
            heroContent.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }
    }, 250);
}

document.addEventListener('DOMContentLoaded', initHeroCarousel);

function renderDynamicShop() {
    renderShopFilterButtons();

    var shopGrid = document.getElementById('shopGrid');
    var subPageGrid = document.querySelector('.products-grid');
    var targetGrid = shopGrid || subPageGrid;
    if (!targetGrid) return;

    products = getActiveProducts();

    var isSubPage = window.location.pathname.includes('/pages/');
    var imgPrefix = isSubPage ? '../' : '';

    var categoryFilter = targetGrid.dataset.category || null;

    var filteredProducts = products;
    if (categoryFilter) {
        filteredProducts = products.filter(function(p) {
            return p.category === categoryFilter;
        });
    }

    targetGrid.innerHTML = '';

    filteredProducts.forEach(function(product) {
        var card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.category = product.category;
        card.dataset.id = product.id;
        card.dataset.name = product.name;
        card.dataset.price = product.price;

        var badgeHTML = '';
        if (product.badge) {
            var badgeClass = product.sale ? 'product-badge sale' : 'product-badge';
            badgeHTML = '<div class="' + badgeClass + '">' + product.badge + '</div>';
        }

        var imgSrc = product.image;
        if (imgSrc && !imgSrc.startsWith('data:') && !imgSrc.startsWith('http')) {
            if (isSubPage && !imgSrc.startsWith('../')) {
                imgSrc = imgPrefix + imgSrc;
            }
        }

        var pNum = Number(product.price);
        var priceHTML = '<span class="price-current">R$ ' + pNum.toFixed(2).replace('.', ',') + '</span>';
        if (product.oldPrice && product.sale) {
            priceHTML = '<span class="price-old">R$ ' + Number(product.oldPrice).toFixed(2).replace('.', ',') + '</span> ' + priceHTML;
        }

        var fileTagsHTML = renderFileTagsIcons(product.fileTags);
        var categoryLabel = (function() { var cats = getFrontendCategories(); var c = cats.find(function(cat) { return cat.slug === product.category; }); return c ? c.name : product.category; })();

        card.innerHTML =
            '<div class="product-image">' +
                fileTagsHTML +
                '<span class="product-category-badge">' + categoryLabel + '</span>' +
                '<img src="' + imgSrc + '" alt="' + product.name + '" loading="lazy">' +
                '<div class="product-overlay">' +
                    '<button class="quick-view-btn" onclick="openProductModal(' + product.id + ')">' +
                        '<i class="ri-eye-line"></i> Ver Detalhes' +
                    '</button>' +
                '</div>' +
                '<h3 class="product-name-overlay">' + product.name + '</h3>' +
            '</div>' +
            '<div class="product-info">' +
                '<div class="product-footer">' +
                    '<div class="product-price">' + priceHTML + '</div>' +
                    '<button class="add-to-cart-btn" onclick="addToCart(' + product.id + ')"><i class="ri-shopping-cart-line"></i></button>' +
                '</div>' +
            '</div>';

        targetGrid.appendChild(card);
    });

    if (!isSubPage) {
        initShopSlider();
    } else {
        initShopFilters();
    }
}

var shopSliderPos = 0;

function initShopSlider() {
    var track = document.getElementById('shopGrid');
    var prevBtn = document.getElementById('shopArrowPrev');
    var nextBtn = document.getElementById('shopArrowNext');
    if (!track || !prevBtn || !nextBtn) return;

    shopSliderPos = 0;
    track.style.transform = 'translateX(0px)';

    var cardWidth = 300 + 24;

    nextBtn.onclick = function() {
        var cards = track.querySelectorAll('.product-card');
        var wrapperWidth = track.parentElement.offsetWidth;
        var maxScroll = (cards.length * cardWidth) - wrapperWidth;
        if (maxScroll < 0) maxScroll = 0;
        shopSliderPos = Math.min(shopSliderPos + cardWidth, maxScroll);
        track.style.transform = 'translateX(-' + shopSliderPos + 'px)';
    };

    prevBtn.onclick = function() {
        shopSliderPos = Math.max(shopSliderPos - cardWidth, 0);
        track.style.transform = 'translateX(-' + shopSliderPos + 'px)';
    };
}

function initTestimonialsSlider() {
    var track = document.getElementById('testimonialsTrack');
    var prevBtn = document.getElementById('testimonialPrev');
    var nextBtn = document.getElementById('testimonialNext');
    var dotsContainer = document.getElementById('testimonialsDots');
    if (!track || !prevBtn || !nextBtn) return;

    var slides = track.querySelectorAll('.testimonial-slide');
    var current = 0;
    var total = slides.length;

    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        for (var i = 0; i < total; i++) {
            var dot = document.createElement('button');
            dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
            dot.dataset.index = i;
            dot.onclick = function() { goTo(Number(this.dataset.index)); };
            dotsContainer.appendChild(dot);
        }
    }

    function goTo(index) {
        current = index;
        if (current < 0) current = total - 1;
        if (current >= total) current = 0;
        track.style.transform = 'translateX(-' + (current * 100) + '%)';
        var dots = dotsContainer ? dotsContainer.querySelectorAll('.testimonial-dot') : [];
        dots.forEach(function(d, i) { d.classList.toggle('active', i === current); });
    }

    nextBtn.onclick = function() { goTo(current + 1); };
    prevBtn.onclick = function() { goTo(current - 1); };

    setInterval(function() { goTo(current + 1); }, 6000);
}

function getActivePortfolio() {
    var defaultPortfolio = [
        { id: 1, title: 'Launcher 01', category: 'launchers', image: 'assets/img/launchers/l-1.jpg', description: 'Layout PSD moderno e impactante para servidores MuOnline.', active: true },
        { id: 2, title: 'Launcher 02', category: 'launchers', image: 'assets/img/launchers/l-2.jpg', description: 'Layout PSD com interface intuitiva e botoes bem posicionados.', active: true },
        { id: 3, title: 'Logo 01', category: 'logos', image: 'assets/img/logos/logo-01.jpg', description: 'Identidade visual moderna e impactante para servidores.', active: true },
        { id: 4, title: 'Template 01', category: 'templates', image: 'assets/img/templates/tema-01.jpg', description: 'Layout PSD elegante com janelas de login e cadastro editaveis.', active: true },
        { id: 5, title: 'Pack 01', category: 'banners', image: 'assets/img/banners/01.jpg', description: 'Colecao de banners em alta qualidade para redes sociais.', active: true },
        { id: 6, title: 'Launcher 03', category: 'launchers', image: 'assets/img/launchers/l-3.jpg', description: 'Layout PSD moderno e leve com visual limpo e profissional.', active: true }
    ];

    var stored = localStorage.getItem('wgdsign_portfolio');
    if (stored) {
        var all = JSON.parse(stored);
        return all.filter(function(p) { return p.active !== false; });
    }

    localStorage.setItem('wgdsign_portfolio', JSON.stringify(defaultPortfolio));
    return defaultPortfolio;
}

function renderDynamicPortfolio() {
    renderPortfolioFilterButtons();

    var grid = document.getElementById('portfolioGrid');
    if (!grid) return;

    var items = getActivePortfolio();
    var isSubPage = window.location.pathname.includes('/pages/');
    var imgPrefix = isSubPage ? '../' : '';

    grid.innerHTML = '';

    items.forEach(function(item) {
        var el = document.createElement('div');
        el.className = 'portfolio-item';
        el.dataset.category = item.category;

        var imgSrc = item.image;
        if (imgSrc && !imgSrc.startsWith('data:') && !imgSrc.startsWith('http')) {
            if (isSubPage && !imgSrc.startsWith('../')) {
                imgSrc = imgPrefix + imgSrc;
            }
        }

        var allCats = getFrontendCategories();
        var catObj = allCats.find(function(c) { return c.slug === item.category; });
        var categoryLabel = catObj ? catObj.name : (item.category.charAt(0).toUpperCase() + item.category.slice(1));

        el.innerHTML =
            '<div class="portfolio-image">' +
                '<img src="' + imgSrc + '" alt="' + item.title + '" loading="lazy">' +
                '<div class="portfolio-overlay">' +
                    '<div class="portfolio-actions">' +
                        '<button class="action-btn" onclick="openPortfolioModal(' + item.id + ')">' +
                            '<i class="ri-zoom-in-line"></i>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="portfolio-info">' +
                '<h3>' + item.title + '</h3>' +
                (item.description ? '<p class="portfolio-description">' + item.description + '</p>' : '') +
                '<span class="portfolio-category">' + categoryLabel + '</span>' +
            '</div>';

        grid.appendChild(el);
    });

    if (!isSubPage) {
        filterPortfolioOnePerCategory();
    }

    initPortfolioFilters();
}

function filterPortfolioOnePerCategory() {
    var items = document.querySelectorAll('.portfolio-item');
    var seen = {};
    items.forEach(function(item) {
        var cat = item.dataset.category;
        if (seen[cat]) {
            item.style.display = 'none';
        } else {
            seen[cat] = true;
            item.style.display = 'block';
        }
    });
}
