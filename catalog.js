const CATALOG_FILENAME = 'katalog.json';
const CATALOG_DATABASE = 'maille_catalog_file';
const CATALOG_FILE_STORE = 'files';
const CATALOG_FILE_KEY = 'catalog';
const element = id => document.getElementById(id);

let catalog = { products: [], categories: [], categoryLinks: [], photoSources: {} };
let catalogFileHandle = null;
let catalogFileContents = '';
let catalogSaveInProgress = false;

async function writeCatalogFile(handle, catalog) {
  const writable = await handle.createWritable();
  try {
    await writable.write(JSON.stringify(catalog, null, 2));
    await writable.close();
  } catch (error) {
    await writable.abort().catch(() => {});
    throw error;
  }
}

async function updateCatalog(nextProducts, nextCategories) {
  if (!catalogFileHandle) { alert('Önce JSON dosyasını bağlayın.'); return false; }
  if (catalogSaveInProgress) { alert('Önceki kayıt tamamlanıyor. Lütfen tekrar deneyin.'); return false; }
  catalogSaveInProgress = true;
  try {
    const permission = await catalogFileHandle.queryPermission({ mode: 'readwrite' });
    if (permission !== 'granted') throw new Error('Dosya izni yok. JSON dosyasını yeniden bağlayın.');
    const file = await catalogFileHandle.getFile();
    if (await file.text() !== catalogFileContents) {
      throw new Error('JSON dosyası başka bir yerde değiştirildi. Yeniden bağlayın.');
    }
    const updatedCatalog = { ...catalog, products: nextProducts, categories: nextCategories };
    await writeCatalogFile(catalogFileHandle, updatedCatalog);
    catalogFileContents = JSON.stringify(updatedCatalog, null, 2);
    catalog = updatedCatalog;
    element('catalog-file-status').textContent = `${catalogFileHandle.name} kaydedildi.`;
  } catch (error) {
    alert(`Katalog kaydedilemedi: ${error.message}`);
    return false;
  } finally {
    catalogSaveInProgress = false;
  }
  renderCategories();
  renderProducts();
  return true;
}

function catalogHandleDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CATALOG_DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(CATALOG_FILE_STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function rememberCatalogHandle(handle) {
  const database = await catalogHandleDatabase();
  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(CATALOG_FILE_STORE, 'readwrite');
      transaction.objectStore(CATALOG_FILE_STORE).put(handle, CATALOG_FILE_KEY);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally { database.close(); }
}

async function storedCatalogHandle() {
  const database = await catalogHandleDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = database.transaction(CATALOG_FILE_STORE, 'readonly')
        .objectStore(CATALOG_FILE_STORE).get(CATALOG_FILE_KEY);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally { database.close(); }
}

function isStringArray(value) {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function isValidProduct(product) {
  return product && typeof product.id === 'string' && typeof product.name === 'string' &&
    isStringArray(product.categories) && isStringArray(product.images);
}

function isValidCatalog(value) {
  if (!value || !Array.isArray(value.products) || !isStringArray(value.categories)) return false;
  if (!value.products.every(isValidProduct)) return false;
  if (value.categoryLinks !== undefined && !isStringArray(value.categoryLinks)) return false;

  const sources = value.photoSources;
  if (sources === undefined) return true;
  return sources !== null && typeof sources === 'object' && !Array.isArray(sources) &&
    Object.values(sources).every(photo => typeof photo === 'string');
}

async function openCatalogFile(handle, confirmReplacement) {
  if (handle.name !== CATALOG_FILENAME) throw new Error('Lütfen bu klasördeki katalog.json dosyasını seçin.');
  const text = await (await handle.getFile()).text();
  const saved = JSON.parse(text);
  if (!isValidCatalog(saved)) {
    throw new Error('Geçerli bir katalog JSON dosyası seçin.');
  }
  if (confirmReplacement && catalogFileHandle) {
    const currentData = JSON.stringify({ products: catalog.products, categories: catalog.categories });
    const newData = JSON.stringify({ products: saved.products, categories: saved.categories });
    if (currentData !== newData && !confirm('Seçilen JSON dosyasındaki katalog açılacak. Devam edilsin mi?')) {
      return false;
    }
  }
  catalogFileHandle = handle;
  catalogFileContents = text;
  catalog = saved;
  selectedCategory = '';
  renderCategories();
  renderProducts();
  element('catalog-file-status').textContent = `${handle.name} bağlı.`;
  return true;
}

async function connectCatalogFile() {
  if (!window.showOpenFilePicker) { alert('Bu özellik için Chrome veya Edge kullanın.'); return; }
  try {
    let handle = catalogFileHandle;
    if (!handle || await handle.queryPermission({ mode: 'readwrite' }) === 'granted') {
      const handles = await window.showOpenFilePicker({
        mode: 'readwrite',
        types: [{ description: 'Katalog JSON', accept: { 'application/json': ['.json'] } }],
        multiple: false
      });
      handle = handles[0];
    }
    if (await handle.requestPermission({ mode: 'readwrite' }) !== 'granted') throw new Error('Dosya yazma izni verilmedi.');
    if (await openCatalogFile(handle, true)) {
      try { await rememberCatalogHandle(handle); } catch (error) { }
    }
  } catch (error) {
    if (error.name !== 'AbortError') alert(`Dosya bağlanamadı: ${error.message}`);
  }
}

async function restoreCatalogFile() {
  try {
    const handle = await storedCatalogHandle();
    if (!handle || handle.name !== CATALOG_FILENAME) return;
    if (await handle.queryPermission({ mode: 'readwrite' }) === 'granted') await openCatalogFile(handle, true);
    else {
      catalogFileHandle = handle;
      element('catalog-file-status').textContent = `${handle.name} için dosya iznini yenileyin.`;
    }
  } catch (error) {
    element('catalog-file-status').textContent = 'JSON dosyasını yeniden bağlayın.';
  }
}

function isWebUrl(value) {
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch (error) { return false; }
}
