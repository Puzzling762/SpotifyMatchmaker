const express = require('express');
const router = express.Router();
const User = require('../models/User');
const MatchmakingService = require('../matchmakingService');

const matchService = new MatchmakingService();  // Reuse the matchmaking service instance

// Route to fetch all users (for testing purposes)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// Route to find and render the best match for a user
router.get('/match/:userId', async (req, res) => {
    try {
        // Fetch the user by ID
        const user = await User.findOne({ user_id: req.params.userId });
        if (!user) return res.status(404).render('nomatch');

        // Find the best match using MatchmakingService
        const bestMatch = await matchService.findBestMatch(user);

        // Render the match view if a match is found, otherwise render 'nomatch'
        if (bestMatch) {
            res.render('match', {
                matchedUser: bestMatch.matched_user,
                matchScore: bestMatch.match_score,
                commonArtists: bestMatch.common_artists,
                commonTracks: bestMatch.common_tracks
            });
        } else {
            res.render('nomatch');
        }
    } catch (error) {
        console.error("Error finding match:", error);
        res.status(500).json({ error: "Failed to find match" });
    }
});

module.exports = router;
