const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const MongoStore = require('connect-mongo'); // Import MongoStore

dotenv.config();

const spotifyRoutes = require('./routes/spotifyRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

const mongoUri = process.env.MONGO_URI || "mongodb+srv://Puzzl1ng:120617@spotify-backend.7vyj2.mongodb.net/users?retryWrites=true&w=majority&appName=Spotify-backend";

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(error => console.error("MongoDB connection error:", error));

// Configure session to use MongoDB for storing sessions
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, // MongoDB URI for session storage
        ttl: 14 * 24 * 60 * 60 // Session TTL (14 days)
    }),
    cookie: { secure: false } // Set to true in production if using HTTPS
}));

// Register routes
app.use('/spotify', spotifyRoutes);
app.use('/api', userRoutes);

// Home route
app.get('/', (req, res) => res.render('index'));

// Start server
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
