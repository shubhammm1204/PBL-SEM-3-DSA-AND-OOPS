const fs = require('fs');
const path = require('path');

const menuFile = path.join(__dirname, '..', 'data', 'menu.txt');

function clean(value) {
  return String(value ?? '').replace(/[|\r\n]/g, ' ').trim();
}

function readMenu() {
  if (!fs.existsSync(menuFile)) return [];
  return fs.readFileSync(menuFile, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [id, name, category, priceText, availableText, emoji] = line.split('|');
      return {
        id: clean(id),
        name: clean(name),
        category: clean(category),
        price: Number(priceText),
        available: availableText === '1' || availableText === 'true',
        emoji: clean(emoji) || '🍽️'
      };
    })
    .filter(item => item.id && item.name && item.category &&
      Number.isSafeInteger(item.price) && item.price > 0);
}

function writeMenu(items) {
  const lines = items.map(item => [
    clean(item.id), clean(item.name), clean(item.category),
    String(item.price), item.available ? '1' : '0', clean(item.emoji || '🍽️')
  ].join('|'));
  const tempFile = `${menuFile}.tmp`;
  fs.writeFileSync(tempFile, lines.length ? `${lines.join('\n')}\n` : '', 'utf8');
  fs.renameSync(tempFile, menuFile);
}

module.exports = { readMenu, writeMenu };
