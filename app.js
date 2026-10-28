let touchStartX = 0;

// Başlatma ve arayüz olayları.
element('add-product').addEventListener('click', addProduct);
element('connect-catalog').addEventListener('click', connectCatalogFile);
element('add-category').addEventListener('click', openCategoryDialog);
element('form-add-category').addEventListener('click', openCategoryDialog);
element('manage-add-category').addEventListener('click', openCategoryDialog);
element('manage-categories').addEventListener('click', () => { renderCategoryManager(); element('manage-dialog').showModal(); });
element('product-form').addEventListener('submit', saveProduct);
element('category-form').addEventListener('submit', addCategory);
element('move-form').addEventListener('submit', async event => {
  event.preventDefault();
  const destination = element('move-category').value;
  if (destination && await finishDeleteCategory(categoryBeingDeleted, destination)) element('move-dialog').close();
});
element('search').addEventListener('input', renderProducts);
element('add-image-url').addEventListener('click', addImageUrl);
element('image-file').addEventListener('change', addImageFiles);
element('detect-photos').addEventListener('click', detectPhotos);
element('product-url').addEventListener('change', () => {
  if (!draftImages.length && isWebUrl(element('product-url').value.trim())) detectPhotos();
});
element('gallery-previous').addEventListener('click', () => changeGalleryImage(-1));
element('gallery-next').addEventListener('click', () => changeGalleryImage(1));
element('gallery-edit').addEventListener('click', () => { element('gallery-dialog').close(); editProduct(galleryProductId); });
element('gallery-stage').addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
element('gallery-stage').addEventListener('touchend', event => {
  const distance = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(distance) > 40) changeGalleryImage(distance < 0 ? 1 : -1);
}, { passive: true });
element('export-csv').addEventListener('click', exportCSV);
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => element(button.dataset.close).close()));
renderCategories();
renderProducts();
restoreCatalogFile();