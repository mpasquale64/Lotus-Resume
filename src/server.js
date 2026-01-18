const express = require('express');
const multer = require('multer');
const { ResumeDocumentBuilder, Packer } = require('./generator');
const path = require('path');
const cors = require('cors');

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());
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

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
