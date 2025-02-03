const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path');
const MongoStore = require('connect-mongo');

dotenv.config(); 

const spotifyRoutes = require('./routes/spotifyRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// ✅ Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Explicitly set views directory

// ✅ Serve the `public` folder as static (important for CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Debugging: Check if static files are accessible
app.use((req, res, next) => {
    console.log(`Request URL: ${req.url}`);
    next();
});

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((error) => console.error('❌ MongoDB connection error:', error));

// ✅ Session setup
app.use(session({
    secret: process.env.SECRET_KEY || 'default_secret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, 
        ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production' && process.env.RENDER === undefined, // Fix for Render
        httpOnly: true,
        maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
    }
}));

// ✅ Routes
app.use('/spotify', spotifyRoutes);
app.use('/api', userRoutes);

// ✅ Default route
app.get('/', (req, res) => res.render('index'));

// ✅ Check if static files are accessible on Render
app.get('/test-css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'css', 'styles.css'));
});

// ✅ Start the server
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
