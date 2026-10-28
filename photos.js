const PHOTO_LOAD_TIMEOUT_MS = 4000;
const PHOTO_FETCH_TIMEOUT_MS = 5000;
const MAX_PHOTO_CANDIDATES = 8;
const PHOTO_PROXY_URLS = ['https://api.allorigins.win/raw?url=', 'https://corsproxy.io/?url='];

let photoDetectionId = 0;
let draftImages = [];
let galleryProductId = null;
let galleryIndex = 0;

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

function productPhotoCandidates(html, pageUrl) {
  const page = new DOMParser().parseFromString(html, 'text/html');
  const candidates = [];
  const add = value => {
    if (Array.isArray(value)) { value.forEach(add); return; }
    if (value && typeof value === 'object') { add(value.contentUrl || value.url); return; }
    if (typeof value !== 'string' || !value.trim()) return;
    try {
      const image = new URL(value.trim(), pageUrl);
      const isPlaceholder = /(?:^|[\/_-])(logo|icon|favicon|placeholder|default-featured-image)(?:[\/_\-.]|$)/i.test(image.pathname);
      if (!isWebUrl(image.href) || isPlaceholder) return;
      if (!candidates.includes(image.href)) candidates.push(image.href);
    } catch (error) { return; }
  };
  page.querySelectorAll('img[data-pdp-server-ring], img[data-product-image]').forEach(image => {
    add(image.getAttribute('data-src') || image.getAttribute('src'));
  });
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
  const imageMetaSelectors = [
    'meta[property="og:image:secure_url"]', 'meta[property="og:image"]',
    'meta[name="twitter:image"]', 'meta[name="twitter:image:src"]'
  ];
  imageMetaSelectors.forEach(selector => {
    page.querySelectorAll(selector).forEach(meta => add(meta.getAttribute('content')));
  });
  return candidates;
}

function canLoadPhoto(url) {
  return new Promise(resolve => {
    const image = new Image();
    const timeout = setTimeout(() => finish(false), PHOTO_LOAD_TIMEOUT_MS);
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

function addDetectedPhoto(url, message) {
  if (!draftImages.includes(url)) draftImages.push(url);
  element('image-status').textContent = message;
  renderImageEditor();
}

async function findPhotoOnPage(source, pageUrl, checked, isCurrent) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PHOTO_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(source, { signal: controller.signal });
    if (!response.ok) return '';

    const candidates = productPhotoCandidates(await response.text(), pageUrl).slice(0, MAX_PHOTO_CANDIDATES);
    for (const imageUrl of candidates) {
      if (!isCurrent()) return '';
      if (checked.has(imageUrl)) continue;
      checked.add(imageUrl);
      if (await canLoadPhoto(imageUrl)) return imageUrl;
    }
  } catch (error) {
    return '';
  } finally {
    clearTimeout(timeout);
  }
  return '';
}

async function detectPhotos() {
  const url = element('product-url').value.trim();
  const detectionId = ++photoDetectionId;
  if (!isWebUrl(url) || catalog.categoryLinks?.includes(url)) {
    element('image-status').textContent = 'Geçerli bir ürün sayfası adresi girin.';
    return;
  }
  const isCurrent = () => detectionId === photoDetectionId && element('product-dialog').open && element('product-url').value.trim() === url;
  const productUrl = new URL(url);
  const sameProductUrl = address => {
    if (!isWebUrl(address)) return false;
    const knownUrl = new URL(address);
    return knownUrl.origin === productUrl.origin && knownUrl.pathname.replace(/\/$/, '') === productUrl.pathname.replace(/\/$/, '');
  };
  const knownProduct = catalog.products.find(product => product.images.length && sameProductUrl(product.url));
  const knownPhoto = knownProduct?.images[0] || Object.entries(catalog.photoSources || {}).find(([address]) => sameProductUrl(address))?.[1];
  element('image-status').textContent = 'Fotoğraf aranıyor…';
  if (knownPhoto && await canLoadPhoto(knownPhoto)) {
    if (!isCurrent()) return;
    addDetectedPhoto(knownPhoto, 'Ürün fotoğrafı eklendi.');
    return;
  }
  if (!isCurrent()) return;
  const sources = [url, ...PHOTO_PROXY_URLS.map(proxy => proxy + encodeURIComponent(url))];
  const checked = new Set(knownPhoto ? [knownPhoto] : []);
  for (const source of sources) {
    const photo = await findPhotoOnPage(source, url, checked, isCurrent);
    if (!isCurrent()) return;
    if (!photo) continue;
    addDetectedPhoto(photo, 'Ürün sayfasındaki fotoğraf eklendi.');
    return;
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
  const product = catalog.products.find(item => item.id === galleryProductId);
  if (!product) return;
  const images = product.images;
  const image = element('gallery-image');
  element('gallery-title').textContent = product.name;
  element('gallery-empty').hidden = images.length > 0;
  image.hidden = images.length === 0;
  if (images.length) {
    image.src = images[galleryIndex];
    image.alt = `${product.name} fotoğraf ${galleryIndex + 1}`;
    image.onerror = () => {
      image.hidden = true;
      element('gallery-empty').hidden = false;
      element('gallery-empty').textContent = 'Fotoğraf açılamadı';
    };
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
  const product = catalog.products.find(item => item.id === galleryProductId);
  if (!product?.images.length) return;
  galleryIndex = (galleryIndex + direction + product.images.length) % product.images.length;
  renderGallery();
}
