const express = require('express');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

// 1. Inisialisasi Firebase Admin
const serviceAccount = require("./serviceAccount.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const upload = multer({ limits: { fileSize: 100 * 1024 * 1024 } }); // Limit 100MB
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

// 2. Middleware Proteksi Akun
const authenticate = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) return res.status(401).json({ error: 'Harus Login dulu!' });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Sesi habis atau Token salah' });
  }
};

// 3. Endpoint Chat BotPlayz
app.post('/api/chat', authenticate, upload.single('file'), async (req, res) => {
  try {
    const { message, history } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let parts = [{ text: message }];

    // Handle File (Gambar/Video/Audio)
    if (req.file) {
      parts.push({
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype
        }
      });
    }

    const chat = model.startChat({
      history: JSON.parse(history || "[]"),
    });

    const result = await chat.sendMessage(parts);
    const response = await result.response;

    res.json({ 
      reply: response.text(),
      uid: req.user.uid // Mengembalikan UID buat disimpan di history frontend
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "BotPlayz lagi gangguan: " + error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 BotPlayz Backend jalan di port ${PORT}`));

// Di dalam endpoint /api/chat setelah dapet response.text()
const db = admin.firestore();

// Simpan pesan User
await db.collection('users').doc(uid).collection('chats').doc(chatId).collection('messages').add({
  role: 'user',
  text: message,
  timestamp: admin.firestore.FieldValue.serverTimestamp()
});

// Simpan balasan BotPlayz
await db.collection('users').doc(uid).collection('chats').doc(chatId).collection('messages').add({
  role: 'model',
  text: response.text(),
  timestamp: admin.firestore.FieldValue.serverTimestamp()
});
