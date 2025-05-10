// 1. IMPORT DEPENDENCIES
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // ensure this is AFTER mongoose

// 2. INITIALIZE APP
const app = express();
const PORT = process.env.PORT || 5000;

// 3. MIDDLEWARE
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// 4. DATABASE
mongoose.connect('mongodb://localhost:27017/tutorApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// 5. ROUTES
app.post('/api/register', async (req, res) => {
  const { name, email, password, isTutor } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = new User({ name, email, password: hashedPassword, isTutor });
    await user.save();
    res.json({ message: 'Registered' });
  } catch (err) {
    res.status(400).json({ error: 'User exists' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '1h' });
  res.json({ token });
});

// 6. START SERVER
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
