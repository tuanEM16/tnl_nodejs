const express = require('express');
const cors = require('cors');
require('dotenv').config(); 

const app = express();
const rootRouter = require('./routes/index'); 


app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/api', rootRouter);
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Đường dẫn API không tồn tại!" });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Server đồ án đang chạy tại: http://localhost:${PORT}`);
    console.log(`-----------------------------------------`);
});