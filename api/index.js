const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// MIDDLEWARE - CORS को सिंपल रखें ताकि Vercel के किसी भी सबडोमेन से रिक्वेस्ट आ सके
app.use(cors()); 
app.use(express.json());

// MONGODB SCHEMA/MODEL
const ContactSchema = new mongoose.Schema({
    name:      { type: String, required: true },
    email:     { type: String, required: true },
    phone:     String,
    subject:   String,
    message:   { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Contact = mongoose.models.Contact || 
                mongoose.model('Contact', ContactSchema);

// SERVERLESS DATABASE CONNECTION
let cached = global.mongoose || { conn: null };

async function connectDB() {
    if (cached.conn && mongoose.connection.readyState === 1) {
        console.log('=> Using existing database connection');
        return cached.conn;
    }
    console.log('=> Creating new database connection...');
    cached.conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 8000,
        bufferCommands: false,
    });
    global.mongoose = cached;
    console.log('✅ MongoDB connected successfully!');
    return cached.conn;
}

// API ROUTE
app.post('/api/contact', async (req, res) => {
    try {
        // Connect to DB
        await connectDB();

        // Save to MongoDB
        const newContact = new Contact(req.body);
        await newContact.save();
        console.log('✅ Data saved to MongoDB!');

        // Send Email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from:    process.env.EMAIL_USER,
            to:      process.env.EMAIL_USER,
            subject: `🚀 New Portfolio Message from ${req.body.name}`,
            text:    `Name: ${req.body.name}\nEmail: ${req.body.email}\nPhone: ${req.body.phone}\nSubject: ${req.body.subject}\nMessage: ${req.body.message}`
        });
        console.log('✅ Email sent!');

        return res.status(201).json({ 
            message: 'Message received, saved and emailed!' 
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        return res.status(500).json({
            message: 'Server error.',
            error: error.message
        });
    }
});

module.exports = app;
