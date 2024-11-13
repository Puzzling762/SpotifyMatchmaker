const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user_id: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    gender: { type: String, required: true },
    topArtists: [String],
    topTracks: [String],
});

module.exports = mongoose.model('User', userSchema);
