const express = require('express');
const router = express.Router();
const User = require('../models/User');
const MatchmakingService = require('../matchmakingService');

const matchService = new MatchmakingService();  

// Endpoint to get all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// Endpoint to find the best match for a user
router.get('/match/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ user_id: req.params.userId });
        if (!user) return res.status(404).render('nomatch'); // If user not found, show no match page

        const bestMatch = await matchService.findBestMatch(user);

        // Check if a best match was found
        if (bestMatch) {
            // Find common artists and tracks between the user and their best match
            const commonArtists = bestMatch.matched_user.topArtists.filter(artist =>
                user.topArtists.includes(artist)
            );
            const commonTracks = bestMatch.matched_user.topTracks.filter(track =>
                user.topTracks.includes(track)
            );

            // Render the match template with the match data
            res.render('match', {
                matchedUser: bestMatch.matched_user,            // Pass the matched user details
                matchScore: bestMatch.match_percentage,         // Pass the match percentage (score)
                matchCategory: bestMatch.match_category,        // Pass the match category
                commonArtists: commonArtists || [],             // Pass common artists, if available
                commonTracks: commonTracks || []                // Pass common tracks, if available
            });
        } else {
            res.render('nomatch'); // If no match found, render no match page
        }
    } catch (error) {
        console.error("Error finding match:", error);
        res.status(500).json({ error: "Failed to find match" });
    }
});

module.exports = router;
