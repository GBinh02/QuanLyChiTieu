require('dotenv').config();
const { initDb } = require('./db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Backend đang chạy tại http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error('❌ Không thể khởi động server:', err.message);
    process.exit(1);
  });
