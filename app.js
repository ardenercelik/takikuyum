// Başlangıç kataloğu catalog-data.js içinde; kullanıcı değişiklikleri tarayıcıda saklanır.
const STORAGE_KEY = 'maille_catalog_v3';
const LEGACY_KEY = 'maille96';
const LEGACY_IMAGE_CACHE_KEY = 'maille96_imgcache';
const PHOTO_CORRECTIONS_VERSION = 4;
const CATALOG_ADDITIONS_VERSION = 1;
const categoryLinks = new Set(['https://www.vrai.com/jewelry/necklaces']);
const correctedPhotos = {
  'https://www.aryapirlanta.com/urun/0-20-karat-tria-pirlanta-yuzuk-minimal-tasarim-1600306': 'https://www.aryapirlanta.com/resim/urun/pirlanta-yuzukler/tria-uctas-yuzukler/arya-tria-uctas-yuzukler-1600306-1741006166-2.jpg',
  'https://akindstore.com/products/diamond-trinity-studs': 'https://akindstore.com/cdn/shop/files/trinitydiamond1.png?v=1757744131&width=800',
  'https://www.vrai.com/de-DE/configure/wedding-band/eternity-band/round-brilliant-yellow-gold-40396090441821': 'https://assets.vrai.com/25216/1660716657-33-df396aw060-l-r-33-d33272a-060-l-sz600-rd004-front-yellow.jpg?auto=compress&w=768',
  'https://www.anitako.com/collections/chokers/products/plain-cuban-link-necklace-with-diamond-center': 'https://www.anitako.com/cdn/shop/products/PLAIN_CUBAN_LINK_NECKLACE_W__.25_RD_DIA_YGresize_360x.png?v=1686937544',
  'https://www.oro-jewels.com/products/oval-birthstone-charm': 'https://www.oro-jewels.com/cdn/shop/files/Oval_Birthstone_Charm.jpg?v=1777885206&width=800',
  'https://www.oro-jewels.com/products/initial-charm': 'https://www.oro-jewels.com/cdn/shop/files/LetterGoldenCharm.jpg?v=1729062766&width=800',
  'https://www.therealreal.com/products/jewelry/bracelets/station/marco-bicego-18k-multistone-paradise-bracelet-wtd3x': 'https://product-images.therealreal.com/MCB28449_1_enlarged.jpg?auto=webp&width=750',
  'https://www.pdpaola.com/products/charms-chain-necklace': 'https://www.pdpaola.com/cdn/shop/files/1784893847102-cierres-5895_2400x.jpg?v=1784894524',
  'https://www.etsy.com/listing/648547827/sideways-initial-gold-necklace-14k-solid': 'https://i.etsystatic.com/13656647/r/il/412599/3408958642/il_1080xN.3408958642_mmax.jpg'
};
const recentPhotoCorrections = new Map([
  ['https://www.therealreal.com/products/jewelry/bracelets/station/marco-bicego-18k-multistone-paradise-bracelet-wtd3x', 3],
  ['https://www.pdpaola.com/products/charms-chain-necklace', 3],
  ['https://www.etsy.com/listing/648547827/sideways-initial-gold-necklace-14k-solid', 4]
]);
const verifiedPhotos = {
  'https://akindstore.com/de/products/curb-chain-necklace': 'https://akindstore.com/cdn/shop/files/AKIND_CurbChainNeckalce_Studio_2.png?v=1758000387&width=800',
  'https://www.oro-jewels.com/products/fantasy-link-bracelet': 'https://www.oro-jewels.com/cdn/shop/files/Fantasylinkbracelet.jpg?v=1726602686&width=800',
  'https://akindstore.com/products/heart-bracelet': 'https://akindstore.com/cdn/shop/files/1_heartbraceletYG.png?v=1773332621&width=800',
  'https://akindstore.com/products/pear-diamond-studs': 'https://akindstore.com/cdn/shop/files/pearstud1.png?v=1757661264&width=800',
  'https://mejuri.com/de/de/products/pave-diamond-huggie-hoops': 'https://cdn.shopify.com/s/files/1/0837/7489/8461/files/0_Pave_Diamond_Huggie_Hoops_12mm_WG_FrontAngled_new_30067850-c8f8-4b19-b159-49fc0c561931.png?v=1776124950&width=1152',
  'https://eriness.com/products/single-marquise-stud-with-diamond-chain': 'https://eriness.com/cdn/shop/products/SBE112-YG-WD-SINGLE.jpg?v=1645050096',
  'https://www.oro-jewels.com/products/essential-huggies': 'https://www.oro-jewels.com/cdn/shop/files/Huggiesgold.jpg?v=1737463883&width=800',
  'https://akindstore.com/products/pave-curve-ring': 'https://akindstore.com/cdn/shop/files/Swosh_Pave_Ring_Vermeil_1_silver_e1a56562-f6d5-47c4-9f35-8dc5847f71d9.png?v=1778561294&width=800',
  'https://akindstore.com/products/facet-stacking-ring': 'https://akindstore.com/cdn/shop/files/facetstacking1.png?v=1758580450&width=800',
  'https://akindstore.com/de/collections/necklace/products/station-diamond-necklace': 'https://akindstore.com/cdn/shop/files/yg_3.png?v=1758083428&width=800',
  'https://akindstore.com/products/long-drop-pendant': 'https://akindstore.com/cdn/shop/files/DropneclaceVermeil_2_silver_3f2e8046-d29a-47ac-b37e-2f4364c457e4.png?v=1778561291&width=800',
  'https://akindstore.com/collections/necklace/products/curb-chain-charm-necklace': 'https://akindstore.com/cdn/shop/files/Curb_Rolo_necklace_NEW.png?v=1792648449&width=800',
  'https://akindstore.com/collections/chain-bracelets/products/rolo-chain-charm-bracelet': 'https://akindstore.com/cdn/shop/files/Rollo_bracelet.png?v=1787841378&width=800',
  'https://akindstore.com/products/station-diamond-bracelet': 'https://akindstore.com/cdn/shop/files/Closercrop_StationdiamondbraceletYG.png?v=1779886990&width=800'
};
const catalogAdditions = [
  { index: 97, category: 'Yüzük / Sculptural', product: 'AKIND — Slim Twist Ring', product_link: 'https://akindstore.com/products/twist-ring', photo: 'https://cdn.shopify.com/s/files/1/0093/9989/4075/files/studiotemplate2_13.png?v=1758166125' },
  { index: 98, category: 'Küpe / Sculptural', product: 'AKIND — Twist Hoops', product_link: 'https://akindstore.com/products/twist-earrings', photo: 'https://cdn.shopify.com/s/files/1/0093/9989/4075/files/studiotemplate3_2.png?v=1757744191' },
  { index: 99, category: 'Bileklik / Sculptural', product: 'AKIND — Twist Bracelet', product_link: 'https://akindstore.com/products/twist-bracelet', photo: 'https://cdn.shopify.com/s/files/1/0093/9989/4075/files/closercrop_TwistbraceletYG.png?v=1779886994' },
  { index: 100, category: 'Kolye / Pendant', product: 'AKIND — Twist Bar Necklace', product_link: 'https://akindstore.com/products/twist-necklace', photo: 'https://cdn.shopify.com/s/files/1/0093/9989/4075/files/yg_1.png?v=1758000388' },
  { index: 101, category: 'Essential / Chain', product: 'AKIND — Fine Curb Chain Bracelet', product_link: 'https://akindstore.com/collections/bracelets/products/curb-chain-bracelet', photo: 'https://cdn.shopify.com/s/files/1/0093/9989/4075/files/Closercrop_curbchainbracelet_81cecea5-a5f1-4c8a-b8e4-b63ece9cf593.png?v=1779886995' },
  { index: 102, category: 'Essential / Chain', product: 'AKIND — Rolo Chain Necklace', product_link: 'https://akindstore.com/products/rolo-chain-charm-necklace', photo: 'https://cdn.shopify.com/s/files/1/0093/9989/4075/files/Rollo_necklace_2.png?v=1787841382' },
  { index: 103, category: 'Essential / Chain', product: 'ORO — Panther Link Necklace', product_link: 'https://www.oro-jewels.com/products/panther-bracelet-gold-vermeil', photo: 'https://cdn.shopify.com/s/files/1/0287/9353/6600/files/Panter_ketting_verguld.jpg?v=1753956078' },
  { index: 104, category: 'Essential / Chain', product: 'ORO — Panther Link Bracelet', product_link: 'https://www.oro-jewels.com/products/panter-link-bracelet', photo: 'https://cdn.shopify.com/s/files/1/0287/9353/6600/files/GoldenPantherLinkBracelet.jpg?v=1721653256' },
  { index: 105, category: 'Essential / Chain', product: 'ORO — Fine Paperclip Bracelet', product_link: 'https://www.oro-jewels.com/products/fine-paperclip-bracelet', photo: 'https://cdn.shopify.com/s/files/1/0287/9353/6600/files/Fine_paperclip_bracelet.jpg?v=1753956648' },
  { index: 106, category: 'Essential / Chain', product: 'AKIND — Carabiner Mixed Chain Necklace', product_link: 'https://akindstore.com/de/products/carabiner-chain-necklace', photo: 'https://cdn.shopify.com/s/files/1/0093/9989/4075/files/MixedChainNeclace_3_silver_e0793503-0056-4f28-ac96-9510e65b7bcc.png?v=1778561289' },
  { index: 107, category: 'Essential / Chain', product: 'AKIND — Carabiner Mixed Chain Bracelet', product_link: 'https://akindstore.com/products/carabiner-chain-bracelet', photo: 'https://cdn.shopify.com/s/files/1/0093/9989/4075/files/V2_MixedChainBraclet_1_silver_460fd722-ac14-4d6a-a3c1-92c5b597cedd.png?v=1778561289' },
  { index: 108, category: 'Essential / Chain', product: 'ORO — Classic Chain Necklace', product_link: 'https://www.oro-jewels.com/products/classic-chain-necklace', photo: 'https://cdn.shopify.com/s/files/1/0287/9353/6600/files/KlassiekeSchakelketting.jpg?v=1716891841' },
  { index: 109, category: 'Essential / Chain', product: 'ORO — Classic Chain Bracelet', product_link: 'https://www.oro-jewels.com/products/classic-chain-bracelet', photo: 'https://cdn.shopify.com/s/files/1/0287/9353/6600/files/ClassicChainBracelet.jpg?v=1718784285' }
];
const originalProducts = [...ORIGINAL, ...catalogAdditions].map(product => ({
  ...product,
  photo: correctedPhotos[product.product_link] || product.photo || verifiedPhotos[product.product_link] || ''
}));
const originalsByIndex = new Map(originalProducts.map(product => [product.index, product]));

