require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/configDb');
const { setupDatabase } = require('./config/initialSetup');

const PORT = process.env.PORT || 3000;

connectDB().then(async () => {
  await setupDatabase();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
