let selectedCategory = '';
let categoryBeingDeleted = '';

function replaceProductCategory(oldName, newName) {
  return catalog.products.map(product => {
    if (!product.categories.includes(oldName)) return product;
    const categories = product.categories.map(category => category === oldName ? newName : category);
    return { ...product, categories: [...new Set(categories.filter(Boolean))] };
  });
}

// Kategori ekleme, ad değiştirme ve ürünleri taşıyarak silme.
function fillCategorySelect(select, selected = '', excluded = '') {
  select.replaceChildren();
  const placeholder = new Option('Kategori seçin', '');
  select.add(placeholder);
  catalog.categories.filter(category => category !== excluded).forEach(category => select.add(new Option(category, category)));
  select.value = selected;
}

function selectedProductCategories() {
  return [...element('product-category').querySelectorAll('input:checked')].map(input => input.value);
}

function renderProductCategories(selected = []) {
  const container = element('product-category');
  container.replaceChildren();
  catalog.categories.forEach(category => {
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
  const choices = [{ name: 'Tüm ürünler', value: '' }, ...catalog.categories.map(category => ({ name: category, value: category }))];
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
  return catalog.categories.some(category => category !== except && category.toLocaleLowerCase('tr') === name.toLocaleLowerCase('tr'));
}

async function addCategory(event) {
  event.preventDefault();
  const name = element('category-name').value.trim();
  if (!name || categoryExists(name)) {
    element('category-error').textContent = 'Geçerli ve benzersiz bir kategori adı girin.';
    return;
  }
  const selected = element('product-dialog').open ? selectedProductCategories() : [];
  if (!await updateCatalog(catalog.products, [...catalog.categories, name])) return;
  if (element('product-dialog').open) renderProductCategories([...selected, name]);
  if (element('manage-dialog').open) renderCategoryManager();
  element('category-dialog').close();
}

async function renameCategory(oldName, newName) {
  newName = newName.trim();
  if (!newName || categoryExists(newName, oldName)) {
    alert('Geçerli ve benzersiz bir kategori adı girin.');
    return;
  }
  if (newName === oldName) return;
  const nextCategories = catalog.categories.map(category => category === oldName ? newName : category);
  const nextProducts = replaceProductCategory(oldName, newName);
  if (!await updateCatalog(nextProducts, nextCategories)) return;
  if (selectedCategory === oldName) selectedCategory = newName;
  renderCategories();
  renderProducts();
  renderCategoryManager();
}

function deleteCategory(name) {
  const count = catalog.products.filter(product => product.categories.includes(name)).length;
  if (count) {
    categoryBeingDeleted = name;
    element('move-message').textContent = `“${name}” kategorisinde ${count} ürün var. Silmeden önce ürünleri başka bir kategoriye taşıyın.`;
    fillCategorySelect(element('move-category'), '', name);
    element('move-error').textContent = catalog.categories.length < 2 ? 'Önce ürünleri taşıyabileceğiniz başka bir kategori oluşturun.' : '';
    element('move-dialog').showModal();
    return;
  }
  if (!confirm(`“${name}” kategorisi silinsin mi?`)) return;
  finishDeleteCategory(name, '');
}

async function finishDeleteCategory(name, destination) {
  const nextProducts = replaceProductCategory(name, destination);
  if (!await updateCatalog(nextProducts, catalog.categories.filter(category => category !== name))) return false;
  if (selectedCategory === name) selectedCategory = '';
  renderCategories();
  renderProducts();
  renderCategoryManager();
  return true;
}

function renderCategoryManager() {
  const list = element('category-list');
  list.replaceChildren();
  catalog.categories.forEach(category => {
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
