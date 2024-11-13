const User = require('./models/User');

class MatchmakingService {
    async findBestMatch(user) {
        const users = await User.find({ gender: { $ne: user.gender }, user_id: { $ne: user.user_id } });
        let bestMatch = null;
        let highestScore = 0;

        for (let potentialMatch of users) {
            const commonArtists = user.topArtists.filter(artist => potentialMatch.topArtists.includes(artist)).length;
            const commonTracks = user.topTracks.filter(track => potentialMatch.topTracks.includes(track)).length;
            const matchScore = commonArtists * 0.6 + commonTracks * 0.4;

            if (matchScore > highestScore) {
                highestScore = matchScore;
                bestMatch = potentialMatch;
            }
        }

        return bestMatch ? { matched_user: bestMatch, match_score: highestScore } : null;
    }
}

module.exports = MatchmakingService;