// Storage: tek kayıt, kategori ve ürün değişikliklerini birlikte kaydeder.
function readStorage(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch (error) { return null; }
}

function correctOriginalPhoto(product, imageCache, previousVersion = 0) {
  const original = ORIGINAL.find(item => item.index === product.originalIndex);
  const corrected = correctedPhotos[product.url];
  const correctionVersion = recentPhotoCorrections.get(product.url) || 2;
  if (!corrected || previousVersion >= correctionVersion || !original || original.product_link !== product.url) return product;
  const previous = product.images[0];
  if (!previous || previous === original.photo || previous === imageCache[product.url]) {
    return { ...product, images: [corrected, ...product.images.slice(1)] };
  }
  return product;
}

function convertLegacyProduct(product, imageCache) {
  const parts = (product.product || '').split(' — ');
  const original = originalsByIndex.get(product.index);
  const photo = product.photo ?? original?.photo ?? '';
  const cachedPhoto = categoryLinks.has(product.product_link) ? '' : imageCache[product.product_link];
  return {
    id: `original-${product.index}`,
    originalIndex: product.index,
    name: parts.length > 1 ? parts.slice(1).join(' — ') : parts[0],
    brand: parts.length > 1 ? parts[0] : '',
    category: product.category || 'Diğer',
    url: product.product_link || '',
    notes: '',
    images: photo ? [photo] : cachedPhoto ? [cachedPhoto] : []
  };
}

