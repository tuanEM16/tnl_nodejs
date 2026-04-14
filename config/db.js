const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'tnl' 
});
connection.connect(err => {
  if (err) {
    console.error('Lỗi kết nối Database: ' + err.stack);
    return;
  }
  console.log('Đã kết nối Database thành công!');
});
module.exports = connection;