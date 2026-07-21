from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'products.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute('''CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        cat TEXT NOT NULL,
        gender TEXT NOT NULL,
        price TEXT NOT NULL,
        oldPrice TEXT DEFAULT '',
        image TEXT DEFAULT '',
        sort_order INTEGER DEFAULT 0
    )''')
    cursor = conn.execute('SELECT COUNT(*) FROM products')
    count = cursor.fetchone()[0]
    if count == 0:
        defaults = [
            ('طقم تيشيرت وشورت', 'baby', 'girls', '٢٥٠ ج.م', '٣٥٠ ج.م', '', 1),
            ('سويت شيرت كامل', 'toddler', 'boys', '٣٨٠ ج.م', '', '', 2),
            ('فستان كاجوال', 'kids', 'girls', '٤٢٠ ج.م', '', '', 3),
            ('طقم تيشيرت وبنطلون رياضي', 'kids', 'boys', '٣٥٠ ج.م', '٤٥٠ ج.م', '', 4),
            ('بليزر كاجوال', 'junior', 'boys', '٥٥٠ ج.م', '', '', 5),
            ('هودي أوفررايزد', 'junior', 'girls', '٤٨٠ ج.م', '', '', 6),
            ('بيجامة قطن مطبوعة', 'baby', 'boys', '١٨٠ ج.م', '', '', 7),
            ('طقم فستان وبادي', 'toddler', 'girls', '٣٢٠ ج.م', '٤٢٠ ج.م', '', 8),
        ]
        conn.executemany('INSERT INTO products (name, cat, gender, price, oldPrice, image, sort_order) VALUES (?,?,?,?,?,?,?)', defaults)
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db()
    rows = conn.execute('SELECT * FROM products ORDER BY sort_order ASC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.json
    conn = get_db()
    max_order = conn.execute('SELECT COALESCE(MAX(sort_order),0) FROM products').fetchone()[0]
    cursor = conn.execute(
        'INSERT INTO products (name, cat, gender, price, oldPrice, image, sort_order) VALUES (?,?,?,?,?,?,?)',
        (data['name'], data['cat'], data['gender'], data['price'], data.get('oldPrice',''), data.get('image',''), max_order + 1)
    )
    conn.commit()
    product_id = cursor.lastrowid
    product = dict(conn.execute('SELECT * FROM products WHERE id=?', (product_id,)).fetchone())
    conn.close()
    return jsonify(product), 201

@app.route('/api/products/<int:pid>', methods=['PUT'])
def update_product(pid):
    data = request.json
    conn = get_db()
    conn.execute(
        'UPDATE products SET name=?, cat=?, gender=?, price=?, oldPrice=?, image=? WHERE id=?',
        (data['name'], data['cat'], data['gender'], data['price'], data.get('oldPrice',''), data.get('image',''), pid)
    )
    conn.commit()
    product = dict(conn.execute('SELECT * FROM products WHERE id=?', (pid,)).fetchone())
    conn.close()
    return jsonify(product)

@app.route('/api/products/<int:pid>', methods=['DELETE'])
def delete_product(pid):
    conn = get_db()
    conn.execute('DELETE FROM products WHERE id=?', (pid,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

@app.route('/api/products/reorder', methods=['POST'])
def reorder_products():
    data = request.json
    conn = get_db()
    for item in data['order']:
        conn.execute('UPDATE products SET sort_order=? WHERE id=?', (item['order'], item['id']))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})

if __name__ == '__main__':
    print('SASA Server running on http://localhost:5000')
    app.run(host='0.0.0.0', port=5000, debug=True)
