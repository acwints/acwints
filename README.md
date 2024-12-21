# ACW Integrations

A web application for tracking and visualizing fitness data using Google Sheets integration.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Google Sheets API:
   - Go to Google Cloud Console
   - Create a new project
   - Enable Google Sheets API
   - Create credentials (API key and OAuth 2.0 Client ID)
   - Copy `secrets.template.js` to `secrets.js`
   - Add your API credentials to `secrets.js`

3. Run the application:
   ```bash
   npm run serve
   ```

4. Open http://localhost:8080 in your browser

## Building

To build the application:
```bash
npm run build
```

## Development

The application uses:
- Chart.js for data visualization
- Google Sheets API for data storage
- Simple HTTP server for local development
