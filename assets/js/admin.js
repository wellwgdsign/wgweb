const ADMIN_EMAILS = ['admin@wgdsign.com', 'wgdsign@gmail.com'];
const PRODUCTS_KEY = 'wgdsign_products';
const DOWNLOADS_FILES_KEY = 'wgdsign_download_files';
const PORTFOLIO_KEY = 'wgdsign_portfolio';
const SLIDES_KEY = 'wgdsign_slides';
const CATEGORIES_KEY = 'wgdsign_categories';

let editingProductId = null;
let editingPortfolioId = null;
let editingSlideId = null;
let editingCategoryId = null;

function getSelectedFileTags() {
    var container = document.getElementById('productFileTags');
    if (!container) return [];
    var checked = container.querySelectorAll('input[type="checkbox"]:checked');
    var tags = [];
    checked.forEach(function(cb) { tags.push(cb.value); });
    return tags;
}

function setSelectedFileTags(tags) {
    var container = document.getElementById('productFileTags');
    if (!container) return;
    container.querySelectorAll('input[type="checkbox"]').forEach(function(cb) {
        cb.checked = Array.isArray(tags) && tags.indexOf(cb.value) !== -1;
    });
}

function getFileTagIcon(tag) {
    var icons = {
        'PSD': '<svg class="file-icon file-icon-psd" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#31A8FF"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">Ps</text></svg>',
        'HTML': '<svg class="file-icon file-icon-html" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#E44D26"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">HTML</text></svg>',
        'CSS': '<svg class="file-icon file-icon-css" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#264DE4"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">CSS</text></svg>',
        'JS': '<svg class="file-icon file-icon-js" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#F7DF1E"/><text x="12" y="16" text-anchor="middle" fill="#000" font-size="8" font-weight="bold">JS</text></svg>',
        'PHP': '<svg class="file-icon file-icon-php" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#777BB3"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">PHP</text></svg>',
        'PNG': '<svg class="file-icon file-icon-png" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#0D9488"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">PNG</text></svg>',
        'JPG': '<svg class="file-icon file-icon-jpg" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#0D9488"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">JPG</text></svg>',
        'SVG': '<svg class="file-icon file-icon-svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#FFB13B"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="7" font-weight="bold">SVG</text></svg>',
        'AI': '<svg class="file-icon file-icon-ai" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#FF9A00"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">Ai</text></svg>',
        'FIGMA': '<svg class="file-icon file-icon-figma" viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#A259FF"/><text x="12" y="16" text-anchor="middle" fill="#fff" font-size="6" font-weight="bold">FIG</text></svg>'
    };
    return icons[tag] || '<span class="file-tag-text">' + tag + '</span>';
}

function renderFileTagsIcons(fileTags) {
    if (!fileTags || !fileTags.length) return '';
    var html = '<div class="file-tags-icons">';
    fileTags.forEach(function(tag) { html += getFileTagIcon(tag); });
    html += '</div>';
    return html;
}

function isAdmin() {
    const user = JSON.parse(localStorage.getItem('wgdsign_user'));
    if (!user) return false;
    return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

function checkAdminAccess() {
    if (!isAdmin()) {
        window.location.href = '../index.html';
        return false;
    }
    return true;
}

function getProducts() {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    if (stored) return JSON.parse(stored);
    return [];
}

function saveProducts(products) {
    return safeLocalStorageSave(PRODUCTS_KEY, products);
}

function getNextProductId() {
    const products = getProducts();
    if (products.length === 0) return 1;
    return Math.max(...products.map(p => p.id)) + 1;
}

function initDefaultProducts() {
    const existing = localStorage.getItem(PRODUCTS_KEY);
    if (existing) return;

    const defaults = [
        { id: 1, name: 'Launcher 01', price: 2.00, category: 'launchers', image: 'assets/img/launchers/l-1.jpg', description: 'Layout PSD moderno e impactante, criado especialmente para servidores de Mu Online que buscam um visual marcante e profissional.', badge: 'Premium', discount: 0, tag: 'Premium', active: true, createdAt: new Date().toISOString() },
        { id: 2, name: 'Logo 01', price: 6.00, category: 'logos', image: 'assets/img/logos/logo-01.jpg', description: 'Identidade visual moderna e impactante, desenvolvida especialmente para servidores de Mu Online.', badge: '', discount: 0, tag: '', active: true, createdAt: new Date().toISOString() },
        { id: 3, name: 'Launcher 02', price: 2.00, category: 'launchers', image: 'assets/img/launchers/l-2.jpg', description: 'Layout PSD moderno e impactante, com interface intuitiva e botoes bem posicionados.', badge: 'Premium', discount: 0, tag: 'Premium', active: true, createdAt: new Date().toISOString() },
        { id: 4, name: 'Template 01', price: 10.00, oldPrice: 10.00, category: 'templates', image: 'assets/img/templates/tema-01.jpg', description: 'Layout PSD moderno e elegante, com janelas de login e cadastro totalmente editaveis.', badge: '-12%', discount: 12, tag: 'Promocao', sale: true, active: true, createdAt: new Date().toISOString() },
        { id: 5, name: 'Pack 01', price: 8.00, category: 'banners', image: 'assets/img/banners/01.jpg', description: 'Colecao de banners em alta qualidade, prontos para serem ajustados ao estilo do seu servidor.', badge: '', discount: 0, tag: '', active: true, createdAt: new Date().toISOString() },
        { id: 6, name: 'Launcher 03', price: 7.00, oldPrice: 5.00, category: 'launchers', image: 'assets/img/launchers/l-3.jpg', description: 'Layout PSD moderno e leve, desenvolvido para servidores de Mu Online que buscam um visual limpo.', badge: '-18%', discount: 18, tag: 'Promocao', sale: true, active: true, createdAt: new Date().toISOString() },
        { id: 7, name: 'Pack 02', price: 8.00, category: 'banners', image: 'assets/img/banners/02.jpg', description: 'Colecao de 6 banners profissionais para redes sociais e divulgacao.', badge: '', discount: 0, tag: '', active: true, createdAt: new Date().toISOString() },
        { id: 8, name: 'Template 02', price: 8.00, category: 'templates', image: 'assets/img/templates/tema-02.jpg', description: 'Template classico com tema de fogo para servidores MuOnline.', badge: '', discount: 0, tag: '', active: true, createdAt: new Date().toISOString() }
    ];

    saveProducts(defaults);
}

function addProduct(productData) {
    const products = getProducts();
    const newProduct = {
        id: getNextProductId(),
        name: productData.name,
        price: parseFloat(productData.price),
        oldPrice: productData.discount > 0 ? parseFloat(productData.price) : null,
        category: productData.category,
        image: productData.image,
        description: productData.description,
        badge: productData.discount > 0 ? ('-' + productData.discount + '%') : (productData.tag || ''),
        discount: parseInt(productData.discount) || 0,
        tag: productData.tag || '',
        fileTags: productData.fileTags || [],
        sale: productData.discount > 0,
        active: true,
        createdAt: new Date().toISOString()
    };

    if (newProduct.discount > 0) {
        newProduct.price = newProduct.price * (1 - newProduct.discount / 100);
        newProduct.price = Math.round(newProduct.price * 100) / 100;
    }

    products.push(newProduct);
    saveProducts(products);
    return newProduct;
}

function updateProduct(id, productData) {
    const products = getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const basePrice = parseFloat(productData.price);
    const discount = parseInt(productData.discount) || 0;

    products[index] = {
        ...products[index],
        name: productData.name,
        price: discount > 0 ? Math.round(basePrice * (1 - discount / 100) * 100) / 100 : basePrice,
        oldPrice: discount > 0 ? basePrice : null,
        category: productData.category,
        image: productData.image || products[index].image,
        description: productData.description,
        badge: discount > 0 ? ('-' + discount + '%') : (productData.tag || ''),
        discount: discount,
        tag: productData.tag || '',
        fileTags: productData.fileTags || [],
        sale: discount > 0,
        updatedAt: new Date().toISOString()
    };

    saveProducts(products);
    return products[index];
}

function deleteProduct(id) {
    let products = getProducts();
    products = products.filter(p => p.id !== id);
    saveProducts(products);
    removeProductFiles(id);
}

function toggleProduct(id) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    if (product) {
        product.active = !product.active;
        saveProducts(products);
    }
    return product;
}

function getProductFiles(productId) {
    const all = JSON.parse(localStorage.getItem(DOWNLOADS_FILES_KEY) || '{}');
    return all[productId] || [];
}

function saveProductFile(productId, fileData) {
    var all = JSON.parse(localStorage.getItem(DOWNLOADS_FILES_KEY) || '{}');
    if (!all[productId]) all[productId] = [];

    all[productId].push({
        id: fileData.id || ('file_' + Date.now()),
        name: fileData.name,
        size: fileData.size,
        type: fileData.type,
        storedInIDB: fileData.storedInIDB || false,
        uploadedAt: fileData.uploadedAt || new Date().toISOString()
    });

    safeLocalStorageSave(DOWNLOADS_FILES_KEY, all);
}

function removeProductFile(productId, fileId) {
    var all = JSON.parse(localStorage.getItem(DOWNLOADS_FILES_KEY) || '{}');
    if (all[productId]) {
        var file = all[productId].find(function(f) { return f.id === fileId; });
        if (file && file.storedInIDB) {
            deleteFileFromIDB(fileId).catch(function() {});
        }
        all[productId] = all[productId].filter(function(f) { return f.id !== fileId; });
        safeLocalStorageSave(DOWNLOADS_FILES_KEY, all);
    }
}