function addMissingCatalogProducts(existingProducts, existingCategories) {
  const productKey = address => {
    try {
      const url = new URL(address);
      const match = url.pathname.match(/\/products\/([^/]+)/);
      return match ? `${url.hostname.replace(/^www\./, '')}/${match[1].toLowerCase()}` : '';
    } catch (error) { return ''; }
  };
  const keys = new Set(existingProducts.map(product => productKey(product.url)).filter(Boolean));
  const names = new Set(existingProducts.map(product => `${product.brand || ''}/${product.name || ''}`.toLocaleLowerCase('tr')));
  const additions = catalogAdditions.map(product => convertLegacyProduct(product, {})).filter(product =>
    !keys.has(productKey(product.url)) && !names.has(`${product.brand}/${product.name}`.toLocaleLowerCase('tr')) &&
    !existingProducts.some(existing => existing.id === product.id));
  return {
    products: [...existingProducts, ...additions],
    categories: [...new Set([...existingCategories, ...additions.map(product => product.category)])]
  };
}

function loadCatalog() {
  const saved = readStorage(STORAGE_KEY) || globalThis.SHARED_CATALOG;
  const imageCache = readStorage(LEGACY_IMAGE_CACHE_KEY) || {};
  if (saved && Array.isArray(saved.products) && Array.isArray(saved.categories)) {
    const catalog = {
      categories: saved.categories,
      products: saved.products.map(product => {
        const loaded = {
          ...product,
          images: (product.images || []).map(image => typeof image === 'string' ? image : originalsByIndex.get(image.originalIndex)?.photo).filter(Boolean)
        };
        return saved.photoCorrectionsVersion >= PHOTO_CORRECTIONS_VERSION ? loaded : correctOriginalPhoto(loaded, imageCache, saved.photoCorrectionsVersion || 0);
      })
    };
    return saved.catalogAdditionsVersion >= CATALOG_ADDITIONS_VERSION ? catalog : addMissingCatalogProducts(catalog.products, catalog.categories);
  }
  const legacy = readStorage(LEGACY_KEY);
  const legacyProducts = Array.isArray(legacy) ? legacy : Array.isArray(legacy?.items) ? legacy.items : originalProducts;
  const products = legacyProducts.map(product => correctOriginalPhoto(convertLegacyProduct(product, imageCache), imageCache));
  return addMissingCatalogProducts(products, [...new Set(products.map(product => product.category))]);
}

