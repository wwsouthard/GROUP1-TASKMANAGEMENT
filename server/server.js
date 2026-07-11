require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

// Connect to MongoDB only if MONGO_URI exists
if (process.env.MONGO_URI) {
  connectDB();
} else {
  console.warn('MONGO_URI is not set. Server is running without database connection.');
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
