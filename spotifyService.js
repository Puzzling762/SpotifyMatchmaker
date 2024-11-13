const axios = require('axios');
const querystring = require('querystring');
require('dotenv').config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

function getAuthUrl(userId, gender) {
    const authUrl = "https://accounts.spotify.com/authorize";
    const params = {
        client_id: clientId,
        response_type: "code",
        redirect_uri: redirectUri,
        scope: "user-top-read",
        state: `${userId}:${gender}`
    };
    return `${authUrl}?${querystring.stringify(params)}`;
}

async function getAccessToken(authCode) {
    const tokenUrl = "https://accounts.spotify.com/api/token";
    const headers = { "Content-Type": "application/x-www-form-urlencoded" };
    const data = {
        grant_type: "authorization_code",
        code: authCode,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
    };
    
    try {
        const response = await axios.post(tokenUrl, querystring.stringify(data), { headers });
        return response.data.access_token;
    } catch (error) {
        console.error("Failed to retrieve access token:", error.response ? error.response.data : error.message);
        return null;
    }
}

async function getUserTopArtists(token) {
    const url = "https://api.spotify.com/v1/me/top/artists";
    try {
        const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        return response.data.items.map(artist => artist.name);
    } catch (error) {
        console.error("Error fetching top artists:", error.response ? error.response.data : error.message);
        return [];
    }
}

async function getUserTopTracks(token) {
    const url = "https://api.spotify.com/v1/me/top/tracks";
    try {
        const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        return response.data.items.map(track => track.name);
    } catch (error) {
        console.error("Error fetching top tracks:", error.response ? error.response.data : error.message);
        return [];
    }
}

module.exports = { getAuthUrl, getAccessToken, getUserTopArtists, getUserTopTracks };