function removeProductFiles(productId) {
    var all = JSON.parse(localStorage.getItem(DOWNLOADS_FILES_KEY) || '{}');
    var files = all[productId] || [];
    files.forEach(function(f) {
        if (f.storedInIDB) deleteFileFromIDB(f.id).catch(function() {});
    });
    delete all[productId];
    safeLocalStorageSave(DOWNLOADS_FILES_KEY, all);
}

function handleImageUpload(file) {
    return new Promise(function(resolve, reject) {
        if (!file) { reject('Nenhum arquivo selecionado'); return; }
        if (!file.type.startsWith('image/')) { reject('Arquivo deve ser uma imagem'); return; }
        if (file.size > 5 * 1024 * 1024) { reject('Imagem deve ter no maximo 5MB'); return; }

        var reader = new FileReader();
        reader.onerror = function() { reject('Erro ao ler arquivo'); };
        reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
                try {
                    var canvas = document.createElement('canvas');
                    var maxW = 800, maxH = 800;
                    var w = img.width, h = img.height;
                    if (w > maxW || h > maxH) {
                        var ratio = Math.min(maxW / w, maxH / h);
                        w = Math.round(w * ratio);
                        h = Math.round(h * ratio);
                    }
                    canvas.width = w;
                    canvas.height = h;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    var quality = 0.7;
                    var result = canvas.toDataURL('image/jpeg', quality);
                    while (result.length > 150000 && quality > 0.2) {
                        quality -= 0.1;
                        result = canvas.toDataURL('image/jpeg', quality);
                    }
                    resolve(result);
                } catch (err) {
                    reject('Erro ao comprimir imagem: ' + err.message);
                }
            };
            img.onerror = function() { reject('Erro ao carregar imagem'); };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

var _idb = null;
function getFileDB() {
    return new Promise(function(resolve, reject) {
        if (_idb) { resolve(_idb); return; }
        var request = indexedDB.open('wgdsign_files_db', 1);
        request.onupgradeneeded = function(e) {
            var db = e.target.result;
            if (!db.objectStoreNames.contains('files')) {
                db.createObjectStore('files', { keyPath: 'id' });
            }
        };
        request.onsuccess = function(e) { _idb = e.target.result; resolve(_idb); };
        request.onerror = function() { reject('Erro ao abrir banco de arquivos'); };
    });
}

function saveFileToIDB(fileData) {
    return getFileDB().then(function(db) {
        return new Promise(function(resolve, reject) {
            var tx = db.transaction('files', 'readwrite');
            tx.objectStore('files').put(fileData);
            tx.oncomplete = function() { resolve(); };
            tx.onerror = function() { reject('Erro ao salvar arquivo'); };
        });
    });
}

function getFileFromIDB(fileId) {
    return getFileDB().then(function(db) {
        return new Promise(function(resolve, reject) {
            var tx = db.transaction('files', 'readonly');
            var req = tx.objectStore('files').get(fileId);
            req.onsuccess = function() { resolve(req.result || null); };
            req.onerror = function() { reject('Erro ao ler arquivo'); };
        });
    });
}

function deleteFileFromIDB(fileId) {
    return getFileDB().then(function(db) {
        return new Promise(function(resolve, reject) {
            var tx = db.transaction('files', 'readwrite');
            tx.objectStore('files').delete(fileId);
            tx.oncomplete = function() { resolve(); };
            tx.onerror = function() { reject('Erro ao deletar arquivo'); };
        });
    });
}

function handleFileUpload(file) {
    return new Promise(function(resolve, reject) {
        if (!file) { reject('Nenhum arquivo selecionado'); return; }
        if (file.size > 50 * 1024 * 1024) { reject('Arquivo deve ter no maximo 50MB'); return; }

        var reader = new FileReader();
        reader.onerror = function() { reject('Erro ao ler arquivo'); };
        reader.onload = function(e) {
            var fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
            var fileData = {
                id: fileId,
                name: file.name,
                size: file.size,
                type: file.type,
                data: e.target.result,
                uploadedAt: new Date().toISOString()
            };
            saveFileToIDB(fileData).then(function() {
                resolve({
                    id: fileId,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    storedInIDB: true,
                    uploadedAt: fileData.uploadedAt
                });
            }).catch(function(err) {
                reject('Erro ao salvar arquivo: ' + err);
            });
        };
        reader.readAsDataURL(file);
    });
}

function safeLocalStorageSave(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            cleanupLocalStorageBase64();
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (e2) {
                showToast('Erro: Armazenamento cheio! Tente remover imagens antigas ou use URLs externas.', 'error');
                return false;
            }
        }
        throw e;
    }
}

