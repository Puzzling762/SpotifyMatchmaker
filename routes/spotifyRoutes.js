const express = require('express');
const { getAuthUrl, getAccessToken, getUserTopArtists, getUserTopTracks } = require('../spotifyService');
const MatchmakingService = require('../matchmakingService');
const router = express.Router();
const User = require('../models/User');

// Route to register a user and redirect to Spotify authorization
router.post('/register', async (req, res) => {
    const { name, gender } = req.body;
    const userId = name.replace(/\s+/g, '_');
    const authUrl = getAuthUrl(userId, gender);
    res.redirect(authUrl);
});

// Callback route after Spotify authentication
router.get('/callback', async (req, res) => {
    const { code, state } = req.query;
    const [userId, userGender] = state.split(":");

    // Get access token from Spotify
    const token = await getAccessToken(code);

    if (token) {
        // Fetch user top artists and tracks from Spotify API
        const topArtists = await getUserTopArtists(token);
        const topTracks = await getUserTopTracks(token);

        const userData = { 
            user_id: userId, 
            name: userId.replace("_", " "), 
            gender: userGender, 
            topArtists, 
            topTracks 
        };

        // Save or update the user in the database
        const savedUser = await User.findOneAndUpdate({ user_id: userId }, userData, { upsert: true, new: true });

        // Initialize matchmaking service
        const matchmakingService = new MatchmakingService();
        const bestMatch = await matchmakingService.findBestMatch(savedUser);

        // Check if a best match was found
        if (bestMatch) {
            // Find common artists and tracks between the user and their best match
            const commonArtists = bestMatch.matched_user.topArtists.filter(artist =>
                savedUser.topArtists.includes(artist)
            );
            const commonTracks = bestMatch.matched_user.topTracks.filter(track =>
                savedUser.topTracks.includes(track)
            );

            // Render the match template with the match data
            res.render('match', { 
                matchedUser: bestMatch.matched_user, 
                matchScore: bestMatch.match_percentage, // Use match_percentage instead of match_score
                matchCategory: bestMatch.match_category, // Include match category
                commonArtists: commonArtists, 
                commonTracks: commonTracks 
            });
        } else {
            // Render the no match page if no match is found
            res.render('nomatch');
        }
    } else {
        res.send("Failed to get access token.");
    }
});

module.exports = router;
