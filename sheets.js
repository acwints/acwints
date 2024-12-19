// Google Sheets API configuration
const SPREADSHEET_ID = '1d2ylNdZf_4c34s96DERxkrGkQdI4rXPfcOAlhFzk-fw';
const RANGE = 'A:K';  // Columns A through K to get all relevant data

async function loadSheetData() {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: RANGE,
        });

        const values = response.result.values;
        if (!values) {
            console.error('No data found.');
            return;
        }

        // Process the data
        const processedData = processSheetData(values);
        updateCharts(processedData);
    } catch (err) {
        console.error('Error loading sheet data:', err);
    }
}

function processSheetData(values) {
    // Skip header row and process data
    const rawData = values.slice(1).map(row => ({
        date: new Date(row[0]),
        weight: parseFloat(row[6].replace('lbs', '').trim()) || null,  // Remove 'lbs' and parse
        bodyfat: parseFloat(row[7].replace('%', '').trim()) || null,   // Remove '%' and parse
        running: parseFloat(row[8]) || 0,
        biking: parseFloat(row[9]) || 0
    }))
    // Filter for 2024 data only
    .filter(entry => entry.date.getFullYear() === 2024);

    // Group data by month
    const monthlyData = {};
    
    rawData.forEach(entry => {
        const monthKey = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
                date: new Date(entry.date.getFullYear(), entry.date.getMonth(), 1),
                weight: [],
                bodyfat: [],
                running: 0,
                biking: 0,
                count: 0
            };
        }
        
        // Collect weight and bodyfat for averaging (only if they're valid numbers)
        if (entry.weight !== null) {
            console.log('Weight entry:', entry.weight); // Debug log
            monthlyData[monthKey].weight.push(entry.weight);
        }
        if (entry.bodyfat !== null) {
            console.log('Bodyfat entry:', entry.bodyfat); // Debug log
            monthlyData[monthKey].bodyfat.push(entry.bodyfat);
        }
        
        // Sum up activities
        monthlyData[monthKey].running += entry.running;
        monthlyData[monthKey].biking += entry.biking;
        monthlyData[monthKey].count++;
    });

    // Convert to arrays and calculate averages
    const sortedMonths = Object.keys(monthlyData).sort();
    
    // Debug log for monthly averages
    sortedMonths.forEach(month => {
        const weightAvg = monthlyData[month].weight.length > 0 ?
            monthlyData[month].weight.reduce((a, b) => a + b, 0) / monthlyData[month].weight.length :
            null;
        console.log(`${month} weight average:`, weightAvg);
    });

    return {
        dates: sortedMonths.map(month => monthlyData[month].date),
        weight: sortedMonths.map(month => {
            const weights = monthlyData[month].weight;
            return weights.length > 0 ? 
                (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1) : 
                null;
        }),
        bodyfat: sortedMonths.map(month => {
            const bodyfats = monthlyData[month].bodyfat;
            return bodyfats.length > 0 ? 
                (bodyfats.reduce((a, b) => a + b, 0) / bodyfats.length).toFixed(1) : 
                null;
        }),
        running: sortedMonths.map(month => monthlyData[month].running.toFixed(1)),
        biking: sortedMonths.map(month => monthlyData[month].biking.toFixed(1))
    };
}

function initGoogleApi() {
    gapi.client.init({
        apiKey: 'AIzaSyAy74FfnNLEs2Yf6xVsmcYWkYEZG93GY6Q',
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(loadSheetData);
}

// Load the Google API client
function loadGoogleApi() {
    gapi.load('client', initGoogleApi);
} 