const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const { connectDB } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();
app.use(cors());
app.use(express.json());

connectDB();
const PORT = 5000;

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/uploads',uploadRoutes);

app.use('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Yash Database API' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT} 🚀`);
});