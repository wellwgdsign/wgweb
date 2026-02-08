const MP_CONFIG = {
    publicKey: 'APP_USR-87ad3cce-27f4-447f-96f1-3a994e1b8283',
    proxyUrl: '',
    whatsappNumber: '5511930926706',
    storeName: 'WGDsign Studio'
};

function setMPProxyUrl(url) {
    MP_CONFIG.proxyUrl = url.replace(/\/$/, '');
}

class MercadoPagoService {
    constructor() {
        this.proxyUrl = MP_CONFIG.proxyUrl;
    }

    getProxyUrl() {
        return MP_CONFIG.proxyUrl || '';
    }

    hasProxy() {
        return !!this.getProxyUrl();
    }

    async createPixPayment(orderData) {
        if (!this.hasProxy()) {
            return { success: false, error: 'proxy_not_configured' };
        }

        try {
            const response = await fetch(this.getProxyUrl() + '/api/pix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: orderData.total,
                    description: MP_CONFIG.storeName + ' - ' + orderData.items.map(function(i) { return i.name; }).join(', '),
                    email: orderData.customer.email,
                    name: orderData.customer.name,
                    cpf: orderData.customer.cpf.replace(/\D/g, '')
                })
            });

            if (!response.ok) {
                var errorData = await response.json().catch(function() { return {}; });
                throw new Error(errorData.message || 'Erro na requisicao: ' + response.status);
            }

            var data = await response.json();
            return {
                success: true,
                paymentId: data.id,
                qrCode: data.qr_code,
                qrCodeBase64: data.qr_code_base64,
                ticketUrl: data.ticket_url,
                expirationDate: data.expiration_date
            };
        } catch (error) {
            console.error('Erro PIX:', error);
            return { success: false, error: error.message };
        }
    }

    async createPreference(orderData) {
        if (!this.hasProxy()) {
            return { success: false, error: 'proxy_not_configured' };
        }

        try {
            var response = await fetch(this.getProxyUrl() + '/api/preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: orderData.items.map(function(item) {
                        return {
                            title: item.name,
                            quantity: 1,
                            unit_price: item.price,
                            currency_id: 'BRL'
                        };
                    }),
                    payer: {
                        name: orderData.customer.name,
                        email: orderData.customer.email,
                        phone: orderData.customer.phone.replace(/\D/g, ''),
                        cpf: orderData.customer.cpf.replace(/\D/g, '')
                    },
                    external_reference: 'order_' + Date.now()
                })
            });

            if (!response.ok) {
                var errorData = await response.json().catch(function() { return {}; });
                throw new Error(errorData.message || 'Erro na requisicao: ' + response.status);
            }

            var data = await response.json();
            return {
                success: true,
                preferenceId: data.id,
                initPoint: data.init_point,
                sandboxInitPoint: data.sandbox_init_point
            };
        } catch (error) {
            console.error('Erro Preferencia:', error);
            return { success: false, error: error.message };
        }
    }

    async checkPaymentStatus(paymentId) {
        if (!this.hasProxy()) {
            return { success: false, error: 'proxy_not_configured' };
        }

        try {
            var response = await fetch(this.getProxyUrl() + '/api/payment-status?id=' + paymentId);
            if (!response.ok) throw new Error('Erro ao verificar status');
            var data = await response.json();
            return { success: true, status: data.status, statusDetail: data.status_detail };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

var mpService = new MercadoPagoService();

async function processPixPaymentMP(orderData) {
    closeCheckout();
    showToast('Processando pagamento PIX...', 'success');

    if (!mpService.hasProxy()) {
        showPixManual(orderData);
        return;
    }

    var result = await mpService.createPixPayment(orderData);

    if (result.success) {
        showPixModal(result, orderData);
        startPaymentPolling(result.paymentId, orderData);
        cart = [];
        saveCart();
        updateCartUI();
    } else {
        showPixManual(orderData);
    }
}

function showPixModal(pixData, orderData) {
    var existing = document.getElementById('pixPaymentModal');
    if (existing) existing.remove();

    var pixModal = document.createElement('div');
    pixModal.className = 'payment-modal-wrapper';
    pixModal.id = 'pixPaymentModal';

    var qrHtml = '';
    if (pixData.qrCodeBase64) {
        qrHtml = '<img src="data:image/png;base64,' + pixData.qrCodeBase64 + '" alt="QR Code PIX" class="pm-qr-image">';
    } else {
        qrHtml = '<div class="pm-qr-placeholder"><i class="ri-qr-code-line"></i><p>QR Code</p></div>';
    }

    pixModal.innerHTML =
        '<div class="pm-overlay" onclick="closePixModal()"></div>' +
        '<div class="pm-content">' +
            '<div class="pm-header pm-header-pix">' +
                '<div class="pm-header-icon"><i class="ri-qr-code-line"></i></div>' +
                '<h2>Pagamento via PIX</h2>' +
                '<button onclick="closePixModal()" class="pm-close"><i class="ri-close-line"></i></button>' +
            '</div>' +
            '<div class="pm-body">' +
                '<div class="pm-status" id="pixStatus">' +
                    '<div class="pm-status-dot"></div>' +
                    '<span>Aguardando pagamento...</span>' +
                '</div>' +
                '<div class="pm-qr-container">' + qrHtml + '</div>' +
                '<div class="pm-value">' +
                    '<span>Valor total</span>' +
                    '<strong>R$ ' + orderData.total.toFixed(2).replace('.', ',') + '</strong>' +
                '</div>' +
                '<div class="pm-timer">' +
                    '<i class="ri-time-line"></i> Valido por <span id="pixTimer">30:00</span>' +
                '</div>' +
                (pixData.qrCode ?
                    '<div class="pm-copy-section">' +
                        '<label>Codigo PIX Copia e Cola:</label>' +
                        '<div class="pm-copy-row">' +
                            '<input type="text" value="' + pixData.qrCode + '" readonly id="pixCodeInput" class="pm-copy-input">' +
                            '<button onclick="copyPixCode()" class="pm-copy-btn"><i class="ri-file-copy-line"></i> Copiar</button>' +
                        '</div>' +
                    '</div>' : '') +
                '<div class="pm-steps">' +
                    '<h4>Como pagar:</h4>' +
                    '<div class="pm-step"><span class="pm-step-num">1</span><span>Abra o app do seu banco</span></div>' +
                    '<div class="pm-step"><span class="pm-step-num">2</span><span>Escolha pagar com PIX</span></div>' +
                    '<div class="pm-step"><span class="pm-step-num">3</span><span>Escaneie o QR Code ou cole o codigo</span></div>' +
                    '<div class="pm-step"><span class="pm-step-num">4</span><span>Confirme o pagamento</span></div>' +
                '</div>' +
            '</div>' +
        '</div>';

    document.body.appendChild(pixModal);
    startPixTimer();
    injectPaymentStyles();
}

function showPixManual(orderData) {
    var existing = document.getElementById('pixPaymentModal');
    if (existing) existing.remove();

    var itemsText = orderData.items.map(function(i) { return i.name; }).join(', ');
    var totalText = orderData.total.toFixed(2).replace('.', ',');
    var whatsappUrl = 'https://wa.me/' + MP_CONFIG.whatsappNumber +
        '?text=' + encodeURIComponent(
            'Ola! Gostaria de realizar um pagamento via PIX.\n\n' +
            'Produtos: ' + itemsText + '\n' +
            'Valor: R$ ' + totalText + '\n' +
            'Nome: ' + orderData.customer.name + '\n' +
            'Email: ' + orderData.customer.email
        );

    var pixModal = document.createElement('div');
    pixModal.className = 'payment-modal-wrapper';
    pixModal.id = 'pixPaymentModal';
    pixModal.innerHTML =
        '<div class="pm-overlay" onclick="closePixModal()"></div>' +
        '<div class="pm-content">' +
            '<div class="pm-header pm-header-pix">' +
                '<div class="pm-header-icon"><i class="ri-qr-code-line"></i></div>' +
                '<h2>Pagamento via PIX</h2>' +
                '<button onclick="closePixModal()" class="pm-close"><i class="ri-close-line"></i></button>' +
            '</div>' +
            '<div class="pm-body">' +
                '<div class="pm-value">' +
                    '<span>Valor total</span>' +
                    '<strong>R$ ' + totalText + '</strong>' +
                '</div>' +
                '<div class="pm-manual-notice">' +
                    '<i class="ri-information-line"></i>' +
                    '<p>Para gerar o QR Code PIX, entre em contato pelo WhatsApp. Voce recebera o codigo para pagamento imediato.</p>' +
                '</div>' +
                '<a href="' + whatsappUrl + '" target="_blank" class="pm-whatsapp-btn">' +
                    '<i class="ri-whatsapp-line"></i> Solicitar PIX via WhatsApp' +
                '</a>' +
                '<div class="pm-steps">' +
                    '<h4>Como funciona:</h4>' +
                    '<div class="pm-step"><span class="pm-step-num">1</span><span>Clique no botao acima para abrir o WhatsApp</span></div>' +
                    '<div class="pm-step"><span class="pm-step-num">2</span><span>Receba o QR Code ou codigo PIX</span></div>' +
                    '<div class="pm-step"><span class="pm-step-num">3</span><span>Faca o pagamento pelo app do banco</span></div>' +
                    '<div class="pm-step"><span class="pm-step-num">4</span><span>Envie o comprovante e receba seu produto</span></div>' +
                '</div>' +
            '</div>' +
        '</div>';

    document.body.appendChild(pixModal);
    injectPaymentStyles();

    savePendingOrder(orderData, 'pix');
    cart = [];
    saveCart();
    updateCartUI();
}

function closePixModal() {
    var modal = document.getElementById('pixPaymentModal');
    if (modal) modal.remove();
    if (window.paymentPollingInterval) clearInterval(window.paymentPollingInterval);
    if (window.pixTimerInterval) clearInterval(window.pixTimerInterval);
}

function startPaymentPolling(paymentId, orderData) {
    var attempts = 0;
    var maxAttempts = 120;

    window.paymentPollingInterval = setInterval(async function() {
        attempts++;
        if (attempts >= maxAttempts) {
            clearInterval(window.paymentPollingInterval);
            return;
        }

        var status = await mpService.checkPaymentStatus(paymentId);
        if (status.success && status.status === 'approved') {
            clearInterval(window.paymentPollingInterval);
            updatePixStatus('approved');

            if (typeof addPurchaseToHistory === 'function') {
                addPurchaseToHistory(orderData);
            }

            showToast('Pagamento aprovado! Acesse seus downloads no painel.', 'success');
            setTimeout(closePixModal, 3000);
        }
    }, 5000);
}

function updatePixStatus(status) {
    var statusEl = document.getElementById('pixStatus');
    if (!statusEl) return;

    if (status === 'approved') {
        statusEl.innerHTML = '<div class="pm-status-dot approved"></div><span>Pagamento aprovado!</span>';
        statusEl.classList.add('approved');
    }
}

function startPixTimer() {
    var timeLeft = 1800;
    var timerEl = document.getElementById('pixTimer');
    if (!timerEl) return;

    window.pixTimerInterval = setInterval(function() {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(window.pixTimerInterval);
            timerEl.textContent = 'Expirado';
            return;
        }
        var min = Math.floor(timeLeft / 60);
        var sec = timeLeft % 60;
        timerEl.textContent = (min < 10 ? '0' : '') + min + ':' + (sec < 10 ? '0' : '') + sec;
    }, 1000);
}

function copyPixCode() {
    var input = document.getElementById('pixCodeInput');
    if (!input) return;

    if (navigator.clipboard) {
        navigator.clipboard.writeText(input.value).then(function() {
            showToast('Codigo PIX copiado!', 'success');
        });
    } else {
        input.select();
        document.execCommand('copy');
        showToast('Codigo PIX copiado!', 'success');
    }
}

async function processMercadoPagoCheckout(orderData) {
    closeCheckout();
    showToast('Preparando checkout Mercado Pago...', 'success');

    if (!mpService.hasProxy()) {
        showMercadoPagoManual(orderData);
        return;
    }

    var result = await mpService.createPreference(orderData);

    if (result.success && result.initPoint) {
        savePendingOrder(orderData, 'mercadopago');
        cart = [];
        saveCart();
        updateCartUI();
        window.location.href = result.initPoint;
    } else {
        showMercadoPagoManual(orderData);
    }
}

function showMercadoPagoManual(orderData) {
    var existing = document.getElementById('mpPaymentModal');
    if (existing) existing.remove();

    var itemsText = orderData.items.map(function(i) { return i.name; }).join(', ');
    var totalText = orderData.total.toFixed(2).replace('.', ',');
    var whatsappUrl = 'https://wa.me/' + MP_CONFIG.whatsappNumber +
        '?text=' + encodeURIComponent(
            'Ola! Gostaria de finalizar minha compra via Mercado Pago.\n\n' +
            'Produtos: ' + itemsText + '\n' +
            'Valor: R$ ' + totalText + '\n' +
            'Nome: ' + orderData.customer.name + '\n' +
            'Email: ' + orderData.customer.email
        );

    var mpModal = document.createElement('div');
    mpModal.className = 'payment-modal-wrapper';
    mpModal.id = 'mpPaymentModal';
    mpModal.innerHTML =
        '<div class="pm-overlay" onclick="document.getElementById(\'mpPaymentModal\').remove()"></div>' +
        '<div class="pm-content">' +
            '<div class="pm-header pm-header-mp">' +
                '<div class="pm-header-icon"><i class="ri-bank-card-line"></i></div>' +
                '<h2>Mercado Pago</h2>' +
                '<button onclick="document.getElementById(\'mpPaymentModal\').remove()" class="pm-close"><i class="ri-close-line"></i></button>' +
            '</div>' +
            '<div class="pm-body">' +
                '<div class="pm-value">' +
                    '<span>Valor total</span>' +
                    '<strong>R$ ' + totalText + '</strong>' +
                '</div>' +
                '<div class="pm-options-list">' +
                    '<div class="pm-option"><i class="ri-bank-card-line"></i><span>Cartao de Credito (ate 12x)</span></div>' +
                    '<div class="pm-option"><i class="ri-wallet-3-line"></i><span>Saldo Mercado Pago</span></div>' +
                    '<div class="pm-option"><i class="ri-bank-line"></i><span>Cartao de Debito</span></div>' +
                    '<div class="pm-option"><i class="ri-qr-code-line"></i><span>PIX pelo Mercado Pago</span></div>' +
                '</div>' +
                '<div class="pm-manual-notice">' +
                    '<i class="ri-information-line"></i>' +
                    '<p>Enviaremos o link de pagamento do Mercado Pago pelo WhatsApp para voce finalizar com seguranca.</p>' +
                '</div>' +
                '<a href="' + whatsappUrl + '" target="_blank" class="pm-whatsapp-btn">' +
                    '<i class="ri-whatsapp-line"></i> Finalizar via WhatsApp' +
                '</a>' +
            '</div>' +
        '</div>';

    document.body.appendChild(mpModal);
    injectPaymentStyles();

    savePendingOrder(orderData, 'mercadopago');
    cart = [];
    saveCart();
    updateCartUI();
}

async function processBoletoPaymentMP(orderData) {
    closeCheckout();
    showToast('Processando boleto...', 'success');
    showBoletoManual(orderData);
}

function showBoletoManual(orderData) {
    var existing = document.getElementById('boletoPaymentModal');
    if (existing) existing.remove();

    var itemsText = orderData.items.map(function(i) { return i.name; }).join(', ');
    var totalText = orderData.total.toFixed(2).replace('.', ',');
    var expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 3);
    var expiryText = expiryDate.toLocaleDateString('pt-BR');

    var whatsappUrl = 'https://wa.me/' + MP_CONFIG.whatsappNumber +
        '?text=' + encodeURIComponent(
            'Ola! Gostaria de pagar via Boleto.\n\n' +
            'Produtos: ' + itemsText + '\n' +
            'Valor: R$ ' + totalText + '\n' +
            'Nome: ' + orderData.customer.name + '\n' +
            'Email: ' + orderData.customer.email + '\n' +
            'CPF: ' + orderData.customer.cpf
        );

    var boletoModal = document.createElement('div');
    boletoModal.className = 'payment-modal-wrapper';
    boletoModal.id = 'boletoPaymentModal';
    boletoModal.innerHTML =
        '<div class="pm-overlay" onclick="document.getElementById(\'boletoPaymentModal\').remove()"></div>' +
        '<div class="pm-content">' +
            '<div class="pm-header pm-header-boleto">' +
                '<div class="pm-header-icon"><i class="ri-file-text-line"></i></div>' +
                '<h2>Pagamento via Boleto</h2>' +
                '<button onclick="document.getElementById(\'boletoPaymentModal\').remove()" class="pm-close"><i class="ri-close-line"></i></button>' +
            '</div>' +
            '<div class="pm-body">' +
                '<div class="pm-value">' +
                    '<span>Valor total</span>' +
                    '<strong>R$ ' + totalText + '</strong>' +
                '</div>' +
                '<div class="pm-boleto-info">' +
                    '<span><i class="ri-calendar-line"></i> Vencimento: ' + expiryText + '</span>' +
                '</div>' +
                '<div class="pm-manual-notice">' +
                    '<i class="ri-information-line"></i>' +
                    '<p>Enviaremos o boleto pelo WhatsApp. A compensacao pode levar ate 3 dias uteis.</p>' +
                '</div>' +
                '<a href="' + whatsappUrl + '" target="_blank" class="pm-whatsapp-btn">' +
                    '<i class="ri-whatsapp-line"></i> Solicitar Boleto via WhatsApp' +
                '</a>' +
            '</div>' +
        '</div>';

    document.body.appendChild(boletoModal);
    injectPaymentStyles();

    savePendingOrder(orderData, 'boleto');
    cart = [];
    saveCart();
    updateCartUI();
}

