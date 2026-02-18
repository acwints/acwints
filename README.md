# acwints

Personal activity tracking dashboard that integrates with various platforms to visualize my fitness and health data.

## Setup

1. Clone the repository
2. **GitHub stats (optional)**:
   - By default, the workflow fetches language stats from public repos.
   - To include private repos too, create a [Personal Access Token](https://github.com/settings/tokens) with `repo` scope and add it as `GH_STATS_TOKEN` in `Settings -> Secrets -> Actions`.
   - Run the "Update GitHub stats" workflow manually (Actions tab) or wait for the daily schedule.
3. Run a local server:
   ```bash
   python3 -m http.server
   # or
   npx http-server
   ```
4. Open http://localhost:8000 in your browser

## Features

- Strava integration for running and cycling data
- Withings integration for health metrics
- GitHub contribution tracking
- Goodreads reading progress
- Spotify listening history
- Bantee golf statistics

## Deployment

The site is automatically deployed to GitHub Pages when changes are pushed to the main branch.
Visit [acwints.com](https://acwints.com) to see it live.