function cleanupLocalStorageBase64() {
    var keys = [PRODUCTS_KEY, PORTFOLIO_KEY, SLIDES_KEY];
    keys.forEach(function(key) {
        var raw = localStorage.getItem(key);
        if (!raw) return;
        try {
            var items = JSON.parse(raw);
            var changed = false;
            items.forEach(function(item) {
                if (item.image && item.image.startsWith('data:') && item.image.length > 5000) {
                    item.image = '';
                    changed = true;
                }
            });
            if (changed) {
                localStorage.setItem(key, JSON.stringify(items));
            }
        } catch(e) {}
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function renderProductsList() {
    const products = getProducts();
    const container = document.getElementById('adminProductsList');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = '<div class="admin-empty"><i class="ri-inbox-line"></i><p>Nenhum produto cadastrado</p></div>';
        return;
    }

    const stats = document.getElementById('adminStats');
    if (stats) {
        const active = products.filter(p => p.active).length;
        const totalValue = products.reduce((s, p) => s + p.price, 0);
        stats.innerHTML =
            '<div class="admin-stat"><i class="ri-shopping-bag-3-line"></i><div><span class="stat-number">' + products.length + '</span><span class="stat-label">Total Produtos</span></div></div>' +
            '<div class="admin-stat"><i class="ri-check-double-line"></i><div><span class="stat-number">' + active + '</span><span class="stat-label">Ativos</span></div></div>' +
            '<div class="admin-stat"><i class="ri-close-circle-line"></i><div><span class="stat-number">' + (products.length - active) + '</span><span class="stat-label">Inativos</span></div></div>' +
            '<div class="admin-stat"><i class="ri-money-dollar-circle-line"></i><div><span class="stat-number">R$ ' + totalValue.toFixed(2).replace('.', ',') + '</span><span class="stat-label">Valor Total</span></div></div>';
    }

    var html = '';
    products.forEach(function(product) {
        var imgSrc = product.image;
        if (imgSrc && !imgSrc.startsWith('data:') && !imgSrc.startsWith('http') && !imgSrc.startsWith('../')) {
            imgSrc = '../' + imgSrc;
        }
        var files = getProductFiles(product.id);

        html += '<div class="admin-product-item ' + (!product.active ? 'inactive' : '') + '">';
        html += '<div class="admin-product-image"><img src="' + imgSrc + '" alt="' + product.name + '" onerror="this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23888%22 font-size=%2210%22>Sem imagem</text></svg>\'"></div>';
        html += '<div class="admin-product-info">';
        html += '<div class="admin-product-header">';
        html += '<h3>' + product.name + '</h3>';
        html += '<div class="admin-product-badges">';
        if (product.badge) html += '<span class="admin-badge badge-tag">' + product.badge + '</span>';
        html += '<span class="admin-badge ' + (product.active ? 'badge-active' : 'badge-inactive') + '">' + (product.active ? 'Ativo' : 'Inativo') + '</span>';
        html += '<span class="admin-badge badge-cat">' + product.category + '</span>';
        html += '</div></div>';
        html += '<p class="admin-product-desc">' + product.description + '</p>';
        html += '<div class="admin-product-meta">';
        html += '<span class="admin-price">R$ ' + product.price.toFixed(2).replace('.', ',') + '</span>';
        if (product.oldPrice && product.discount > 0) {
            html += '<span class="admin-price-old">R$ ' + product.oldPrice.toFixed(2).replace('.', ',') + '</span>';
            html += '<span class="admin-discount">-' + product.discount + '%</span>';
        }
        html += '<span class="admin-files-count"><i class="ri-file-line"></i> ' + files.length + ' arquivo(s)</span>';
        html += '</div>';
        html += '<div class="admin-product-actions">';
        html += '<button class="admin-btn admin-btn-edit" onclick="openEditProduct(' + product.id + ')"><i class="ri-edit-line"></i> Editar</button>';
        html += '<button class="admin-btn admin-btn-files" onclick="openFilesManager(' + product.id + ')"><i class="ri-upload-cloud-line"></i> Arquivos</button>';
        html += '<button class="admin-btn admin-btn-toggle" onclick="handleToggleProduct(' + product.id + ')"><i class="ri-' + (product.active ? 'eye-off-line' : 'eye-line') + '"></i> ' + (product.active ? 'Desativar' : 'Ativar') + '</button>';
        html += '<button class="admin-btn admin-btn-delete" onclick="handleDeleteProduct(' + product.id + ')"><i class="ri-delete-bin-line"></i> Excluir</button>';
        html += '</div></div></div>';
    });

    container.innerHTML = html;
}

function openAddProduct() {
    editingProductId = null;
    document.getElementById('formTitle').textContent = 'Adicionar Produto';
    document.getElementById('productForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    setSelectedFileTags([]);
    populateCategorySelects();
    renderInlineFilesList(null);
    document.getElementById('productFormModal').classList.add('open');
    document.getElementById('adminOverlay').classList.add('open');
}

function openEditProduct(id) {
    const products = getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return;

    editingProductId = id;
    document.getElementById('formTitle').textContent = 'Editar Produto';
    populateCategorySelects();

    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.oldPrice || product.price;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productDiscount').value = product.discount || 0;
    if (document.getElementById('productTag')) document.getElementById('productTag').value = product.tag || '';
    setSelectedFileTags(product.fileTags || []);
    document.getElementById('productImageUrl').value = product.image.startsWith('data:') ? '' : product.image;

    var imgSrc = product.image;
    if (imgSrc && !imgSrc.startsWith('data:') && !imgSrc.startsWith('http') && !imgSrc.startsWith('../')) {
        imgSrc = '../' + imgSrc;
    }
    document.getElementById('imagePreview').innerHTML = '<img src="' + imgSrc + '" alt="Preview">';

    renderInlineFilesList(id);
    document.getElementById('productFormModal').classList.add('open');
    document.getElementById('adminOverlay').classList.add('open');
}

function closeProductForm() {
    document.getElementById('productFormModal').classList.remove('open');
    document.getElementById('adminOverlay').classList.remove('open');
    editingProductId = null;
}

function handleProductSubmit(e) {
    e.preventDefault();

    var name = document.getElementById('productName').value.trim();
    var price = document.getElementById('productPrice').value;
    var category = document.getElementById('productCategory').value;
    var description = document.getElementById('productDescription').value.trim();
    var discount = document.getElementById('productDiscount').value;
    var tag = document.getElementById('productTag') ? document.getElementById('productTag').value.trim() : '';
    var fileTags = getSelectedFileTags();
    var imageUrl = document.getElementById('productImageUrl').value.trim();
    var imageFile = document.getElementById('productImageFile').files[0];
    var downloadFile = document.getElementById('productDownloadFile').files[0];

    if (!name || !price || !category || !description) {
        showToast('Preencha todos os campos obrigatorios!', 'error');
        return;
    }

    var processForm = function(imageResult) {
        var productData = {
            name: name,
            price: price,
            category: category,
            description: description,
            discount: discount,
            tag: tag,
            fileTags: fileTags,
            image: imageResult || imageUrl || ''
        };

        var productId;
        if (editingProductId) {
            if (!productData.image) {
                var existing = getProducts().find(function(p) { return p.id === editingProductId; });
                if (existing) productData.image = existing.image;
            }
            updateProduct(editingProductId, productData);
            productId = editingProductId;
            showToast('Produto atualizado com sucesso!', 'success');
        } else {
            if (!productData.image) {
                showToast('Adicione uma imagem para o produto!', 'error');
                return;
            }
            var newProd = addProduct(productData);
            productId = newProd.id;
            showToast('Produto adicionado com sucesso!', 'success');
        }

        if (downloadFile) {
            handleFileUpload(downloadFile).then(function(fileData) {
                saveProductFile(productId, fileData);
                updateAllUserDownloads(productId);
                showToast('Arquivo de download adicionado!', 'success');
                renderProductsList();
            }).catch(function(err) {
                showToast('Produto salvo, mas erro no arquivo: ' + err, 'error');
            });
        }

        closeProductForm();
        renderProductsList();
    };

    if (imageFile) {
        handleImageUpload(imageFile).then(processForm).catch(function(err) {
            showToast(err, 'error');
        });
    } else {
        processForm(null);
    }
}

function handleDeleteProduct(id) {
    var product = getProducts().find(function(p) { return p.id === id; });
    if (!product) return;

    if (confirm('Excluir "' + product.name + '"? Esta acao nao pode ser desfeita.')) {
        deleteProduct(id);
        showToast('Produto excluido com sucesso!', 'success');
        renderProductsList();
    }
}

function handleToggleProduct(id) {
    var product = toggleProduct(id);
    if (product) {
        showToast(product.name + (product.active ? ' ativado!' : ' desativado!'), 'success');
        renderProductsList();
    }
}

function openFilesManager(productId) {
    var product = getProducts().find(function(p) { return p.id === productId; });
    if (!product) return;

    document.getElementById('filesProductId').value = productId;
    document.getElementById('filesProductName').textContent = product.name;
    renderFilesList(productId);

    document.getElementById('filesManagerModal').classList.add('open');
    document.getElementById('adminOverlay').classList.add('open');
}

function closeFilesManager() {
    document.getElementById('filesManagerModal').classList.remove('open');
    document.getElementById('adminOverlay').classList.remove('open');
}

function renderFilesList(productId) {
    var files = getProductFiles(productId);
    var container = document.getElementById('filesList');
    if (!container) return;

    if (files.length === 0) {
        container.innerHTML = '<div class="admin-empty-small"><i class="ri-folder-line"></i><p>Nenhum arquivo adicionado</p></div>';
        return;
    }

    var html = '';
    files.forEach(function(file) {
        var date = new Date(file.uploadedAt).toLocaleDateString('pt-BR');
        var icon = 'ri-file-line';
        if (file.type && file.type.includes('image')) icon = 'ri-image-line';
        else if (file.type && file.type.includes('zip')) icon = 'ri-file-zip-line';
        else if (file.type && file.type.includes('pdf')) icon = 'ri-file-pdf-line';
        else if (file.name && (file.name.endsWith('.psd') || file.name.endsWith('.PSD'))) icon = 'ri-file-psd-2-line';
        else if (file.name && file.name.endsWith('.rar')) icon = 'ri-file-zip-line';

        html += '<div class="admin-file-item">';
        html += '<div class="admin-file-icon"><i class="' + icon + '"></i></div>';
        html += '<div class="admin-file-info">';
        html += '<span class="admin-file-name">' + file.name + '</span>';
        html += '<span class="admin-file-meta">' + formatFileSize(file.size) + ' - ' + date + '</span>';
        html += '</div>';
        html += '<button class="admin-btn admin-btn-delete-sm" onclick="handleRemoveFile(' + productId + ', \'' + file.id + '\')"><i class="ri-delete-bin-line"></i></button>';
        html += '</div>';
    });

    container.innerHTML = html;
}

function handleFileUploadSubmit() {
    var productId = parseInt(document.getElementById('filesProductId').value);
    var fileInput = document.getElementById('downloadFile');
    var file = fileInput.files[0];

    if (!file) {
        showToast('Selecione um arquivo!', 'error');
        return;
    }

    var uploadBtn = document.getElementById('uploadFileBtn');
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="ri-loader-4-line"></i> Enviando...';

    handleFileUpload(file).then(function(fileData) {
        saveProductFile(productId, fileData);
        showToast('Arquivo "' + fileData.name + '" adicionado!', 'success');
        renderFilesList(productId);
        fileInput.value = '';
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="ri-upload-cloud-line"></i> Upload';

        updateAllUserDownloads(productId);
    }).catch(function(err) {
        showToast(err, 'error');
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="ri-upload-cloud-line"></i> Upload';
    });
}

function handleRemoveFile(productId, fileId) {
    if (confirm('Remover este arquivo?')) {
        removeProductFile(productId, fileId);
        showToast('Arquivo removido!', 'success');
        renderFilesList(productId);
    }
}

function updateAllUserDownloads(productId) {
    var product = getProducts().find(function(p) { return p.id === productId || Number(p.id) === Number(productId); });
    if (!product) return;

    var files = getProductFiles(productId);
    if (files.length === 0) return;

    var users = JSON.parse(localStorage.getItem('wgdsign_users') || '[]');
    users.forEach(function(user) {
        try {
            var downloads = JSON.parse(localStorage.getItem('wgdsign_downloads_' + user.uid) || '[]');
            var download = downloads.find(function(d) { return Number(d.productId) === Number(productId); });
            if (download) {
                download.files = files.map(function(f) {
                    return { id: f.id, name: f.name, size: f.size, type: f.type, storedInIDB: f.storedInIDB || false };
                });
                localStorage.setItem('wgdsign_downloads_' + user.uid, JSON.stringify(downloads));
            }
        } catch (e) {}
    });
}

function renderOrdersList() {
    var container = document.getElementById('adminOrdersList');
    if (!container) return;

    var allOrders = [];
    var users = JSON.parse(localStorage.getItem('wgdsign_users') || '[]');

    users.forEach(function(user) {
        var purchases = JSON.parse(localStorage.getItem('wgdsign_purchases_' + user.uid) || '[]');
        purchases.forEach(function(p) {
            allOrders.push({
                order: p,
                user: { name: user.name, email: user.email }
            });
        });
    });

    var googleUser = JSON.parse(localStorage.getItem('wgdsign_user'));
    if (googleUser && googleUser.provider === 'google.com') {
        var gPurchases = JSON.parse(localStorage.getItem('wgdsign_purchases_' + googleUser.uid) || '[]');
        gPurchases.forEach(function(p) {
            if (!allOrders.find(function(o) { return o.order.id === p.id; })) {
                allOrders.push({
                    order: p,
                    user: { name: googleUser.name, email: googleUser.email }
                });
            }
        });
    }

    allOrders.sort(function(a, b) { return new Date(b.order.date) - new Date(a.order.date); });

    var statsContainer = document.getElementById('ordersStats');
    if (statsContainer) {
        var totalRevenue = allOrders.reduce(function(s, o) { return s + (o.order.total || 0); }, 0);
        statsContainer.innerHTML =
            '<div class="admin-stat"><i class="ri-file-list-3-line"></i><div><span class="stat-number">' + allOrders.length + '</span><span class="stat-label">Total Pedidos</span></div></div>' +
            '<div class="admin-stat"><i class="ri-money-dollar-circle-line"></i><div><span class="stat-number">R$ ' + totalRevenue.toFixed(2).replace('.', ',') + '</span><span class="stat-label">Receita Total</span></div></div>';
    }

    if (allOrders.length === 0) {
        container.innerHTML = '<div class="admin-empty"><i class="ri-inbox-line"></i><p>Nenhum pedido encontrado</p></div>';
        return;
    }

    var methodNames = { pix: 'PIX', mercadopago: 'Mercado Pago', boleto: 'Boleto' };
    var html = '';
    allOrders.forEach(function(entry) {
        var date = new Date(entry.order.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

        html += '<div class="admin-order-item">';
        html += '<div class="admin-order-header">';
        html += '<span class="admin-order-id">' + entry.order.id + '</span>';
        html += '<span class="admin-order-date">' + date + '</span>';
        html += '</div>';
        html += '<div class="admin-order-body">';
        html += '<div class="admin-order-user"><i class="ri-user-line"></i> ' + entry.user.name + ' (' + entry.user.email + ')</div>';
        html += '<div class="admin-order-products">';
        if (entry.order.items) {
            entry.order.items.forEach(function(item) {
                html += '<span class="admin-order-product">' + item.name + '</span>';
            });
        }
        html += '</div>';
        html += '<div class="admin-order-footer">';
        html += '<span class="admin-order-method">' + (methodNames[entry.order.paymentMethod] || entry.order.paymentMethod) + '</span>';
        html += '<span class="admin-order-total">R$ ' + entry.order.total.toFixed(2).replace('.', ',') + '</span>';
        html += '<span class="admin-order-status status-' + entry.order.status + '">' + (entry.order.status === 'approved' ? 'Aprovado' : 'Pendente') + '</span>';
        html += '</div></div></div>';
    });

    container.innerHTML = html;
}

function renderMembersList() {
    var container = document.getElementById('adminMembersList');
    if (!container) return;

    var users = JSON.parse(localStorage.getItem('wgdsign_users') || '[]');
    var allMembers = users.map(function(u) {
        var purchases = JSON.parse(localStorage.getItem('wgdsign_purchases_' + u.uid) || '[]');
        var total = purchases.reduce(function(s, p) { return s + (p.total || 0); }, 0);
        return { name: u.name, email: u.email, uid: u.uid, orders: purchases.length, total: total, createdAt: u.createdAt };
    });

    var googleUser = JSON.parse(localStorage.getItem('wgdsign_user'));
    if (googleUser && googleUser.provider === 'google.com') {
        if (!allMembers.find(function(m) { return m.uid === googleUser.uid; })) {
            var gp = JSON.parse(localStorage.getItem('wgdsign_purchases_' + googleUser.uid) || '[]');
            allMembers.push({ name: googleUser.name, email: googleUser.email, uid: googleUser.uid, orders: gp.length, total: gp.reduce(function(s, p) { return s + (p.total || 0); }, 0) });
        }
    }

    var membersStats = document.getElementById('membersStats');
    if (membersStats) {
        membersStats.innerHTML =
            '<div class="admin-stat"><i class="ri-group-line"></i><div><span class="stat-number">' + allMembers.length + '</span><span class="stat-label">Total Membros</span></div></div>';
    }

    if (allMembers.length === 0) {
        container.innerHTML = '<div class="admin-empty"><i class="ri-group-line"></i><p>Nenhum membro cadastrado</p></div>';
        return;
    }

    var html = '';
    allMembers.forEach(function(member) {
        html += '<div class="admin-member-item">';
        html += '<div class="admin-member-avatar"><i class="ri-user-line"></i></div>';
        html += '<div class="admin-member-info">';
        html += '<span class="admin-member-name">' + member.name + '</span>';
        html += '<span class="admin-member-email">' + member.email + '</span>';
        html += '</div>';
        html += '<div class="admin-member-stats">';
        html += '<span>' + member.orders + ' pedido(s)</span>';
        html += '<span class="admin-member-total">R$ ' + member.total.toFixed(2).replace('.', ',') + '</span>';
        html += '</div></div>';
    });

    container.innerHTML = html;
}

function previewImage() {
    var fileInput = document.getElementById('productImageFile');
    var preview = document.getElementById('imagePreview');
    var file = fileInput.files[0];

    if (file) {
        handleImageUpload(file).then(function(dataUrl) {
            preview.innerHTML = '<img src="' + dataUrl + '" alt="Preview">';
        }).catch(function(err) {
            showToast(err, 'error');
        });
    }
}

function previewImageFromUrl() {
    var url = document.getElementById('productImageUrl').value.trim();
    var preview = document.getElementById('imagePreview');
    if (url) {
        preview.innerHTML = '<img src="' + url + '" alt="Preview" onerror="this.parentElement.innerHTML=\'<p>URL invalida</p>\'">';
    }
}

function initAdminPanel() {
    if (!checkAdminAccess()) return;

    initDefaultCategories();
    initDefaultProducts();
    initDefaultPortfolio();
    initDefaultSlides();
    populateCategorySelects();
    renderProductsList();
    renderOrdersList();
    renderMembersList();
    renderPortfolioList();
    renderSlidesList();
    renderCategoriesList();
    renderAllDownloads();
    initAdminTabs();

    var user = JSON.parse(localStorage.getItem('wgdsign_user'));
    if (user) {
        var adminName = document.getElementById('adminUserName');
        if (adminName) adminName.textContent = user.name;
    }
}

function initAdminTabs() {
    var navBtns = document.querySelectorAll('.admin-nav-btn');
    navBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var tab = this.dataset.tab;

            if (tab === 'logout') {
                logoutUser();
                return;
            }

            if (tab === 'voltar-painel') {
                window.location.href = 'painel.html';
                return;
            }

            navBtns.forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');

            document.querySelectorAll('.admin-tab').forEach(function(t) { t.classList.remove('active'); });
            var target = document.getElementById('tab-' + tab);
            if (target) target.classList.add('active');

            if (tab === 'produtos') { renderProductsList(); populateCategorySelects(); }
            if (tab === 'pedidos') renderOrdersList();
            if (tab === 'membros') renderMembersList();
            if (tab === 'portfolio') { renderPortfolioList(); populateCategorySelects(); }
            if (tab === 'slides') renderSlidesList();
            if (tab === 'categorias') renderCategoriesList();
            if (tab === 'downloads') renderAllDownloads();
        });
    });
}

