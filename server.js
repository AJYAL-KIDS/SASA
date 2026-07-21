const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const isVercel = !!process.env.VERCEL;
const DB_FILE = path.join(__dirname, 'products.json');

const DEFAULTS = [
    {id:1,name:'طقم تيشيرت وشورت',cat:'baby',gender:'girls',price:'٢٥٠ ج.م',oldPrice:'٣٥٠ ج.م',image:'',sort_order:1},
    {id:2,name:'سويت شيرت كامل',cat:'toddler',gender:'boys',price:'٣٨٠ ج.م',oldPrice:'',image:'',sort_order:2},
    {id:3,name:'فستان كاجوال',cat:'kids',gender:'girls',price:'٤٢٠ ج.م',oldPrice:'',image:'',sort_order:3},
    {id:4,name:'طقم تيشيرت وبنطلون رياضي',cat:'kids',gender:'boys',price:'٣٥٠ ج.م',oldPrice:'٤٥٠ ج.م',image:'',sort_order:4},
    {id:5,name:'بليزر كاجوال',cat:'junior',gender:'boys',price:'٥٥٠ ج.م',oldPrice:'',image:'',sort_order:5},
    {id:6,name:'هودي أوفررايزد',cat:'junior',gender:'girls',price:'٤٨٠ ج.م',oldPrice:'',image:'',sort_order:6},
    {id:7,name:'بيجامة قطن مطبوعة',cat:'baby',gender:'boys',price:'١٨٠ ج.م',oldPrice:'',image:'',sort_order:7},
    {id:8,name:'طقم فستان وبادي',cat:'toddler',gender:'girls',price:'٣٢٠ ج.م',oldPrice:'٤٢٠ ج.م',image:'',sort_order:8}
];

let products;

function loadProducts() {
    if (isVercel) {
        if (!global.__products) global.__products = JSON.parse(JSON.stringify(DEFAULTS));
        products = global.__products;
        return;
    }
    try {
        if (fs.existsSync(DB_FILE)) {
            products = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        } else {
            products = JSON.parse(JSON.stringify(DEFAULTS));
            saveProducts();
        }
    } catch (e) {
        products = JSON.parse(JSON.stringify(DEFAULTS));
        saveProducts();
    }
}

function saveProducts() {
    if (isVercel) {
        global.__products = products;
        return;
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(products, null, 2), 'utf8');
}

loadProducts();

app.get('/api/products', (req, res) => {
    res.json([...products].sort((a,b) => a.sort_order - b.sort_order));
});

app.post('/api/products', (req, res) => {
    const { name, cat, gender, price, oldPrice, image } = req.body;
    const maxId = products.length > 0 ? Math.max(...products.map(p=>p.id)) : 0;
    const maxOrder = products.length > 0 ? Math.max(...products.map(p=>p.sort_order)) : 0;
    const product = {
        id: maxId + 1,
        name, cat, gender, price,
        oldPrice: oldPrice || '',
        image: image || '',
        sort_order: maxOrder + 1
    };
    products.push(product);
    saveProducts();
    res.status(201).json(product);
});

app.put('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, cat, gender, price, oldPrice, image } = req.body;
    const p = products.find(x => x.id === id);
    if (!p) return res.status(404).json({error:'not found'});
    Object.assign(p, { name, cat, gender, price, oldPrice: oldPrice||'', image: image||'' });
    saveProducts();
    res.json(p);
});

app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    products = products.filter(x => x.id !== id);
    saveProducts();
    res.json({ok:true});
});

app.use(express.static(path.join(__dirname)));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

if (!isVercel) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log('SASA Server شغال على http://localhost:' + PORT);
    });
}

module.exports = app;
