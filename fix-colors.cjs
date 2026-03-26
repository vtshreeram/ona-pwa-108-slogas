const fs = require('fs');

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace(/#([0-9A-Fa-f]{6})/g, match => {
  return hexToRgb(match);
});

fs.writeFileSync('src/index.css', css);
