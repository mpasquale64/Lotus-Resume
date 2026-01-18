require('dotenv').config();
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const { ResumeDocumentBuilder } = require('./generator');
const { Packer } = require('docx');
const path = require('path');
const cors = require('cors');

const app = express();
const upload = multer();

// 1. Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_key',
  resave: false,
  saveUninitialized: false
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Simple Password Auth Routes
app.get('/login', (req, res) => {
  res.send(`
    <div style="display:flex;justify-content:center;margin-top:50px;font-family:sans-serif;">
      <form method="POST" action="/login" style="padding:20px;border:1px solid #ccc;border-radius:5px;background:#f9f9f9;">
        <h2 style="margin-top:0;">Login</h2>
        ${req.query.error ? '<p style="color:red;">Incorrect password</p>' : ''}
        <input type="password" name="password" placeholder="Enter Password" required style="padding:8px;margin-bottom:10px;width:200px;display:block;">
        <button type="submit" style="padding:8px 16px;background:#2ea44f;color:white;border:none;border-radius:4px;cursor:pointer;width:100%;">Enter</button>
      </form>
    </div>
  `);
});

app.post('/login', (req, res) => {
  const password = process.env.ADMIN_PASSWORD || 'admin';
  if (req.body.password === password) {
    req.session.isAuthenticated = true;
    req.session.save(() => res.redirect('/'));
  } else {
    res.redirect('/login?error=1');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// 3. Protect all subsequent routes
app.use((req, res, next) => {
  if (req.session.isAuthenticated) return next();
  res.redirect('/login');
});

app.use(express.static('public'));

app.post('/generate', upload.single('file'), async (req, res) => {
  try {
    let data;
    if (req.file) {
      data = JSON.parse(req.file.buffer.toString());
    } else {
      data = req.body;
    }

    const builder = new ResumeDocumentBuilder(data);
    const doc = builder.build();
    const buffer = await Packer.toBuffer(doc);

    res.setHeader('Content-Disposition', 'attachment; filename=resume.docx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
