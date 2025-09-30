
import express from 'express';
import axios from 'axios';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cheerio = require('cheerio');

const app = express();
app.use(express.json());

// Utilidad para generar abreviaturas inteligentes
function generateAbbreviations(text) {
  const words = text.split(/\s|,|\.|-|_/).filter(Boolean);
  const abbrs = new Set();
  // Iniciales
  abbrs.add(words.map(w => w[0]).join('').toUpperCase());
  // Primeras 3-4 letras de cada palabra
  words.forEach(w => {
    if (w.length > 2) abbrs.add(w.slice(0, 3).toUpperCase());
    if (w.length > 3) abbrs.add(w.slice(0, 4).toUpperCase());
  });
  // Combinaciones de iniciales y números
  const withNumbers = words.filter(w => /\d/.test(w));
  if (withNumbers.length) abbrs.add(withNumbers.join('').toUpperCase());
  // Quitar duplicados y vacíos
  return Array.from(abbrs).filter(a => a.length > 1);
}

// Endpoint: Buscar productos RISOLU en la web
app.get('/buscar', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Falta parámetro de búsqueda (q)' });
  try {
    // Buscar en la tienda RISOLU
    const url = `https://tienda.risoul.com.mx/catalogsearch/result/?q=${encodeURIComponent(q)}`;
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);
    const productos = [];
    $('.product-item-info').each((i, el) => {
      const nombre = $(el).find('.product-item-link').text().trim();
      const url = $(el).find('.product-item-link').attr('href');
      const precio = $(el).find('.price').first().text().trim();
      if (nombre && url) productos.push({ nombre, url, precio });
    });
    res.json({ resultados: productos });
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar productos', detalle: err.message });
  }
});

// Endpoint: Generar sinónimos y abreviaturas
app.post('/sinonimos', (req, res) => {
  const { alias, descripcion } = req.body;
  if (!alias && !descripcion) return res.status(400).json({ error: 'Faltan datos de producto' });
  const base = `${alias || ''} ${descripcion || ''}`.trim();
  // Sinónimos básicos (puedes expandir con lógica de tu script.js)
  const synonyms = [
    ...new Set([
      alias,
      descripcion,
      ...generateAbbreviations(base),
      ...(alias ? generateAbbreviations(alias) : []),
      ...(descripcion ? generateAbbreviations(descripcion) : [])
    ].filter(Boolean))
  ];
  res.json({ base, synonyms });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API RISOLU escuchando en puerto ${PORT}`);
});
