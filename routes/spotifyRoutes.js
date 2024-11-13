const express = require('express');
const { getAuthUrl, getAccessToken, getUserTopArtists, getUserTopTracks } = require('../spotifyService');
const MatchmakingService = require('../matchmakingService');
const router = express.Router();
const User = require('../models/User');

router.post('/register', async (req, res) => {
    const { name, gender } = req.body;
    const userId = name.replace(/\s+/g, '_');
    const authUrl = getAuthUrl(userId, gender);
    res.redirect(authUrl);
});

router.get('/callback', async (req, res) => {
    const { code, state } = req.query;
    const [userId, userGender] = state.split(":");
    const token = await getAccessToken(code);

    if (token) {
        const topArtists = await getUserTopArtists(token);
        const topTracks = await getUserTopTracks(token);

        const userData = { user_id: userId, name: userId.replace("_", " "), gender: userGender, topArtists, topTracks };
        
        // Save or update the user data in the database
        const savedUser = await User.findOneAndUpdate({ user_id: userId }, userData, { upsert: true, new: true });

        // After saving the user data, call the matchmaking service
        const matchmakingService = new MatchmakingService();
        const bestMatch = await matchmakingService.findBestMatch(savedUser);

        if (bestMatch) {
            // Calculate common artists and common tracks
            const commonArtists = bestMatch.matched_user.topArtists.filter(artist =>
                savedUser.topArtists.includes(artist)
            );

            const commonTracks = bestMatch.matched_user.topTracks.filter(track =>
                savedUser.topTracks.includes(track)
            );

            // Pass commonArtists and commonTracks to the template
            res.render('match', { 
                matchedUser: bestMatch.matched_user, 
                matchScore: bestMatch.match_score, 
                commonArtists: commonArtists, 
                commonTracks: commonTracks 
            });
        } else {
            res.render('nonmatch');
        }
    } else {
        res.send("Failed to get access token.");
    }
});

module.exports = router;
