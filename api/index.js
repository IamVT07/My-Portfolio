// portfolio server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Allows cross-origin requests
const nodemailer = require('nodemailer'); // 🔴 1. Nodemailer को यहाँ जोड़ा गया

const app = express();
const PORT = process.env.PORT || 5000;

// 1. MONGO DB CONNECTION SETUP (USING MONGOOSE)
const mongoURL = process.env.MONGODB_URI;

mongoose.connect(mongoURL)
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch(err => {
      console.error('MongoDB connection error:', err);
      process.exit(1); 
  });

// 2. MIDDLEWARE
app.use(cors()); 
app.use(express.json()); 

// 3. MONGODB SCHEMA/MODEL
const ContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    subject: String,
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', ContactSchema);

// 4. API ROUTE TO RECEIVE FORM DATA
app.post('/api/contact', async (req, res) => {
    // Check if MongoDB is actually connected before trying to save
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Database service unavailable.' });
    }
    
    try {
        // डेटाबेस में सेव करने का काम 
        const newContact = new Contact(req.body);
        await newContact.save();
        
        // =========================================================
        // 🔴 2. ईमेल भेजने वाला कोड (डेटाबेस में सेव होने के तुरंत बाद)
        // =========================================================
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,  // अपना जीमेल आईडी डालें
                pass: process.env.EMAIL_PASS // Google App Password डालें (बिना स्पेस के)
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER, // भेजने वाला (आपका ईमेल)
            to: process.env.EMAIL_USER,   // जिसे मैसेज मिलेगा (आपका ईमेल)
            subject: `🚀 New Portfolio Message from ${req.body.name}`,
            text: `Hello,\n\nYou got a new message on your portfolio!\n\nName: ${req.body.name}\nEmail: ${req.body.email}\nPhone: ${req.body.phone}\nSubject: ${req.body.subject}\nMessage:\n${req.body.message}`
        };

        // ईमेल भेजें
        await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        // =========================================================

        res.status(201).json({ message: 'Message successfully received, saved, and email sent!' });
    } catch (error) {
        console.error('Error saving contact or sending email:', error);
        res.status(500).json({ message: 'Server error during database save or email.', error: error.message });
    }
});

module.exports = app;