const express = require('express');
const cors = require('cors');
const mysql = require('mysql2'); 
const app = express();
app.use(cors());
app.use(express.json());
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'tnl'
});
app.get('/api/products', (req, res) => {
  const sql = "SELECT * FROM products";
  db.query(sql, (err, results) => {
    if (err) return res.json({ error: err.message });
    res.json(results);
  });
});
app.listen(5000, () => console.log("Backend đang chạy "));