function getPortfolio() {
    var stored = localStorage.getItem(PORTFOLIO_KEY);
    if (stored) return JSON.parse(stored);
    return [];
}

function savePortfolio(items) {
    return safeLocalStorageSave(PORTFOLIO_KEY, items);
}

function getNextPortfolioId() {
    var items = getPortfolio();
    if (items.length === 0) return 1;
    return Math.max.apply(null, items.map(function(p) { return p.id; })) + 1;
}

function initDefaultPortfolio() {
    var existing = localStorage.getItem(PORTFOLIO_KEY);
    if (existing) return;

    var defaults = [
        { id: 1, title: 'Launcher 01', category: 'launchers', image: 'assets/img/launchers/l-1.jpg', description: 'Layout PSD moderno e impactante para servidores MuOnline.', active: true, createdAt: new Date().toISOString() },
        { id: 2, title: 'Launcher 02', category: 'launchers', image: 'assets/img/launchers/l-2.jpg', description: 'Layout PSD com interface intuitiva e botoes bem posicionados.', active: true, createdAt: new Date().toISOString() },
        { id: 3, title: 'Logo 01', category: 'logos', image: 'assets/img/logos/logo-01.jpg', description: 'Identidade visual moderna e impactante para servidores.', active: true, createdAt: new Date().toISOString() },
        { id: 4, title: 'Template 01', category: 'templates', image: 'assets/img/templates/tema-01.jpg', description: 'Layout PSD elegante com janelas de login e cadastro editaveis.', active: true, createdAt: new Date().toISOString() },
        { id: 5, title: 'Pack 01', category: 'banners', image: 'assets/img/banners/01.jpg', description: 'Colecao de banners em alta qualidade para redes sociais.', active: true, createdAt: new Date().toISOString() },
        { id: 6, title: 'Launcher 03', category: 'launchers', image: 'assets/img/launchers/l-3.jpg', description: 'Layout PSD moderno e leve com visual limpo e profissional.', active: true, createdAt: new Date().toISOString() }
    ];

    savePortfolio(defaults);
}

function addPortfolioItem(data) {
    var items = getPortfolio();
    var newItem = {
        id: getNextPortfolioId(),
        title: data.title,
        category: data.category,
        image: data.image,
        description: data.description || '',
        active: true,
        createdAt: new Date().toISOString()
    };
    items.push(newItem);
    savePortfolio(items);
    return newItem;
}

function updatePortfolioItem(id, data) {
    var items = getPortfolio();
    var index = items.findIndex(function(p) { return p.id === id; });
    if (index === -1) return null;

    items[index] = {
        ...items[index],
        title: data.title,
        category: data.category,
        image: data.image || items[index].image,
        description: data.description || '',
        updatedAt: new Date().toISOString()
    };

    savePortfolio(items);
    return items[index];
}

function deletePortfolioItem(id) {
    var items = getPortfolio();
    items = items.filter(function(p) { return p.id !== id; });
    savePortfolio(items);
}

function togglePortfolioItem(id) {
    var items = getPortfolio();
    var item = items.find(function(p) { return p.id === id; });
    if (item) {
        item.active = !item.active;
        savePortfolio(items);
    }
    return item;
}