function saveCatalog(nextProducts, nextCategories) {
  const compactProducts = nextProducts.map(product => ({
    ...product,
    images: product.images.map(image => image === originalsByIndex.get(product.originalIndex)?.photo
      ? { originalIndex: product.originalIndex } : image)
  }));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ products: compactProducts, categories: nextCategories, photoCorrectionsVersion: PHOTO_CORRECTIONS_VERSION, catalogAdditionsVersion: CATALOG_ADDITIONS_VERSION }));
    return true;
  } catch (error) {
    alert('Değişiklik kaydedilemedi. Tarayıcı depolama alanı dolu veya erişime kapalı olabilir. Daha küçük fotoğraflar veya fotoğraf adresleri kullanın.');
    return false;
  }
}

function updateCatalog(nextProducts, nextCategories) {
  if (!saveCatalog(nextProducts, nextCategories)) return false;
  products = nextProducts;
  categories = nextCategories;
  renderCategories();
  renderProducts();
  return true;
}

const initialCatalog = loadCatalog();
let products = initialCatalog.products;
let categories = initialCatalog.categories;
let selectedCategory = '';
let editingProductId = null;
let draftImages = [];
let categoryBeingDeleted = '';
let galleryProductId = null;
let galleryIndex = 0;
let touchStartX = 0;

const element = id => document.getElementById(id);

function isWebUrl(value) {
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch (error) { return false; }
}

function productCategories(product) {
  return Array.isArray(product.categories) && product.categories.length ? product.categories : product.category ? [product.category] : [];
}

function withProductCategories(product, values) {
  const next = [...new Set(values.filter(Boolean))];
  return { ...product, category: next[0] || '', categories: next };
}

// Kategori ekleme, ad değiştirme ve ürünleri taşıyarak silme.
function fillCategorySelect(select, selected = '', excluded = '') {
  select.replaceChildren();
  const placeholder = new Option('Kategori seçin', '');
  select.add(placeholder);
  categories.filter(category => category !== excluded).forEach(category => select.add(new Option(category, category)));
  select.value = selected;
}

function selectedProductCategories() {
  return [...element('product-category').querySelectorAll('input:checked')].map(input => input.value);
}

function renderProductCategories(selected = []) {
  const container = element('product-category');
  container.replaceChildren();
  categories.forEach(category => {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = category;
    input.checked = selected.includes(category);
    input.addEventListener('change', () => { element('product-category-error').textContent = ''; });
    label.append(input, document.createTextNode(category));
    container.append(label);
  });
}

function renderCategories() {
  const nav = element('category-nav');
  nav.replaceChildren();
  const choices = [{ name: 'Tüm ürünler', value: '' }, ...categories.map(category => ({ name: category, value: category }))];
  choices.forEach(choice => {
    const button = document.createElement('button');
    button.className = 'category-chip' + (choice.value === selectedCategory ? ' active' : '');
    button.textContent = choice.name;
    button.setAttribute('aria-pressed', String(choice.value === selectedCategory));
    button.addEventListener('click', () => filterByCategory(choice.value));
    nav.append(button);
  });
  const addButton = document.createElement('button');
  addButton.className = 'category-chip add';
  addButton.textContent = '+ Kategori ekle';
  addButton.addEventListener('click', openCategoryDialog);
  nav.append(addButton);
}

function filterByCategory(category) {
  selectedCategory = category;
  renderCategories();
  renderProducts();
}

function openCategoryDialog() {
  element('category-form').reset();
  element('category-error').textContent = '';
  element('category-dialog').showModal();
  element('category-name').focus();
}

function categoryExists(name, except = '') {
  return categories.some(category => category !== except && category.toLocaleLowerCase('tr') === name.toLocaleLowerCase('tr'));
}

