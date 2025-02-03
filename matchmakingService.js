const User = require('./models/User');

class MatchmakingService {
    async findBestMatch(user) {
        const users = await User.find({ gender: { $ne: user.gender }, user_id: { $ne: user.user_id } });
        let bestMatch = null;
        let highestPercentage = 0;
        let matchCategory = "No Match"; // Default category when no match found

        // Calculate total possible matches based on artists and tracks
        const totalArtists = user.topArtists.length;
        const totalTracks = user.topTracks.length;

        // If no top artists or tracks, return "No Score Available"
        if (totalArtists === 0 && totalTracks === 0) {
            return { matched_user: null, match_percentage: "No Score Available", match_category: "No Match" };
        }

        for (let potentialMatch of users) {
            // Calculate common artists and tracks between user and potential match
            const commonArtists = user.topArtists.filter(artist => potentialMatch.topArtists.includes(artist)).length;
            const commonTracks = user.topTracks.filter(track => potentialMatch.topTracks.includes(track)).length;

            // Calculate artist match percentage
            const artistPercentage = totalArtists > 0 ? (commonArtists / totalArtists) * 100 : 0;

            // Calculate track match percentage
            const trackPercentage = totalTracks > 0 ? (commonTracks / totalTracks) * 100 : 0;

            // Combine artist and track percentages (weighted average)
            const matchPercentage = (artistPercentage + trackPercentage) / 2;

            // If this match has the highest percentage, update best match and category
            if (matchPercentage > highestPercentage) {
                highestPercentage = matchPercentage;
                bestMatch = potentialMatch;

                // Assign match category based on percentage
                if (matchPercentage > 70) {
                    matchCategory = "Strong Match";
                } else if (matchPercentage >= 40) {
                    matchCategory = "Moderate Match";
                } else {
                    matchCategory = "Weak Match";
                }
            }
        }

        // If no best match is found, return "No Score Available"
        if (!bestMatch) {
            return { matched_user: null, match_percentage: "No Score Available", match_category: "No Match" };
        }

        // Return the best match, match percentage, and match category
        return { 
            matched_user: bestMatch, 
            match_percentage: highestPercentage.toFixed(2) + '%', // Format the match percentage
            match_category: matchCategory
        };
    }
}

module.exports = MatchmakingService;