function renderPortfolioList() {
    var items = getPortfolio();
    var container = document.getElementById('adminPortfolioList');
    if (!container) return;

    var portfolioStats = document.getElementById('portfolioStats');
    if (portfolioStats) {
        var active = items.filter(function(p) { return p.active; }).length;
        var cats = {};
        items.forEach(function(p) { cats[p.category] = (cats[p.category] || 0) + 1; });
        portfolioStats.innerHTML =
            '<div class="admin-stat"><i class="ri-image-line"></i><div><span class="stat-number">' + items.length + '</span><span class="stat-label">Total Trabalhos</span></div></div>' +
            '<div class="admin-stat"><i class="ri-check-double-line"></i><div><span class="stat-number">' + active + '</span><span class="stat-label">Ativos</span></div></div>' +
            '<div class="admin-stat"><i class="ri-folders-line"></i><div><span class="stat-number">' + Object.keys(cats).length + '</span><span class="stat-label">Categorias</span></div></div>';
    }

    if (items.length === 0) {
        container.innerHTML = '<div class="admin-empty"><i class="ri-image-line"></i><p>Nenhum trabalho cadastrado no portfolio</p></div>';
        return;
    }

    var html = '';
    items.forEach(function(item) {
        var imgSrc = item.image;
        if (imgSrc && !imgSrc.startsWith('data:') && !imgSrc.startsWith('http') && !imgSrc.startsWith('../')) {
            imgSrc = '../' + imgSrc;
        }

        html += '<div class="admin-product-item ' + (!item.active ? 'inactive' : '') + '">';
        html += '<div class="admin-product-image"><img src="' + imgSrc + '" alt="' + item.title + '" onerror="this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23888%22 font-size=%2210%22>Sem imagem</text></svg>\'"></div>';
        html += '<div class="admin-product-info">';
        html += '<div class="admin-product-header">';
        html += '<h3>' + item.title + '</h3>';
        html += '<div class="admin-product-badges">';
        html += '<span class="admin-badge ' + (item.active ? 'badge-active' : 'badge-inactive') + '">' + (item.active ? 'Ativo' : 'Inativo') + '</span>';
        html += '<span class="admin-badge badge-cat">' + item.category + '</span>';
        html += '</div></div>';
        if (item.description) {
            html += '<p class="admin-product-desc">' + item.description + '</p>';
        }
        html += '<div class="admin-product-actions">';
        html += '<button class="admin-btn admin-btn-edit" onclick="openEditPortfolio(' + item.id + ')"><i class="ri-edit-line"></i> Editar</button>';
        html += '<button class="admin-btn admin-btn-toggle" onclick="handleTogglePortfolio(' + item.id + ')"><i class="ri-' + (item.active ? 'eye-off-line' : 'eye-line') + '"></i> ' + (item.active ? 'Desativar' : 'Ativar') + '</button>';
        html += '<button class="admin-btn admin-btn-delete" onclick="handleDeletePortfolio(' + item.id + ')"><i class="ri-delete-bin-line"></i> Excluir</button>';
        html += '</div></div></div>';
    });

    container.innerHTML = html;
}

function openAddPortfolio() {
    editingPortfolioId = null;
    document.getElementById('portfolioFormTitle').textContent = 'Adicionar ao Portfolio';
    document.getElementById('portfolioForm').reset();
    document.getElementById('portfolioImagePreview').innerHTML = '';
    populateCategorySelects();
    document.getElementById('portfolioFormModal').classList.add('open');
    document.getElementById('adminOverlay').classList.add('open');
}

function openEditPortfolio(id) {
    var items = getPortfolio();
    var item = items.find(function(p) { return p.id === id; });
    if (!item) return;

    editingPortfolioId = id;
    document.getElementById('portfolioFormTitle').textContent = 'Editar Trabalho';
    populateCategorySelects();
    document.getElementById('portfolioTitle').value = item.title;
    document.getElementById('portfolioCategory').value = item.category;
    document.getElementById('portfolioDescription').value = item.description || '';
    document.getElementById('portfolioImageUrl').value = item.image.startsWith('data:') ? '' : item.image;

    var imgSrc = item.image;
    if (imgSrc && !imgSrc.startsWith('data:') && !imgSrc.startsWith('http') && !imgSrc.startsWith('../')) {
        imgSrc = '../' + imgSrc;
    }
    document.getElementById('portfolioImagePreview').innerHTML = '<img src="' + imgSrc + '" alt="Preview">';

    document.getElementById('portfolioFormModal').classList.add('open');
    document.getElementById('adminOverlay').classList.add('open');
}

function closePortfolioForm() {
    document.getElementById('portfolioFormModal').classList.remove('open');
    document.getElementById('adminOverlay').classList.remove('open');
    editingPortfolioId = null;
}

function handlePortfolioSubmit(e) {
    e.preventDefault();

    var title = document.getElementById('portfolioTitle').value.trim();
    var category = document.getElementById('portfolioCategory').value;
    var description = document.getElementById('portfolioDescription').value.trim();
    var imageUrl = document.getElementById('portfolioImageUrl').value.trim();
    var imageFile = document.getElementById('portfolioImageFile').files[0];

    if (!title || !category) {
        showToast('Preencha titulo e categoria!', 'error');
        return;
    }

    var processForm = function(imageResult) {
        var data = {
            title: title,
            category: category,
            description: description,
            image: imageResult || imageUrl || ''
        };

        if (editingPortfolioId) {
            if (!data.image) {
                var existing = getPortfolio().find(function(p) { return p.id === editingPortfolioId; });
                if (existing) data.image = existing.image;
            }
            updatePortfolioItem(editingPortfolioId, data);
            showToast('Trabalho atualizado com sucesso!', 'success');
        } else {
            if (!data.image) {
                showToast('Adicione uma imagem!', 'error');
                return;
            }
            addPortfolioItem(data);
            showToast('Trabalho adicionado ao portfolio!', 'success');
        }

        closePortfolioForm();
        renderPortfolioList();
    };

    if (imageFile) {
        handleImageUpload(imageFile).then(processForm).catch(function(err) {
            showToast(err, 'error');
        });
    } else {
        processForm(null);
    }
}

function handleDeletePortfolio(id) {
    var item = getPortfolio().find(function(p) { return p.id === id; });
    if (!item) return;

    if (confirm('Excluir "' + item.title + '" do portfolio?')) {
        deletePortfolioItem(id);
        showToast('Trabalho excluido!', 'success');
        renderPortfolioList();
    }
}

function handleTogglePortfolio(id) {
    var item = togglePortfolioItem(id);
    if (item) {
        showToast(item.title + (item.active ? ' ativado!' : ' desativado!'), 'success');
        renderPortfolioList();
    }
}

function previewPortfolioImage() {
    var fileInput = document.getElementById('portfolioImageFile');
    var preview = document.getElementById('portfolioImagePreview');
    var file = fileInput.files[0];

    if (file) {
        handleImageUpload(file).then(function(dataUrl) {
            preview.innerHTML = '<img src="' + dataUrl + '" alt="Preview">';
        }).catch(function(err) {
            showToast(err, 'error');
        });
    }
}

function previewPortfolioImageFromUrl() {
    var url = document.getElementById('portfolioImageUrl').value.trim();
    var preview = document.getElementById('portfolioImagePreview');
    if (url) {
        preview.innerHTML = '<img src="' + url + '" alt="Preview" onerror="this.parentElement.innerHTML=\'<p>URL invalida</p>\'">';
    }
}

function getSlides() {
    var stored = localStorage.getItem(SLIDES_KEY);
    if (stored) return JSON.parse(stored);
    return [];
}

function saveSlides(items) {
    return safeLocalStorageSave(SLIDES_KEY, items);
}

function getNextSlideId() {
    var items = getSlides();
    if (items.length === 0) return 1;
    return Math.max.apply(null, items.map(function(s) { return s.id; })) + 1;
}

function initDefaultSlides() {
    var existing = localStorage.getItem(SLIDES_KEY);
    if (existing) return;

    var defaults = [
        { id: 1, title: 'WGDS Studio', subtitle: 'Design Profissional para Games', description: 'Criamos identidades visuais impactantes para servidores de Mu Online, WYD, PokeTibia e outros games.', image: '', tag: 'Novo', buttonText: 'Ver Portfolio', buttonLink: '#portfolio', active: true, order: 1, createdAt: new Date().toISOString() },
        { id: 2, title: 'Templates Premium', subtitle: 'Sites prontos para seu servidor', description: 'Templates exclusivos com design moderno, responsivo e totalmente editavel em PSD.', image: '', tag: 'Premium', buttonText: 'Ver Templates', buttonLink: '#shop', active: true, order: 2, createdAt: new Date().toISOString() },
        { id: 3, title: 'Game Launchers', subtitle: 'Launchers profissionais', description: 'Launchers modernos com interface intuitiva, auto-update e visual marcante para seu servidor.', image: '', tag: 'Destaque', buttonText: 'Ver Launchers', buttonLink: '#shop', active: true, order: 3, createdAt: new Date().toISOString() }
    ];

    saveSlides(defaults);
}

function addSlide(data) {
    var items = getSlides();
    var newItem = {
        id: getNextSlideId(),
        title: data.title,
        subtitle: data.subtitle || '',
        description: data.description || '',
        image: data.image || '',
        tag: data.tag || '',
        buttonText: data.buttonText || '',
        buttonLink: data.buttonLink || '#',
        active: true,
        order: items.length + 1,
        createdAt: new Date().toISOString()
    };
    items.push(newItem);
    saveSlides(items);
    return newItem;
}

function updateSlide(id, data) {
    var items = getSlides();
    var index = items.findIndex(function(s) { return s.id === id; });
    if (index === -1) return null;

    items[index] = {
        ...items[index],
        title: data.title,
        subtitle: data.subtitle || '',
        description: data.description || '',
        image: data.image || items[index].image,
        tag: data.tag || '',
        buttonText: data.buttonText || '',
        buttonLink: data.buttonLink || '#',
        updatedAt: new Date().toISOString()
    };

    saveSlides(items);
    return items[index];
}

