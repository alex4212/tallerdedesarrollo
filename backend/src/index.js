require('dotenv').config({ path: require('path').join(__dirname, 'config', '.env') });
const app = require('./app');
const { connectDB } = require('./config/configDb');
const { setupDatabase } = require('./config/initialSetup');

const PORT = process.env.PORT || 80;

connectDB()
  .then(async () => {
    await setupDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo iniciar el servidor:', err.message);
    process.exit(1);
  });
