import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('../utils/categorySearch.js', import.meta.url), 'utf8');
const { filterCategories } = await import(
  'data:text/javascript;base64,' + Buffer.from(source).toString('base64')
);
const home = await readFile(new URL('../screens/HomeScreen.js', import.meta.url), 'utf8');
const categories = [
  { id: 1, name: 'Coğrafya', description: 'Dünya ve haritalar' },
  { id: 2, name: 'Müzik', description: 'Ses ve teori' },
  { id: 3, name: 'Tarih', description: 'Geçmiş olaylar' },
];

test('finds Turkish category names with unaccented input', () => {
  assert.deepEqual(filterCategories(categories, 'cografya').map(c => c.id), [1]);
  assert.deepEqual(filterCategories(categories, 'MUZIK').map(c => c.id), [2]);
});

test('searches descriptions and ignores surrounding whitespace', () => {
  assert.deepEqual(filterCategories(categories, '  haritalar ').map(c => c.id), [1]);
  assert.deepEqual(filterCategories(categories, 'teori').map(c => c.id), [2]);
});

test('empty or malformed query returns a copy without reordering', () => {
  const copy = filterCategories(categories, '  ');
  assert.deepEqual(copy, categories);
  assert.notStrictEqual(copy, categories);
  assert.deepEqual(filterCategories(categories, null), categories);
  assert.deepEqual(filterCategories(null, 'abc'), []);
});

test('unmatched or malformed categories do not crash', () => {
  assert.deepEqual(filterCategories(categories, 'yok'), []);
  assert.deepEqual(filterCategories([null, {}, categories[0]], 'dunya').map(c => c.id), [1]);
});

test('home screen connects search input, filtered cards and empty state', () => {
  assert.match(home, /filterCategories\(categories, categoryQuery\)/);
  assert.match(home, /value=\{categoryQuery\}/);
  assert.match(home, /visibleCategories\.map/);
  assert.match(home, /Aramanıza uygun kategori bulunamadı/);
});