function deleteSlide(id) {
    var items = getSlides();
    items = items.filter(function(s) { return s.id !== id; });
    items.forEach(function(s, i) { s.order = i + 1; });
    saveSlides(items);
}

function toggleSlide(id) {
    var items = getSlides();
    var item = items.find(function(s) { return s.id === id; });
    if (item) {
        item.active = !item.active;
        saveSlides(items);
    }
    return item;
}

function moveSlide(id, direction) {
    var items = getSlides();
    var index = items.findIndex(function(s) { return s.id === id; });
    if (index === -1) return;

    var swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= items.length) return;

    var temp = items[index];
    items[index] = items[swapIndex];
    items[swapIndex] = temp;

    items.forEach(function(s, i) { s.order = i + 1; });
    saveSlides(items);
    renderSlidesList();
}

function renderSlidesList() {
    var items = getSlides();
    var container = document.getElementById('adminSlidesList');
    if (!container) return;

    var slidesStats = document.getElementById('slidesStats');
    if (slidesStats) {
        var active = items.filter(function(s) { return s.active; }).length;
        slidesStats.innerHTML =
            '<div class="admin-stat"><i class="ri-slideshow-line"></i><div><span class="stat-number">' + items.length + '</span><span class="stat-label">Total Slides</span></div></div>' +
            '<div class="admin-stat"><i class="ri-check-double-line"></i><div><span class="stat-number">' + active + '</span><span class="stat-label">Ativos</span></div></div>';
    }

    if (items.length === 0) {
        container.innerHTML = '<div class="admin-empty"><i class="ri-slideshow-line"></i><p>Nenhum slide cadastrado</p></div>';
        return;
    }

    var html = '';
    items.forEach(function(item, idx) {
        var imgSrc = item.image;
        var hasImage = imgSrc && imgSrc.length > 0;
        if (hasImage && !imgSrc.startsWith('data:') && !imgSrc.startsWith('http') && !imgSrc.startsWith('../')) {
            imgSrc = '../' + imgSrc;
        }

        html += '<div class="admin-slide-item ' + (!item.active ? 'inactive' : '') + '">';
        html += '<div class="admin-slide-order"><span class="slide-order-num">' + item.order + '</span>';
        html += '<div class="admin-slide-arrows">';
        if (idx > 0) html += '<button class="admin-btn-arrow" onclick="moveSlide(' + item.id + ',\'up\')"><i class="ri-arrow-up-s-line"></i></button>';
        if (idx < items.length - 1) html += '<button class="admin-btn-arrow" onclick="moveSlide(' + item.id + ',\'down\')"><i class="ri-arrow-down-s-line"></i></button>';
        html += '</div></div>';

        if (hasImage) {
            html += '<div class="admin-slide-thumb"><img src="' + imgSrc + '" alt="' + item.title + '"></div>';
        }

        html += '<div class="admin-product-info">';
        html += '<div class="admin-product-header">';
        html += '<h3>' + item.title + '</h3>';
        html += '<div class="admin-product-badges">';
        if (item.tag) html += '<span class="admin-badge badge-tag">' + item.tag + '</span>';
        html += '<span class="admin-badge ' + (item.active ? 'badge-active' : 'badge-inactive') + '">' + (item.active ? 'Ativo' : 'Inativo') + '</span>';
        html += '</div></div>';
        if (item.subtitle) html += '<p class="admin-slide-subtitle">' + item.subtitle + '</p>';
        if (item.description) html += '<p class="admin-product-desc">' + item.description + '</p>';
        html += '<div class="admin-product-meta">';
        if (item.buttonText) html += '<span class="admin-slide-btn-info"><i class="ri-link"></i> ' + item.buttonText + ' → ' + item.buttonLink + '</span>';
        html += '</div>';
        html += '<div class="admin-product-actions">';
        html += '<button class="admin-btn admin-btn-edit" onclick="openEditSlide(' + item.id + ')"><i class="ri-edit-line"></i> Editar</button>';
        html += '<button class="admin-btn admin-btn-toggle" onclick="handleToggleSlide(' + item.id + ')"><i class="ri-' + (item.active ? 'eye-off-line' : 'eye-line') + '"></i> ' + (item.active ? 'Desativar' : 'Ativar') + '</button>';
        html += '<button class="admin-btn admin-btn-delete" onclick="handleDeleteSlide(' + item.id + ')"><i class="ri-delete-bin-line"></i> Excluir</button>';
        html += '</div></div></div>';
    });

    container.innerHTML = html;
}

function openAddSlide() {
    editingSlideId = null;
    document.getElementById('slideFormTitle').textContent = 'Adicionar Slide';
    document.getElementById('slideForm').reset();
    document.getElementById('slideImagePreview').innerHTML = '';
    document.getElementById('slideFormModal').classList.add('open');
    document.getElementById('adminOverlay').classList.add('open');
}

function openEditSlide(id) {
    var items = getSlides();
    var item = items.find(function(s) { return s.id === id; });
    if (!item) return;

    editingSlideId = id;
    document.getElementById('slideFormTitle').textContent = 'Editar Slide';
    document.getElementById('slideTitle').value = item.title;
    document.getElementById('slideSubtitle').value = item.subtitle || '';
    document.getElementById('slideDescription').value = item.description || '';
    document.getElementById('slideTag').value = item.tag || '';
    document.getElementById('slideButtonText').value = item.buttonText || '';
    document.getElementById('slideButtonLink').value = item.buttonLink || '';
    document.getElementById('slideImageUrl').value = (item.image && !item.image.startsWith('data:')) ? item.image : '';

    if (item.image) {
        var imgSrc = item.image;
        if (imgSrc && !imgSrc.startsWith('data:') && !imgSrc.startsWith('http') && !imgSrc.startsWith('../')) {
            imgSrc = '../' + imgSrc;
        }
        document.getElementById('slideImagePreview').innerHTML = '<img src="' + imgSrc + '" alt="Preview">';
    } else {
        document.getElementById('slideImagePreview').innerHTML = '';
    }

    document.getElementById('slideFormModal').classList.add('open');
    document.getElementById('adminOverlay').classList.add('open');
}

function closeSlideForm() {
    document.getElementById('slideFormModal').classList.remove('open');
    document.getElementById('adminOverlay').classList.remove('open');
    editingSlideId = null;
}

function handleSlideSubmit(e) {
    e.preventDefault();

    var title = document.getElementById('slideTitle').value.trim();
    var subtitle = document.getElementById('slideSubtitle').value.trim();
    var description = document.getElementById('slideDescription').value.trim();
    var tag = document.getElementById('slideTag').value.trim();
    var buttonText = document.getElementById('slideButtonText').value.trim();
    var buttonLink = document.getElementById('slideButtonLink').value.trim();
    var imageUrl = document.getElementById('slideImageUrl').value.trim();
    var imageFile = document.getElementById('slideImageFile').files[0];

    if (!title) {
        showToast('Preencha o titulo do slide!', 'error');
        return;
    }

    var processForm = function(imageResult) {
        var data = {
            title: title,
            subtitle: subtitle,
            description: description,
            tag: tag,
            buttonText: buttonText,
            buttonLink: buttonLink,
            image: imageResult || imageUrl || ''
        };

        if (editingSlideId) {
            if (!data.image) {
                var existing = getSlides().find(function(s) { return s.id === editingSlideId; });
                if (existing) data.image = existing.image;
            }
            updateSlide(editingSlideId, data);
            showToast('Slide atualizado!', 'success');
        } else {
            addSlide(data);
            showToast('Slide adicionado!', 'success');
        }

        closeSlideForm();
        renderSlidesList();
    };

    if (imageFile) {
        handleImageUpload(imageFile).then(processForm).catch(function(err) {
            showToast(err, 'error');
        });
    } else {
        processForm(null);
    }
}

function handleDeleteSlide(id) {
    var item = getSlides().find(function(s) { return s.id === id; });
    if (!item) return;
    if (confirm('Excluir slide "' + item.title + '"?')) {
        deleteSlide(id);
        showToast('Slide excluido!', 'success');
        renderSlidesList();
    }
}

function handleToggleSlide(id) {
    var item = toggleSlide(id);
    if (item) {
        showToast(item.title + (item.active ? ' ativado!' : ' desativado!'), 'success');
        renderSlidesList();
    }
}

function previewSlideImage() {
    var fileInput = document.getElementById('slideImageFile');
    var preview = document.getElementById('slideImagePreview');
    var file = fileInput.files[0];
    if (file) {
        handleImageUpload(file).then(function(dataUrl) {
            preview.innerHTML = '<img src="' + dataUrl + '" alt="Preview">';
        }).catch(function(err) { showToast(err, 'error'); });
    }
}

function previewSlideImageFromUrl() {
    var url = document.getElementById('slideImageUrl').value.trim();
    var preview = document.getElementById('slideImagePreview');
    if (url) {
        preview.innerHTML = '<img src="' + url + '" alt="Preview" onerror="this.parentElement.innerHTML=\'<p>URL invalida</p>\'">';
    }
}

function getCategories() {
    var stored = localStorage.getItem(CATEGORIES_KEY);
    if (stored) return JSON.parse(stored);
    return [];
}

function saveCategories(items) {
    return safeLocalStorageSave(CATEGORIES_KEY, items);
}

function getNextCategoryId() {
    var items = getCategories();
    if (items.length === 0) return 1;
    return Math.max.apply(null, items.map(function(c) { return c.id; })) + 1;
}

