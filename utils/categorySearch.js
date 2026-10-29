// Accent-insensitive, Turkish-aware search over the locally defined categories.
function searchKey(value) {
  return value.toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function filterCategories(categories, query) {
  if (!Array.isArray(categories)) return [];
  const needle = searchKey(typeof query === 'string' ? query.trim() : '');
  if (!needle) return [...categories];
  return categories.filter(category =>
    [category?.name, category?.description].some(value =>
      typeof value === 'string' && searchKey(value).includes(needle),
    ),
  );
}