function addCategory(event) {
  event.preventDefault();
  const name = element('category-name').value.trim();
  if (!name || categoryExists(name)) {
    element('category-error').textContent = 'Geçerli ve benzersiz bir kategori adı girin.';
    return;
  }
  const selected = element('product-dialog').open ? selectedProductCategories() : [];
  if (!updateCatalog(products, [...categories, name])) return;
  if (element('product-dialog').open) renderProductCategories([...selected, name]);
  if (element('manage-dialog').open) renderCategoryManager();
  element('category-dialog').close();
}

function renameCategory(oldName, newName) {
  newName = newName.trim();
  if (!newName || categoryExists(newName, oldName)) {
    alert('Geçerli ve benzersiz bir kategori adı girin.');
    return;
  }
  if (newName === oldName) return;
  const nextCategories = categories.map(category => category === oldName ? newName : category);
  const nextProducts = products.map(product => productCategories(product).includes(oldName)
    ? withProductCategories(product, productCategories(product).map(category => category === oldName ? newName : category)) : product);
  if (!updateCatalog(nextProducts, nextCategories)) return;
  if (selectedCategory === oldName) selectedCategory = newName;
  renderCategories();
  renderProducts();
  renderCategoryManager();
}

function deleteCategory(name) {
  const count = products.filter(product => productCategories(product).includes(name)).length;
  if (count) {
    categoryBeingDeleted = name;
    element('move-message').textContent = `“${name}” kategorisinde ${count} ürün var. Silmeden önce ürünleri başka bir kategoriye taşıyın.`;
    fillCategorySelect(element('move-category'), '', name);
    element('move-error').textContent = categories.length < 2 ? 'Önce ürünleri taşıyabileceğiniz başka bir kategori oluşturun.' : '';
    element('move-dialog').showModal();
    return;
  }
  if (!confirm(`“${name}” kategorisi silinsin mi?`)) return;
  finishDeleteCategory(name, '');
}

function finishDeleteCategory(name, destination) {
  const nextProducts = products.map(product => productCategories(product).includes(name)
    ? withProductCategories(product, productCategories(product).map(category => category === name ? destination : category)) : product);
  if (!updateCatalog(nextProducts, categories.filter(category => category !== name))) return false;
  if (selectedCategory === name) selectedCategory = '';
  renderCategories();
  renderProducts();
  renderCategoryManager();
  return true;
}

function renderCategoryManager() {
  const list = element('category-list');
  list.replaceChildren();
  categories.forEach(category => {
    const row = document.createElement('div');
    row.className = 'category-row';
    const input = document.createElement('input');
    input.value = category;
    input.setAttribute('aria-label', `${category} kategori adı`);
    const saveButton = document.createElement('button');
    saveButton.className = 'button';
    saveButton.textContent = 'Kaydet';
    saveButton.addEventListener('click', () => renameCategory(category, input.value));
    const deleteButton = document.createElement('button');
    deleteButton.className = 'button danger';
    deleteButton.textContent = 'Sil';
    deleteButton.addEventListener('click', () => deleteCategory(category));
    row.append(input, saveButton, deleteButton);
    list.append(row);
  });
}

// Ürün listesi ve ürün formu.
function renderProducts() {
  const list = element('product-list');
  const query = element('search').value.trim().toLocaleLowerCase('tr');
  const visibleProducts = products.filter(product => (!selectedCategory || productCategories(product).includes(selectedCategory)) &&
    `${product.name} ${product.brand} ${productCategories(product).join(' ')}`.toLocaleLowerCase('tr').includes(query));
  list.replaceChildren();
  visibleProducts.forEach(product => {
    const row = element('product-template').content.firstElementChild.cloneNode(true);
    row.querySelector('.product-brand').textContent = product.brand || 'MARKA BELİRTİLMEDİ';
    row.querySelector('.product-name').textContent = product.name;
    row.querySelector('.product-category').textContent = productCategories(product).join(' · ');
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
      if (categoryLinks.has(product.url)) link.textContent = 'Kategori sayfası ↗';
    } else {
      link.hidden = true;
      row.querySelector('.source-empty').hidden = false;
    }
    row.querySelectorAll('[data-action="gallery"]').forEach(button => button.addEventListener('click', () => openGallery(product.id)));
    row.querySelector('[data-action="edit"]').addEventListener('click', () => editProduct(product.id));
    row.querySelector('[data-action="delete"]').addEventListener('click', () => deleteProduct(product.id));
    list.append(row);
  });
  element('product-count').textContent = `${products.length} ürün · ${categories.length} kategori`;
  element('products-heading').textContent = selectedCategory || 'Tüm ürünler';
  element('visible-count').textContent = `${visibleProducts.length} ürün gösteriliyor`;
  element('empty-state').hidden = visibleProducts.length !== 0;
}

