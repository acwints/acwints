// Google Sheets API configuration
const SPREADSHEET_ID = '1d2ylNdZf_4c34s96DERxkrGkQdI4rXPfcOAlhFzk-fw';
const RANGE = 'A:K';  // Columns A through K to get all relevant data

async function loadSheetData() {
    try {
        console.log('Attempting to load sheet data...');
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const values = response.result.values;
        if (!values) {
            console.error('No data found in spreadsheet.');
            return;
        }

        console.log('Raw data loaded:', values.length, 'rows');
        // Process the data
        const processedData = processSheetData(values);
        console.log('Processed data:', processedData);
        updateCharts(processedData);
    } catch (err) {
        console.error('Error loading sheet data:', err);
        document.body.innerHTML += `<div style="color: red; padding: 20px;">Error loading data: ${err.message}</div>`;
    }
}

function processSheetData(values) {
    console.log('Processing sheet data...');
    try {
        // Skip header row and process data
        const rawData = values.slice(1).map(row => {
            if (!row[0]) {
                console.warn('Row missing date:', row);
                return null;
            }

            // Extract numeric values from weight and bodyfat
            const weightStr = row[5] || '';  // Column F (index 5) for Weight
            const bodyfatStr = row[6] || ''; // Column G (index 6) for Bodyfat
            
            // Parse weight - expecting format like "167 lbs"
            let weight = null;
            if (weightStr) {
                const weightMatch = weightStr.match(/(\d+(?:\.\d+)?)/);
                weight = weightMatch ? parseFloat(weightMatch[1]) : null;
            }

            // Parse body fat - expecting format like "11.7%"
            let bodyfat = null;
            if (bodyfatStr) {
                const bodyfatMatch = bodyfatStr.match(/(\d+(?:\.\d+)?)/);
                bodyfat = bodyfatMatch ? parseFloat(bodyfatMatch[1]) : null;
            }

            // Parse running and biking distances (columns I and J)
            const running = row[8] ? parseFloat(row[8]) : 0;
            const biking = row[9] ? parseFloat(row[9]) : 0;

            const entry = {
                date: new Date(row[0]),
                weight,
                bodyfat,
                running,
                biking
            };

            console.log('Parsed row:', {
                date: entry.date,
                weightStr,
                weight: entry.weight,
                bodyfatStr,
                bodyfat: entry.bodyfat
            });

            return entry;
        }).filter(entry => entry && entry.date.getFullYear() === 2024);

        console.log('Filtered 2024 data:', rawData);

        // Group data by month
        const monthlyData = {};
        
        // First, create entries for all months
        for (let month = 0; month < 12; month++) {
            const monthKey = `2024-${String(month + 1).padStart(2, '0')}`;
            monthlyData[monthKey] = {
                date: new Date(2024, month, 1),
                weight: [],
                bodyfat: [],
                running: 0,
                biking: 0
            };
        }

        // Then aggregate the data
        rawData.forEach(entry => {
            const monthKey = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, '0')}`;
            
            // For weight and body fat, only take the last value of each day
            const dayKey = entry.date.toISOString().split('T')[0];
            
            if (entry.weight !== null) {
                // Remove any previous entries from the same day
                monthlyData[monthKey].weight = monthlyData[monthKey].weight.filter(w => 
                    w.date.toISOString().split('T')[0] !== dayKey
                );
                // Add the new entry
                monthlyData[monthKey].weight.push({
                    date: entry.date,
                    value: entry.weight
                });
            }
            
            if (entry.bodyfat !== null) {
                // Remove any previous entries from the same day
                monthlyData[monthKey].bodyfat = monthlyData[monthKey].bodyfat.filter(bf => 
                    bf.date.toISOString().split('T')[0] !== dayKey
                );
                // Add the new entry
                monthlyData[monthKey].bodyfat.push({
                    date: entry.date,
                    value: entry.bodyfat
                });
            }
            
            // For activities, sum up the values
            monthlyData[monthKey].running += entry.running;
            monthlyData[monthKey].biking += entry.biking;
        });

        console.log('Monthly grouped data:', monthlyData);

        // Convert to arrays and calculate averages
        const sortedMonths = Object.keys(monthlyData).sort();
        
        const result = {
            dates: sortedMonths.map(month => monthlyData[month].date),
            weight: sortedMonths.map(month => {
                const weights = monthlyData[month].weight;
                if (weights.length === 0) return null;
                
                // Get the last weight entry for each day
                const dailyWeights = weights.map(w => w.value);
                const avgWeight = dailyWeights.reduce((a, b) => a + b, 0) / dailyWeights.length;
                return parseFloat(avgWeight.toFixed(1));
            }),
            bodyfat: sortedMonths.map(month => {
                const bodyfats = monthlyData[month].bodyfat;
                if (bodyfats.length === 0) return null;
                
                // Get the last bodyfat entry for each day
                const dailyBodyfats = bodyfats.map(bf => bf.value);
                const avgBodyfat = dailyBodyfats.reduce((a, b) => a + b, 0) / dailyBodyfats.length;
                return parseFloat(avgBodyfat.toFixed(1));
            }),
            running: sortedMonths.map(month => parseFloat(monthlyData[month].running.toFixed(1))),
            biking: sortedMonths.map(month => parseFloat(monthlyData[month].biking.toFixed(1)))
        };

        console.log('Final processed data:', result);
        return result;
    } catch (error) {
        console.error('Error processing sheet data:', error);
        throw error;
    }
}

function initGoogleApi() {
    console.log('Initializing Google API...');
    gapi.client.init({
        apiKey: 'AIzaSyAy74FfnNLEs2Yf6xVsmcYWkYEZG93GY6Q',
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(() => {
        console.log('Google API initialized successfully');
        loadSheetData();
    }).catch(error => {
        console.error('Error initializing Google API:', error);
        document.body.innerHTML += `<div style="color: red; padding: 20px;">Error initializing Google API: ${error.message}</div>`;
    });
}

// Load the Google API client
function loadGoogleApi() {
    console.log('Loading Google API...');
    gapi.load('client', initGoogleApi);
} 