function savePendingOrder(orderData, method) {
    var pending = JSON.parse(localStorage.getItem('wgdsign_pending_orders') || '[]');
    pending.push({
        id: 'order_' + Date.now(),
        customer: orderData.customer,
        items: orderData.items,
        total: orderData.total,
        method: method,
        status: 'pending',
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('wgdsign_pending_orders', JSON.stringify(pending));
}

function copyBoletoCode() {
    var input = document.getElementById('boletoCodeInput');
    if (!input) return;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(input.value).then(function() {
            showToast('Codigo copiado!', 'success');
        });
    } else {
        input.select();
        document.execCommand('copy');
        showToast('Codigo copiado!', 'success');
    }
}

var _paymentStylesInjected = false;
function injectPaymentStyles() {
    if (_paymentStylesInjected) return;
    _paymentStylesInjected = true;

    var style = document.createElement('style');
    style.textContent = [
        '.payment-modal-wrapper { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000; display: flex; align-items: center; justify-content: center; }',
        '.pm-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); }',
        '.pm-content { position: relative; background: #1a1a2e; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; width: 90%; max-width: 440px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5); }',
        '.pm-header { display: flex; align-items: center; gap: 12px; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); }',
        '.pm-header-pix { background: linear-gradient(135deg, rgba(0,190,150,0.1), rgba(0,190,150,0.02)); }',
        '.pm-header-mp { background: linear-gradient(135deg, rgba(0,158,227,0.1), rgba(0,158,227,0.02)); }',
        '.pm-header-boleto { background: linear-gradient(135deg, rgba(200,200,200,0.1), rgba(200,200,200,0.02)); }',
        '.pm-header-icon { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 10px; font-size: 1.3rem; }',
        '.pm-header-pix .pm-header-icon { background: rgba(0,190,150,0.15); color: #00be96; }',
        '.pm-header-mp .pm-header-icon { background: rgba(0,158,227,0.15); color: #009ee3; }',
        '.pm-header-boleto .pm-header-icon { background: rgba(200,200,200,0.15); color: #ccc; }',
        '.pm-header h2 { flex: 1; font-size: 1.1rem; color: #fff; margin: 0; }',
        '.pm-close { background: none; border: none; color: rgba(255,255,255,0.4); font-size: 1.3rem; cursor: pointer; padding: 4px; }',
        '.pm-close:hover { color: #fff; }',
        '.pm-body { padding: 24px; }',
        '.pm-status { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: rgba(255,200,0,0.06); border: 1px solid rgba(255,200,0,0.12); border-radius: 8px; margin-bottom: 20px; font-size: 0.85rem; color: rgba(255,200,0,0.9); }',
        '.pm-status.approved { background: rgba(0,200,100,0.06); border-color: rgba(0,200,100,0.12); color: rgba(0,200,100,0.9); }',
        '.pm-status-dot { width: 8px; height: 8px; border-radius: 50%; background: #ffc800; animation: pmPulse 1.5s infinite; }',
        '.pm-status-dot.approved { background: #00c864; animation: none; }',
        '@keyframes pmPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }',
        '.pm-qr-container { text-align: center; margin: 16px 0; }',
        '.pm-qr-image { width: 200px; height: 200px; border-radius: 12px; border: 3px solid rgba(255,255,255,0.1); }',
        '.pm-qr-placeholder { width: 200px; height: 200px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(255,255,255,0.03); border: 2px dashed rgba(255,255,255,0.1); border-radius: 12px; color: rgba(255,255,255,0.3); }',
        '.pm-qr-placeholder i { font-size: 3rem; margin-bottom: 8px; }',
        '.pm-value { text-align: center; padding: 14px; background: rgba(200,255,0,0.04); border: 1px solid rgba(200,255,0,0.1); border-radius: 10px; margin-bottom: 16px; }',
        '.pm-value span { display: block; font-size: 0.78rem; color: rgba(255,255,255,0.5); margin-bottom: 4px; }',
        '.pm-value strong { font-size: 1.4rem; color: #c8ff00; }',
        '.pm-timer { text-align: center; font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-bottom: 16px; }',
        '.pm-timer i { margin-right: 4px; }',
        '.pm-copy-section { margin-bottom: 16px; }',
        '.pm-copy-section label { display: block; font-size: 0.78rem; color: rgba(255,255,255,0.5); margin-bottom: 6px; }',
        '.pm-copy-row { display: flex; gap: 8px; }',
        '.pm-copy-input { flex: 1; padding: 10px 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; color: #fff; font-size: 0.75rem; font-family: monospace; }',
        '.pm-copy-btn { padding: 10px 16px; background: rgba(200,255,0,0.1); border: 1px solid rgba(200,255,0,0.2); border-radius: 6px; color: #c8ff00; cursor: pointer; font-size: 0.8rem; white-space: nowrap; transition: all 0.2s; }',
        '.pm-copy-btn:hover { background: rgba(200,255,0,0.2); }',
        '.pm-steps { margin-top: 16px; }',
        '.pm-steps h4 { font-size: 0.82rem; color: rgba(255,255,255,0.6); margin-bottom: 10px; }',
        '.pm-step { display: flex; align-items: center; gap: 10px; padding: 8px 0; font-size: 0.8rem; color: rgba(255,255,255,0.5); }',
        '.pm-step-num { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: rgba(200,255,0,0.08); color: #c8ff00; border-radius: 50%; font-size: 0.7rem; font-weight: 700; flex-shrink: 0; }',
        '.pm-manual-notice { display: flex; gap: 10px; padding: 14px; background: rgba(100,180,255,0.06); border: 1px solid rgba(100,180,255,0.1); border-radius: 8px; margin-bottom: 16px; font-size: 0.8rem; color: rgba(100,180,255,0.8); }',
        '.pm-manual-notice i { font-size: 1.2rem; flex-shrink: 0; margin-top: 2px; }',
        '.pm-manual-notice p { margin: 0; line-height: 1.4; }',
        '.pm-whatsapp-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px 24px; background: #25D366; color: #fff; border: none; border-radius: 10px; font-size: 0.95rem; font-weight: 600; text-decoration: none; cursor: pointer; transition: all 0.2s; }',
        '.pm-whatsapp-btn:hover { background: #128C7E; transform: translateY(-1px); }',
        '.pm-options-list { margin-bottom: 16px; }',
        '.pm-option { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; margin-bottom: 6px; font-size: 0.82rem; color: rgba(255,255,255,0.6); }',
        '.pm-option i { color: #009ee3; font-size: 1.1rem; }',
        '.pm-boleto-info { text-align: center; margin-bottom: 16px; font-size: 0.82rem; color: rgba(255,255,255,0.5); }',
        '.pm-boleto-info i { margin-right: 4px; }',
        '@media (max-width: 480px) { .pm-content { width: 95%; max-height: 95vh; } .pm-qr-image { width: 160px; height: 160px; } }'
    ].join('\n');
    document.head.appendChild(style);
}

window.processPixPaymentMP = processPixPaymentMP;
window.processMercadoPagoCheckout = processMercadoPagoCheckout;
window.processBoletoPaymentMP = processBoletoPaymentMP;
window.closePixModal = closePixModal;
window.copyPixCode = copyPixCode;
window.copyBoletoCode = copyBoletoCode;
window.setMPProxyUrl = setMPProxyUrl;
