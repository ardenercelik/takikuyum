let editingProductId = null;

// Ürün listesi ve ürün formu.
function renderProducts() {
  const list = element('product-list');
  const query = element('search').value.trim().toLocaleLowerCase('tr');
  const visibleProducts = catalog.products.filter(product => {
    const matchesCategory = !selectedCategory || product.categories.includes(selectedCategory);
    const searchableText = `${product.name} ${product.brand} ${product.categories.join(' ')}`.toLocaleLowerCase('tr');
    return matchesCategory && searchableText.includes(query);
  });
  list.replaceChildren();
  visibleProducts.forEach(product => {
    const row = element('product-template').content.firstElementChild.cloneNode(true);
    row.querySelector('.product-brand').textContent = product.brand || 'MARKA BELİRTİLMEDİ';
    row.querySelector('.product-name').textContent = product.name;
    row.querySelector('.product-category').textContent = product.categories.join(' · ');
    row.querySelector('.product-notes').textContent = product.notes;
    const image = row.querySelector('.product-image img');
    const imageEmpty = row.querySelector('.image-empty');
    image.alt = product.name;
    if (product.images.length) {
      image.onerror = () => { image.hidden = true; imageEmpty.hidden = false; imageEmpty.textContent = 'Fotoğraf açılamadı'; };
      image.src = product.images[0];
    } else {
      image.hidden = true;
      imageEmpty.hidden = false;
    }
    const link = row.querySelector('.product-source a');
    if (isWebUrl(product.url)) {
      link.href = product.url;
      if (catalog.categoryLinks?.includes(product.url)) link.textContent = 'Kategori sayfası ↗';
    } else {
      link.hidden = true;
      row.querySelector('.source-empty').hidden = false;
    }
    row.querySelectorAll('[data-action="gallery"]').forEach(button => button.addEventListener('click', () => openGallery(product.id)));
    row.querySelector('[data-action="edit"]').addEventListener('click', () => editProduct(product.id));
    row.querySelector('[data-action="delete"]').addEventListener('click', () => deleteProduct(product.id));
    list.append(row);
  });
  element('product-count').textContent = `${catalog.products.length} ürün · ${catalog.categories.length} kategori`;
  element('products-heading').textContent = selectedCategory || 'Tüm ürünler';
  element('visible-count').textContent = `${visibleProducts.length} ürün gösteriliyor`;
  element('empty-state').hidden = visibleProducts.length !== 0;
}

function openProductDialog(product = null) {
  photoDetectionId++;
  editingProductId = product?.id ?? null;
  element('product-form').reset();
  element('product-dialog-title').textContent = product ? 'Ürünü düzenle' : 'Yeni ürün';
  if (product) {
    element('product-name').value = product.name;
    element('product-brand').value = product.brand;
    element('product-url').value = product.url;
    element('product-notes').value = product.notes;
  }
  const categories = product ? product.categories : selectedCategory ? [selectedCategory] : [];
  renderProductCategories(categories);
  element('product-category-error').textContent = '';
  draftImages = product ? [...product.images] : [];
  element('image-status').textContent = '';
  renderImageEditor();
  element('product-dialog').showModal();
}

function addProduct() {
  openProductDialog();
}

function editProduct(productId) {
  const product = catalog.products.find(item => item.id === productId);
  if (!product) return;
  openProductDialog(product);
}

async function saveProduct(event) {
  event.preventDefault();
  const name = element('product-name').value.trim();
  const url = element('product-url').value.trim();
  const selectedCategories = selectedProductCategories().filter(category => catalog.categories.includes(category));
  if (!name || !selectedCategories.length) { element('product-category-error').textContent = 'En az bir kategori seçin.'; return; }
  if (url && !isWebUrl(url)) { alert('Ürün bağlantısı http veya https ile başlamalıdır.'); return; }
  const existing = catalog.products.find(product => product.id === editingProductId);
  const product = {
    ...existing,
    id: existing?.id || `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name, categories: selectedCategories, url,
    brand: element('product-brand').value.trim(),
    notes: element('product-notes').value.trim(),
    images: [...draftImages]
  };
  const nextProducts = existing ? catalog.products.map(item => item.id === product.id ? product : item) : [...catalog.products, product];
  if (await updateCatalog(nextProducts, catalog.categories)) element('product-dialog').close();
}

function deleteProduct(productId) {
  const product = catalog.products.find(item => item.id === productId);
  if (!product || !confirm(`“${product.name}” ürününü silmek istediğinizden emin misiniz?`)) return;
  updateCatalog(catalog.products.filter(item => item.id !== productId), catalog.categories);
}

function download(name, text, type) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(new Blob([text], { type }));
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportCSV() {
  const escape = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const rows = [
    ['Kategori', 'Ürün', 'Marka', 'Fotoğraflar', 'Link', 'Notlar'],
    ...catalog.products.map(product => [
      product.categories.join(' | '), product.name, product.brand,
      product.images.join(' | '), product.url, product.notes
    ])
  ];
  download('MAILLE_product_library.csv', '\ufeff' + rows.map(row => row.map(escape).join(',')).join('\n'), 'text/csv;charset=utf-8');
}