function initDefaultCategories() {
    var existing = localStorage.getItem(CATEGORIES_KEY);
    if (existing) return;

    var defaults = [
        { id: 1, name: 'Launchers', slug: 'launchers', icon: 'ri-rocket-2-line', description: 'Game Launchers para servidores', type: 'ambos', active: true, createdAt: new Date().toISOString() },
        { id: 2, name: 'Templates', slug: 'templates', icon: 'ri-layout-4-line', description: 'Templates web para servidores', type: 'ambos', active: true, createdAt: new Date().toISOString() },
        { id: 3, name: 'Logos', slug: 'logos', icon: 'ri-pen-nib-line', description: 'Logotipos e identidade visual', type: 'ambos', active: true, createdAt: new Date().toISOString() },
        { id: 4, name: 'Banners', slug: 'banners', icon: 'ri-image-line', description: 'Banners para redes sociais', type: 'ambos', active: true, createdAt: new Date().toISOString() }
    ];

    saveCategories(defaults);
}

function addCategory(data) {
    var items = getCategories();
    var slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (items.find(function(c) { return c.slug === slug && c.id !== data.id; })) {
        showToast('Ja existe uma categoria com esse slug!', 'error');
        return null;
    }
    var newItem = {
        id: getNextCategoryId(),
        name: data.name,
        slug: slug,
        icon: data.icon || 'ri-folder-line',
        description: data.description || '',
        type: data.type || 'ambos',
        active: true,
        createdAt: new Date().toISOString()
    };
    items.push(newItem);
    saveCategories(items);
    return newItem;
}

function updateCategory(id, data) {
    var items = getCategories();
    var index = items.findIndex(function(c) { return c.id === id; });
    if (index === -1) return null;

    var slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (items.find(function(c) { return c.slug === slug && c.id !== id; })) {
        showToast('Ja existe uma categoria com esse slug!', 'error');
        return null;
    }

    var oldSlug = items[index].slug;
    items[index] = {
        ...items[index],
        name: data.name,
        slug: slug,
        icon: data.icon || items[index].icon,
        description: data.description || '',
        type: data.type || items[index].type,
        updatedAt: new Date().toISOString()
    };

    saveCategories(items);

    if (oldSlug !== slug) {
        migrateCategorySlug(oldSlug, slug);
    }

    return items[index];
}

function migrateCategorySlug(oldSlug, newSlug) {
    var products = getProducts();
    var changed = false;
    products.forEach(function(p) {
        if (p.category === oldSlug) { p.category = newSlug; changed = true; }
    });
    if (changed) saveProducts(products);

    var portfolio = getPortfolio();
    changed = false;
    portfolio.forEach(function(p) {
        if (p.category === oldSlug) { p.category = newSlug; changed = true; }
    });
    if (changed) savePortfolio(portfolio);
}

function deleteCategory(id) {
    var items = getCategories();
    items = items.filter(function(c) { return c.id !== id; });
    saveCategories(items);
}

function toggleCategory(id) {
    var items = getCategories();
    var item = items.find(function(c) { return c.id === id; });
    if (item) {
        item.active = !item.active;
        saveCategories(items);
    }
    return item;
}

function getCategoriesByType(type) {
    var cats = getCategories().filter(function(c) { return c.active; });
    if (type === 'shop') return cats.filter(function(c) { return c.type === 'shop' || c.type === 'ambos'; });
    if (type === 'portfolio') return cats.filter(function(c) { return c.type === 'portfolio' || c.type === 'ambos'; });
    return cats;
}

function renderCategoriesList() {
    var items = getCategories();
    var container = document.getElementById('adminCategoriesList');
    if (!container) return;

    var catStats = document.getElementById('categoriesStats');
    if (catStats) {
        var active = items.filter(function(c) { return c.active; }).length;
        var shopCount = items.filter(function(c) { return c.type === 'shop' || c.type === 'ambos'; }).length;
        var portfolioCount = items.filter(function(c) { return c.type === 'portfolio' || c.type === 'ambos'; }).length;
        catStats.innerHTML =
            '<div class="admin-stat"><i class="ri-folders-line"></i><div><span class="stat-number">' + items.length + '</span><span class="stat-label">Total Categorias</span></div></div>' +
            '<div class="admin-stat"><i class="ri-check-double-line"></i><div><span class="stat-number">' + active + '</span><span class="stat-label">Ativas</span></div></div>' +
            '<div class="admin-stat"><i class="ri-shopping-bag-3-line"></i><div><span class="stat-number">' + shopCount + '</span><span class="stat-label">Shop</span></div></div>' +
            '<div class="admin-stat"><i class="ri-image-line"></i><div><span class="stat-number">' + portfolioCount + '</span><span class="stat-label">Portfolio</span></div></div>';
    }

    if (items.length === 0) {
        container.innerHTML = '<div class="admin-empty"><i class="ri-folders-line"></i><p>Nenhuma categoria cadastrada</p></div>';
        return;
    }

    var products = getProducts();
    var portfolio = getPortfolio();

    var html = '';
    items.forEach(function(cat) {
        var prodCount = products.filter(function(p) { return p.category === cat.slug; }).length;
        var portCount = portfolio.filter(function(p) { return p.category === cat.slug; }).length;
        var typeLabel = cat.type === 'ambos' ? 'Shop + Portfolio' : cat.type === 'shop' ? 'Apenas Shop' : 'Apenas Portfolio';

        html += '<div class="admin-category-item ' + (!cat.active ? 'inactive' : '') + '">';
        html += '<div class="admin-category-icon"><i class="' + cat.icon + '"></i></div>';
        html += '<div class="admin-product-info">';
        html += '<div class="admin-product-header">';
        html += '<h3>' + cat.name + '</h3>';
        html += '<div class="admin-product-badges">';
        html += '<span class="admin-badge badge-cat">' + cat.slug + '</span>';
        html += '<span class="admin-badge ' + (cat.active ? 'badge-active' : 'badge-inactive') + '">' + (cat.active ? 'Ativa' : 'Inativa') + '</span>';
        html += '<span class="admin-badge badge-type">' + typeLabel + '</span>';
        html += '</div></div>';
        if (cat.description) html += '<p class="admin-product-desc">' + cat.description + '</p>';
        html += '<div class="admin-product-meta">';
        html += '<span><i class="ri-shopping-bag-3-line"></i> ' + prodCount + ' produto(s)</span>';
        html += '<span><i class="ri-image-line"></i> ' + portCount + ' trabalho(s)</span>';
        html += '</div>';
        html += '<div class="admin-product-actions">';
        html += '<button class="admin-btn admin-btn-edit" onclick="openEditCategory(' + cat.id + ')"><i class="ri-edit-line"></i> Editar</button>';
        html += '<button class="admin-btn admin-btn-toggle" onclick="handleToggleCategory(' + cat.id + ')"><i class="ri-' + (cat.active ? 'eye-off-line' : 'eye-line') + '"></i> ' + (cat.active ? 'Desativar' : 'Ativar') + '</button>';
        html += '<button class="admin-btn admin-btn-delete" onclick="handleDeleteCategory(' + cat.id + ')"><i class="ri-delete-bin-line"></i> Excluir</button>';
        html += '</div></div></div>';
    });

    container.innerHTML = html;
}

function openAddCategory() {
    editingCategoryId = null;
    document.getElementById('categoryFormTitle').textContent = 'Adicionar Categoria';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryFormModal').classList.add('open');
    document.getElementById('adminOverlay').classList.add('open');
}

function openEditCategory(id) {
    var items = getCategories();
    var item = items.find(function(c) { return c.id === id; });
    if (!item) return;

    editingCategoryId = id;
    document.getElementById('categoryFormTitle').textContent = 'Editar Categoria';
    document.getElementById('categoryName').value = item.name;
    document.getElementById('categorySlug').value = item.slug;
    document.getElementById('categoryIcon').value = item.icon || '';
    document.getElementById('categoryDescription').value = item.description || '';
    document.getElementById('categoryType').value = item.type || 'ambos';

    document.getElementById('categoryFormModal').classList.add('open');
    document.getElementById('adminOverlay').classList.add('open');
}

function closeCategoryForm() {
    document.getElementById('categoryFormModal').classList.remove('open');
    document.getElementById('adminOverlay').classList.remove('open');
    editingCategoryId = null;
}

