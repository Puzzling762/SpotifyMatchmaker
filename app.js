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
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));


app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, 
        ttl: 14 * 24 * 60 * 60 
    }),
    cookie: { secure: true } 
}));


app.use('/spotify', spotifyRoutes);
app.use('/api', userRoutes);


app.get('/', (req, res) => res.render('index'));


const PORT = process.env.PORT || 8888;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
