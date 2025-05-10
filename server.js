
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'ema_secret_key_here';

require('./db');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// File upload setup
const upload = multer({ dest: 'uploads/' });

// Register route
app.post('/api/register', async (req, res) => {
  const { name, email, password, isTutor } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = new User({ name, email, password: hashedPassword, isTutor });
    await user.save();
    const redirectTo = isTutor === 'true' ? '/tutor-login.html' : '/user-login.html';
    res.redirect(redirectTo);
  } catch (err) {
    res.status(400).json({ error: 'User already exists or invalid' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send('Invalid credentials');
  }
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '2h' });
  const redirectTo = user.isTutor ? '/tutor-dashboard.html' : '/portal.html';
  res.redirect(redirectTo);
});

// Upload route
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  res.send('File uploaded successfully');
});

app.listen(PORT, () => {
  console.log(`EMA backend running at http://localhost:${PORT}`);
});