function handleCategorySubmit(e) {
    e.preventDefault();

    var name = document.getElementById('categoryName').value.trim();
    var slug = document.getElementById('categorySlug').value.trim();
    var icon = document.getElementById('categoryIcon').value.trim();
    var description = document.getElementById('categoryDescription').value.trim();
    var type = document.getElementById('categoryType').value;

    if (!name) {
        showToast('Preencha o nome da categoria!', 'error');
        return;
    }

    if (!slug) {
        slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    var data = { name: name, slug: slug, icon: icon, description: description, type: type };

    if (editingCategoryId) {
        var result = updateCategory(editingCategoryId, data);
        if (result) {
            showToast('Categoria atualizada!', 'success');
        }
    } else {
        var result = addCategory(data);
        if (result) {
            showToast('Categoria adicionada!', 'success');
        }
    }

    closeCategoryForm();
    renderCategoriesList();
    populateCategorySelects();
}

function handleDeleteCategory(id) {
    var item = getCategories().find(function(c) { return c.id === id; });
    if (!item) return;

    var products = getProducts().filter(function(p) { return p.category === item.slug; });
    var portfolio = getPortfolio().filter(function(p) { return p.category === item.slug; });
    var total = products.length + portfolio.length;

    var msg = 'Excluir categoria "' + item.name + '"?';
    if (total > 0) msg += '\nATENCAO: ' + total + ' item(ns) usam esta categoria!';

    if (confirm(msg)) {
        deleteCategory(id);
        showToast('Categoria excluida!', 'success');
        renderCategoriesList();
        populateCategorySelects();
    }
}

function handleToggleCategory(id) {
    var item = toggleCategory(id);
    if (item) {
        showToast(item.name + (item.active ? ' ativada!' : ' desativada!'), 'success');
        renderCategoriesList();
        populateCategorySelects();
    }
}

function autoGenerateSlug() {
    var nameInput = document.getElementById('categoryName');
    var slugInput = document.getElementById('categorySlug');
    if (nameInput && slugInput && !editingCategoryId) {
        slugInput.value = nameInput.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
}

function populateCategorySelects() {
    var productSelect = document.getElementById('productCategory');
    var portfolioSelect = document.getElementById('portfolioCategory');
    var categories = getCategories().filter(function(c) { return c.active; });

    if (productSelect) {
        var currentVal = productSelect.value;
        var shopCats = categories.filter(function(c) { return c.type === 'shop' || c.type === 'ambos'; });
        productSelect.innerHTML = '<option value="">Selecione...</option>';
        shopCats.forEach(function(c) {
            productSelect.innerHTML += '<option value="' + c.slug + '">' + c.name + '</option>';
        });
        if (currentVal) productSelect.value = currentVal;
    }

    if (portfolioSelect) {
        var currentVal = portfolioSelect.value;
        var portCats = categories.filter(function(c) { return c.type === 'portfolio' || c.type === 'ambos'; });
        portfolioSelect.innerHTML = '<option value="">Selecione...</option>';
        portCats.forEach(function(c) {
            portfolioSelect.innerHTML += '<option value="' + c.slug + '">' + c.name + '</option>';
        });
        if (currentVal) portfolioSelect.value = currentVal;
    }
}

function renderInlineFilesList(productId) {
    var container = document.getElementById('productDownloadFilesList');
    if (!container) return;

    if (!productId) {
        container.innerHTML = '';
        return;
    }

    var files = getProductFiles(productId);
    if (files.length === 0) {
        container.innerHTML = '<p class="admin-inline-no-files"><i class="ri-information-line"></i> Nenhum arquivo de download vinculado</p>';
        return;
    }

    var html = '';
    files.forEach(function(file) {
        var icon = 'ri-file-line';
        if (file.type && file.type.includes('image')) icon = 'ri-image-line';
        else if (file.type && file.type.includes('zip')) icon = 'ri-file-zip-line';
        else if (file.type && file.type.includes('pdf')) icon = 'ri-file-pdf-line';
        else if (file.name && (file.name.endsWith('.psd') || file.name.endsWith('.PSD'))) icon = 'ri-file-psd-2-line';
        else if (file.name && file.name.endsWith('.rar')) icon = 'ri-file-zip-line';

        html += '<div class="admin-inline-file">';
        html += '<i class="' + icon + '"></i>';
        html += '<span>' + file.name + ' (' + formatFileSize(file.size) + ')</span>';
        html += '<button type="button" class="admin-inline-file-remove" onclick="handleRemoveInlineFile(' + productId + ', \'' + file.id + '\')"><i class="ri-close-line"></i></button>';
        html += '</div>';
    });

    container.innerHTML = html;
}

function handleRemoveInlineFile(productId, fileId) {
    if (confirm('Remover este arquivo de download?')) {
        removeProductFile(productId, fileId);
        showToast('Arquivo removido!', 'success');
        renderInlineFilesList(productId);
    }
}

var adminDownloadsFilter = 'all';

function filterAdminDownloads(filter) {
    adminDownloadsFilter = filter;
    document.querySelectorAll('.admin-dl-filter-btn').forEach(function(b) { b.classList.remove('active'); });
    document.querySelector('.admin-dl-filter-btn[data-filter="' + filter + '"]').classList.add('active');
    renderAllDownloads();
}

function renderAllDownloads() {
    var container = document.getElementById('adminDownloadsList');
    if (!container) return;

    var products = getProducts();
    var allFiles = JSON.parse(localStorage.getItem(DOWNLOADS_FILES_KEY) || '{}');

    var totalFiles = 0;
    var productsWithFiles = 0;
    var productsWithoutFiles = 0;
    var totalSize = 0;

    products.forEach(function(p) {
        var files = allFiles[p.id] || [];
        if (files.length > 0) {
            productsWithFiles++;
            totalFiles += files.length;
            files.forEach(function(f) { totalSize += (f.size || 0); });
        } else {
            productsWithoutFiles++;
        }
    });

    var statsContainer = document.getElementById('downloadsStats');
    if (statsContainer) {
        statsContainer.innerHTML =
            '<div class="admin-stat"><i class="ri-file-line"></i><div><span class="stat-number">' + totalFiles + '</span><span class="stat-label">Total Arquivos</span></div></div>' +
            '<div class="admin-stat"><i class="ri-check-double-line"></i><div><span class="stat-number">' + productsWithFiles + '</span><span class="stat-label">Com Arquivo</span></div></div>' +
            '<div class="admin-stat"><i class="ri-error-warning-line"></i><div><span class="stat-number">' + productsWithoutFiles + '</span><span class="stat-label">Sem Arquivo</span></div></div>' +
            '<div class="admin-stat"><i class="ri-hard-drive-2-line"></i><div><span class="stat-number">' + formatFileSize(totalSize) + '</span><span class="stat-label">Tamanho Total</span></div></div>';
    }

    var filteredProducts = products;
    if (adminDownloadsFilter === 'with-files') {
        filteredProducts = products.filter(function(p) { return (allFiles[p.id] || []).length > 0; });
    } else if (adminDownloadsFilter === 'no-files') {
        filteredProducts = products.filter(function(p) { return (allFiles[p.id] || []).length === 0; });
    }

    if (filteredProducts.length === 0) {
        container.innerHTML = '<div class="admin-empty"><i class="ri-download-cloud-line"></i><p>Nenhum produto encontrado</p></div>';
        return;
    }

    var html = '';
    filteredProducts.forEach(function(product) {
        var files = allFiles[product.id] || [];
        var imgSrc = product.image;
        if (imgSrc && !imgSrc.startsWith('data:') && !imgSrc.startsWith('http') && !imgSrc.startsWith('../')) {
            imgSrc = '../' + imgSrc;
        }

        html += '<div class="admin-download-item ' + (files.length === 0 ? 'no-files' : '') + '">';
        html += '<div class="admin-download-thumb"><img src="' + imgSrc + '" alt="' + product.name + '" onerror="this.src=\'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23888%22 font-size=%2210%22>Sem img</text></svg>\'"></div>';
        html += '<div class="admin-product-info">';
        html += '<div class="admin-product-header">';
        html += '<h3>' + product.name + '</h3>';
        html += '<div class="admin-product-badges">';
        html += '<span class="admin-badge badge-cat">' + product.category + '</span>';
        html += '<span class="admin-badge ' + (files.length > 0 ? 'badge-active' : 'badge-inactive') + '">' + files.length + ' arquivo(s)</span>';
        html += '</div></div>';

        if (files.length > 0) {
            html += '<div class="admin-download-files">';
            files.forEach(function(file) {
                var icon = 'ri-file-line';
                if (file.type && file.type.includes('zip')) icon = 'ri-file-zip-line';
                else if (file.type && file.type.includes('pdf')) icon = 'ri-file-pdf-line';
                else if (file.name && (file.name.endsWith('.psd') || file.name.endsWith('.PSD'))) icon = 'ri-file-psd-2-line';
                else if (file.name && file.name.endsWith('.rar')) icon = 'ri-file-zip-line';
                var date = new Date(file.uploadedAt).toLocaleDateString('pt-BR');

                html += '<div class="admin-download-file-row">';
                html += '<i class="' + icon + '"></i>';
                html += '<span class="admin-download-file-name">' + file.name + '</span>';
                html += '<span class="admin-download-file-size">' + formatFileSize(file.size) + '</span>';
                html += '<span class="admin-download-file-date">' + date + '</span>';
                html += '<button class="admin-btn admin-btn-delete-sm" onclick="handleRemoveFileFromDownloads(' + product.id + ', \'' + file.id + '\')"><i class="ri-delete-bin-line"></i></button>';
                html += '</div>';
            });
            html += '</div>';
        } else {
            html += '<p class="admin-download-warning"><i class="ri-error-warning-line"></i> Nenhum arquivo disponivel para download. O cliente nao recebera arquivo apos a compra.</p>';
        }

        html += '<div class="admin-product-actions">';
        html += '<button class="admin-btn admin-btn-files" onclick="openFilesManager(' + product.id + ')"><i class="ri-upload-cloud-line"></i> Upload Arquivo</button>';
        html += '<button class="admin-btn admin-btn-edit" onclick="openEditProduct(' + product.id + '); switchToTab(\'produtos\');"><i class="ri-edit-line"></i> Editar Produto</button>';
        html += '</div></div></div>';
    });

    container.innerHTML = html;
}

function handleRemoveFileFromDownloads(productId, fileId) {
    if (confirm('Remover este arquivo?')) {
        removeProductFile(productId, fileId);
        showToast('Arquivo removido!', 'success');
        renderAllDownloads();
    }
}

function switchToTab(tabName) {
    var navBtns = document.querySelectorAll('.admin-nav-btn');
    navBtns.forEach(function(b) { b.classList.remove('active'); });
    var target = document.querySelector('.admin-nav-btn[data-tab="' + tabName + '"]');
    if (target) target.classList.add('active');

    document.querySelectorAll('.admin-tab').forEach(function(t) { t.classList.remove('active'); });
    var tabEl = document.getElementById('tab-' + tabName);
    if (tabEl) tabEl.classList.add('active');
}
