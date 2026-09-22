require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/configDb');
const { setupDatabase } = require('./config/initialSetup');

const PORT = process.env.PORT || 3000;

connectDB().then(async () => {
  try {
    await setupDatabase();
  } catch (e) {
    console.error('Error in setupDatabase:', e);
  }
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} (DB Connected)`);
  });
}).catch(err => {
  console.error('Failed to connect to the database on startup:', err);
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} (DB Offline)`);
  });
});
