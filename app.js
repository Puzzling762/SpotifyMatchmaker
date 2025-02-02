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

// Set EJS as the template engine
app.set('view engine', 'ejs');

// ✅ Serve the `public` folder as static (important for CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));

// Session setup
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, 
        ttl: 14 * 24 * 60 * 60 
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 14 * 24 * 60 * 60 * 1000
    }
}));

// Routes
app.use('/spotify', spotifyRoutes);
app.use('/api', userRoutes);

// Default route
app.get('/', (req, res) => res.render('index'));

// Start the server
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