function addProduct() {
  photoDetectionId++;
  editingProductId = null;
  element('product-form').reset();
  element('product-dialog-title').textContent = 'Yeni ürün';
  renderProductCategories(selectedCategory ? [selectedCategory] : []);
  element('product-category-error').textContent = '';
  draftImages = [];
  element('image-status').textContent = '';
  renderImageEditor();
  element('product-dialog').showModal();
}

function editProduct(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;
  photoDetectionId++;
  editingProductId = productId;
  element('product-form').reset();
  element('product-dialog-title').textContent = 'Ürünü düzenle';
  element('product-name').value = product.name;
  element('product-brand').value = product.brand;
  element('product-url').value = product.url;
  element('product-notes').value = product.notes;
  renderProductCategories(productCategories(product));
  element('product-category-error').textContent = '';
  draftImages = [...product.images];
  element('image-status').textContent = '';
  renderImageEditor();
  element('product-dialog').showModal();
}

function saveProduct(event) {
  event.preventDefault();
  const name = element('product-name').value.trim();
  const url = element('product-url').value.trim();
  const selectedCategories = selectedProductCategories().filter(category => categories.includes(category));
  if (!name || !selectedCategories.length) { element('product-category-error').textContent = 'En az bir kategori seçin.'; return; }
  if (url && !isWebUrl(url)) { alert('Ürün bağlantısı http veya https ile başlamalıdır.'); return; }
  const existing = products.find(product => product.id === editingProductId);
  const product = {
    id: existing?.id || `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    originalIndex: existing?.originalIndex ?? null,
    name, category: selectedCategories[0], categories: selectedCategories, url,
    brand: element('product-brand').value.trim(),
    notes: element('product-notes').value.trim(),
    images: [...draftImages]
  };
  const nextProducts = existing ? products.map(item => item.id === product.id ? product : item) : [...products, product];
  if (updateCatalog(nextProducts, categories)) element('product-dialog').close();
}

function deleteProduct(productId) {
  const product = products.find(item => item.id === productId);
  if (!product || !confirm(`“${product.name}” ürününü silmek istediğinizden emin misiniz?`)) return;
  updateCatalog(products.filter(item => item.id !== productId), categories);
}

// Fotoğraflar: ilk görsel ana görseldir; formdaki değişiklikler kaydedilene kadar taslaktır.
function renderImageEditor() {
  const editor = element('image-editor');
  editor.replaceChildren();
  draftImages.forEach((source, index) => {
    const item = document.createElement('div');
    item.className = 'image-item';
    const image = document.createElement('img');
    image.src = source;
    image.alt = `Ürün fotoğrafı ${index + 1}`;
    image.onerror = () => { image.alt = 'Fotoğraf açılamadı'; };
    item.append(image);
    if (index === 0) {
      const label = document.createElement('span');
      label.className = 'main-label';
      label.textContent = 'Ana fotoğraf';
      item.append(label);
    } else {
      const mainButton = document.createElement('button');
      mainButton.type = 'button';
      mainButton.className = 'text-button';
      mainButton.textContent = 'Ana fotoğraf yap';
      mainButton.addEventListener('click', () => { draftImages.unshift(draftImages.splice(index, 1)[0]); renderImageEditor(); });
      item.append(mainButton);
    }
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'text-button';
    removeButton.textContent = 'Sil';
    removeButton.addEventListener('click', () => { draftImages.splice(index, 1); renderImageEditor(); });
    item.append(removeButton);
    editor.append(item);
  });
}

function addImageUrl() {
  const input = element('image-url');
  const url = input.value.trim();
  if (!isWebUrl(url)) { element('image-status').textContent = 'Geçerli bir fotoğraf adresi girin.'; return; }
  if (!draftImages.includes(url)) draftImages.push(url);
  input.value = '';
  element('image-status').textContent = '';
  renderImageEditor();
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function addImageFiles(event) {
  const files = [...event.target.files].filter(file => file.type.startsWith('image/'));
  try {
    const images = await Promise.all(files.map(readImageFile));
    draftImages.push(...images);
    element('image-status').textContent = '';
    renderImageEditor();
  } catch (error) {
    element('image-status').textContent = 'Fotoğraf dosyası okunamadı.';
  }
  event.target.value = '';
}

let photoDetectionId = 0;

function productPhotoCandidates(html, pageUrl) {
  const page = new DOMParser().parseFromString(html, 'text/html');
  const candidates = [];
  const add = value => {
    if (Array.isArray(value)) { value.forEach(add); return; }
    if (value && typeof value === 'object') { add(value.contentUrl || value.url); return; }
    if (typeof value !== 'string' || !value.trim()) return;
    try {
      const image = new URL(value.trim(), pageUrl);
      if (!isWebUrl(image.href) || /(?:^|[\/_-])(logo|icon|favicon|placeholder|default-featured-image)(?:[\/_\-.]|$)/i.test(image.pathname)) return;
      if (!candidates.includes(image.href)) candidates.push(image.href);
    } catch (error) { return; }
  };
  page.querySelectorAll('img[data-pdp-server-ring], img[data-product-image]').forEach(image => add(image.getAttribute('data-src') || image.getAttribute('src')));
  const productNodes = [];
  const collectProducts = value => {
    if (Array.isArray(value)) { value.forEach(collectProducts); return; }
    if (!value || typeof value !== 'object') return;
    const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
    if (types.some(type => typeof type === 'string' && /(?:^|\/)Product$/i.test(type))) productNodes.push(value);
    if (value['@graph']) collectProducts(value['@graph']);
  };
  page.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    try { collectProducts(JSON.parse(script.textContent)); } catch (error) { return; }
  });
  const matchingProduct = productNodes.find(product => {
    try { return product.url && new URL(product.url, pageUrl).pathname.replace(/\/$/, '') === new URL(pageUrl).pathname.replace(/\/$/, ''); }
    catch (error) { return false; }
  });
  add((matchingProduct || productNodes[0])?.image);
  ['meta[property="og:image:secure_url"]', 'meta[property="og:image"]', 'meta[name="twitter:image"]', 'meta[name="twitter:image:src"]'].forEach(selector => {
    page.querySelectorAll(selector).forEach(meta => add(meta.getAttribute('content')));
  });
  return candidates;
}

function canLoadPhoto(url) {
  return new Promise(resolve => {
    const image = new Image();
    const timeout = setTimeout(() => finish(false), 4000);
    function finish(loaded) {
      clearTimeout(timeout);
      image.onload = null;
      image.onerror = null;
      resolve(loaded);
    }
    image.onload = () => finish(image.naturalWidth > 0 && image.naturalHeight > 0);
    image.onerror = () => finish(false);
    image.src = url;
  });
}

async function detectPhotos() {
  const url = element('product-url').value.trim();
  const detectionId = ++photoDetectionId;
  if (!isWebUrl(url) || categoryLinks.has(url)) { element('image-status').textContent = 'Geçerli bir ürün sayfası adresi girin.'; return; }
  const isCurrent = () => detectionId === photoDetectionId && element('product-dialog').open && element('product-url').value.trim() === url;
  const productUrl = new URL(url);
  const knownPhoto = Object.entries({ ...verifiedPhotos, ...correctedPhotos }).find(([address]) => {
    const knownUrl = new URL(address);
    return knownUrl.origin === productUrl.origin && knownUrl.pathname.replace(/\/$/, '') === productUrl.pathname.replace(/\/$/, '');
  })?.[1];
  element('image-status').textContent = 'Fotoğraf aranıyor…';
  if (knownPhoto && await canLoadPhoto(knownPhoto)) {
    if (!isCurrent()) return;
    if (!draftImages.includes(knownPhoto)) draftImages.push(knownPhoto);
    element('image-status').textContent = 'Ürün fotoğrafı eklendi.';
    renderImageEditor();
    return;
  }
  if (!isCurrent()) return;
  const sources = [url, 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url), 'https://corsproxy.io/?url=' + encodeURIComponent(url)];
  const checked = new Set(knownPhoto ? [knownPhoto] : []);
  for (const source of sources) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(source, { signal: controller.signal });
      if (!response.ok) continue;
      const candidates = productPhotoCandidates(await response.text(), url).slice(0, 8);
      for (const imageUrl of candidates) {
        if (!isCurrent()) return;
        if (checked.has(imageUrl)) continue;
        checked.add(imageUrl);
        if (!await canLoadPhoto(imageUrl)) continue;
        if (!isCurrent()) return;
        if (!draftImages.includes(imageUrl)) draftImages.push(imageUrl);
        element('image-status').textContent = 'Ürün sayfasındaki fotoğraf eklendi.';
        renderImageEditor();
        return;
      }
    } catch (error) {
      continue;
    } finally {
      clearTimeout(timeout);
    }
  }
  if (isCurrent()) {
    element('image-status').textContent = 'Fotoğraf bulunamadı veya site erişime izin vermiyor.';
  }
}

// Galeri: oklar, küçük resimler ve dokunmatik kaydırma aynı indeksi değiştirir.
function openGallery(productId) {
  galleryProductId = productId;
  galleryIndex = 0;
  renderGallery();
  element('gallery-dialog').showModal();
}

function renderGallery() {
  const product = products.find(item => item.id === galleryProductId);
  if (!product) return;
  const images = product.images;
  const image = element('gallery-image');
  element('gallery-title').textContent = product.name;
  element('gallery-empty').hidden = images.length > 0;
  image.hidden = images.length === 0;
  if (images.length) {
    image.src = images[galleryIndex];
    image.alt = `${product.name} fotoğraf ${galleryIndex + 1}`;
    image.onerror = () => { image.hidden = true; element('gallery-empty').hidden = false; element('gallery-empty').textContent = 'Fotoğraf açılamadı'; };
  }
  element('gallery-empty').textContent = 'Fotoğraf yok';
  element('gallery-count').textContent = images.length ? `${galleryIndex + 1} / ${images.length}` : '0 fotoğraf';
  element('gallery-previous').hidden = images.length < 2;
  element('gallery-next').hidden = images.length < 2;
  const thumbnails = element('gallery-thumbnails');
  thumbnails.replaceChildren();
  images.forEach((source, index) => {
    const button = document.createElement('button');
    button.className = 'gallery-thumb' + (index === galleryIndex ? ' active' : '');
    button.setAttribute('aria-label', `Fotoğraf ${index + 1}`);
    const thumbnail = document.createElement('img');
    thumbnail.src = source;
    thumbnail.alt = '';
    button.append(thumbnail);
    button.addEventListener('click', () => { galleryIndex = index; renderGallery(); });
    thumbnails.append(button);
  });
}

function changeGalleryImage(direction) {
  const product = products.find(item => item.id === galleryProductId);
  if (!product?.images.length) return;
  galleryIndex = (galleryIndex + direction + product.images.length) % product.images.length;
  renderGallery();
}

function download(name, text, type) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(new Blob([text], { type }));
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportJSON() {
  download('MAILLE_product_library.json', JSON.stringify({ categories, products }, null, 2), 'application/json');
}

function exportCSV() {
  const escape = value => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const rows = [['Kategori', 'Ürün', 'Marka', 'Fotoğraflar', 'Link', 'Notlar'], ...products.map(product => [productCategories(product).join(' | '), product.name, product.brand, product.images.join(' | '), product.url, product.notes])];
  download('MAILLE_product_library.csv', '\ufeff' + rows.map(row => row.map(escape).join(',')).join('\n'), 'text/csv;charset=utf-8');
}

function resetCatalog() {
  if (!confirm('Tüm değişiklikler silinip orijinal katalog geri yüklensin mi?')) return;
  const originalCatalog = originalProducts.map(product => convertLegacyProduct(product, {}));
  const originalCategories = [...new Set(originalCatalog.map(product => product.category))];
  if (updateCatalog(originalCatalog, originalCategories)) {
    selectedCategory = '';
    element('search').value = '';
    renderCategories();
    renderProducts();
  }
}

// Başlatma ve arayüz olayları.
element('add-product').addEventListener('click', addProduct);
element('add-category').addEventListener('click', openCategoryDialog);
element('form-add-category').addEventListener('click', openCategoryDialog);
element('manage-add-category').addEventListener('click', openCategoryDialog);
element('manage-categories').addEventListener('click', () => { renderCategoryManager(); element('manage-dialog').showModal(); });
element('product-form').addEventListener('submit', saveProduct);
element('category-form').addEventListener('submit', addCategory);
element('move-form').addEventListener('submit', event => {
  event.preventDefault();
  const destination = element('move-category').value;
  if (destination && finishDeleteCategory(categoryBeingDeleted, destination)) element('move-dialog').close();
});
element('search').addEventListener('input', renderProducts);
element('add-image-url').addEventListener('click', addImageUrl);
element('image-file').addEventListener('change', addImageFiles);
element('detect-photos').addEventListener('click', detectPhotos);
element('product-url').addEventListener('change', () => { if (!draftImages.length && isWebUrl(element('product-url').value.trim())) detectPhotos(); });
element('gallery-previous').addEventListener('click', () => changeGalleryImage(-1));
element('gallery-next').addEventListener('click', () => changeGalleryImage(1));
element('gallery-edit').addEventListener('click', () => { element('gallery-dialog').close(); editProduct(galleryProductId); });
element('gallery-stage').addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
element('gallery-stage').addEventListener('touchend', event => {
  const distance = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(distance) > 40) changeGalleryImage(distance < 0 ? 1 : -1);
}, { passive: true });
element('export-csv').addEventListener('click', exportCSV);
element('export-json').addEventListener('click', exportJSON);
element('reset-data').addEventListener('click', resetCatalog);
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => element(button.dataset.close).close()));
renderCategories();
renderProducts();