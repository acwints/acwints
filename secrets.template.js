// Google Sheets API credentials
const API_KEY = 'YOUR_API_KEY_HERE';
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';

// Initialize the Google API client
function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
        scope: "https://www.googleapis.com/auth/spreadsheets.readonly"
    });
} 