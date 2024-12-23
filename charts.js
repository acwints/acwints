let weightChart, runningChart, bikingChart;

// Register the datalabels plugin
Chart.register(ChartDataLabels);

// Common chart options
const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: 'index',
        intersect: false,
    },
    animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
    },
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
                size: 14,
                weight: '600',
                family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            },
            bodyFont: {
                size: 13,
                weight: '500',
                family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            },
            bodySpacing: 8,
            usePointStyle: true,
            filter: function(tooltipItem) {
                return !tooltipItem.dataset.label.includes('Goal');
            },
            callbacks: {
                afterTitle: function(context) {
                    const dataIndex = context[0].dataIndex;
                    const locations = window.chartLocations ? window.chartLocations[dataIndex] : '';
                    return locations ? `📍 ${locations}` : '';
                },
                label: function(context) {
                    let label = context.dataset.label || '';
                    if (context.parsed.y !== null) {
                        label = context.parsed.y;
                        if (context.dataset.label.includes('Miles')) {
                            label += ' mi';
                        } else if (context.dataset.label.includes('Weight')) {
                            label += ' lbs';
                        } else if (context.dataset.label.includes('Body Fat')) {
                            label += '%';
                        }
                    }
                    return label;
                }
            }
        },
        datalabels: {
            display: function (context) {
                const chartType = context.chart.canvas.id;
                if (chartType === 'weightChart') {
                    return false;
                }
                return (
                    (context.datasetIndex === 1 &&
                        context.dataIndex === context.dataset.data.length - 1 &&
                        context.dataset.data[context.dataIndex] !== null) ||
                    (context.datasetIndex === 2 && context.dataIndex === 2)
                );
            },
            align: function (context) {
                return context.datasetIndex === 2 ? 'start' : 'left';
            },
            anchor: function (context) {
                return context.datasetIndex === 2 ? 'end' : 'end';
            },
            offset: function (context) {
                return context.datasetIndex === 2 ? 0 : 0;
            },
            color: function (context) {
                return context.datasetIndex === 2 ? '#000000' : 'rgba(255, 255, 255, 0.9)';
            },
            font: {
                size: 13,
                weight: '600',
                family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            },
            formatter: function (value, context) {
                if (context.datasetIndex === 2) {
                    return "'24 Goal: " + value;
                }
                return value + ' ';
            },
        }
    }
}

// Common axis font configuration
const commonAxisConfig = {
    font: {
        size: 12,
        weight: '500',
        family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },
    color: '#000000'
};

// Common time axis configuration
const commonTimeAxis = {
    type: 'time',
    time: {
        unit: 'month',
        displayFormats: {
            month: 'MMM'
        }
    },
    grid: {
        display: false
    },
    ticks: {
        ...commonAxisConfig,
        maxRotation: 0,
        autoSkip: false,
        padding: 8
    }
};

function createCharts() {
    // Weight and Body Fat Chart (dual axis)
    const weightCtx = document.getElementById('weightChart').getContext('2d');
    weightChart = new Chart(weightCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Weight',
                    data: [],
                    borderColor: 'rgb(220, 38, 38)',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderWidth: 2.5,
                    fill: true,
                    yAxisID: 'y-weight',
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 5
                },
                {
                    label: 'Body Fat',
                    data: [],
                    borderColor: 'rgb(255, 206, 0)',
                    backgroundColor: 'rgba(255, 206, 0, 0.1)',
                    borderWidth: 2.5,
                    fill: true,
                    yAxisID: 'y-bodyfat',
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }
            ]
        },
        options: {
            ...commonOptions,
            scales: {
                x: commonTimeAxis,
                'y-weight': {
                    type: 'linear',
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Weight (lbs)',
                        ...commonAxisConfig
                    },
                    grid: {
                        color: 'rgba(75, 192, 192, 0.1)'
                    },
                    ticks: {
                        ...commonAxisConfig,
                        callback: value => `${value} lbs`
                    },
                    min: 165,
                    max: 175
                },
                'y-bodyfat': {
                    type: 'linear',
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Body Fat %',
                        ...commonAxisConfig
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        ...commonAxisConfig,
                        callback: value => `${value}%`
                    },
                    min: 10,
                    max: 14
                }
            }
        }
    });

    // Running/Walking Chart
    const runningCtx = document.getElementById('runningChart').getContext('2d');
    const runningGoalLine = Array(12).fill(500);
    runningChart = new Chart(runningCtx, {
        type: 'bar',
        data: {
            labels: Array.from({length: 12}, (_, i) => new Date(2024, i, 1)),
            datasets: [
                {
                    label: 'Monthly Miles',
                    data: Array(12).fill(null),
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    borderRadius: 6,
                    borderSkipped: false,
                    hoverBackgroundColor: 'rgb(255, 255, 255)',
                    order: 2
                },
                {
                    label: 'Cumulative Miles',
                    data: Array(12).fill(null),
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 2.5,
                    type: 'line',
                    yAxisID: 'y-cumulative',
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    fill: true,
                    order: 1
                },
                {
                    label: 'Annual Goal (500 mi)',
                    data: runningGoalLine,
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderDash: [4, 4],
                    type: 'line',
                    yAxisID: 'y-cumulative',
                    pointRadius: 0,
                    fill: false,
                    order: 0
                }
            ]
        },
        options: {
            ...commonOptions,
            scales: {
                x: commonTimeAxis,
                y: {
                    beginAtZero: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Monthly Distance (miles)',
                        padding: {
                            bottom: 10
                        },
                        ...commonAxisConfig
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        ...commonAxisConfig,
                        callback: value => `${value} mi`,
                        maxTicksLimit: 6,
                        stepSize: 20,
                        padding: 8
                    },
                    suggestedMax: 120
                },
                'y-cumulative': {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: false
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        display: false
                    },
                    max: 700
                }
            }
        }
    });

    // Biking Chart
    const bikingCtx = document.getElementById('bikingChart').getContext('2d');
    const bikingGoalLine = Array(12).fill(1000);
    bikingChart = new Chart(bikingCtx, {
        type: 'bar',
        data: {
            labels: Array.from({length: 12}, (_, i) => new Date(2024, i, 1)),
            datasets: [
                {
                    label: 'Monthly Miles',
                    data: Array(12).fill(null),
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    borderRadius: 6,
                    borderSkipped: false,
                    hoverBackgroundColor: 'rgb(255, 255, 255)',
                    order: 2
                },
                {
                    label: 'Cumulative Miles',
                    data: Array(12).fill(null),
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 2.5,
                    type: 'line',
                    yAxisID: 'y-cumulative',
                    tension: 0.3,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    fill: true,
                    order: 1
                },
                {
                    label: 'Annual Goal (1000 mi)',
                    data: bikingGoalLine,
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                    borderDash: [4, 4],
                    type: 'line',
                    yAxisID: 'y-cumulative',
                    pointRadius: 0,
                    fill: false,
                    order: 0
                }
            ]
        },
        options: {
            ...commonOptions,
            scales: {
                x: commonTimeAxis,
                y: {
                    beginAtZero: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Monthly Distance (miles)',
                        padding: {
                            bottom: 10
                        },
                        ...commonAxisConfig
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        ...commonAxisConfig,
                        callback: value => `${value} mi`,
                        maxTicksLimit: 6,
                        stepSize: 50,
                        padding: 8
                    },
                    suggestedMax: 350
                },
                'y-cumulative': {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: false
                    },
                    grid: {
                        display: false
                    },
                    ticks: {
                        display: false
                    },
                    max: 1400
                }
            }
        }
    });
}

function createLocationCalendar() {
    const calendar = document.getElementById('locationCalendar');
    if (!calendar) {
        return;
    }

    // Clear existing content
    calendar.innerHTML = '';

    // Create weekday column
    const weekdayColumn = document.createElement('div');
    weekdayColumn.className = 'weekday-column';
    
    // Add weekday labels starting with Monday
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    weekdays.forEach(day => {
        const dayLabel = document.createElement('div');
        dayLabel.className = 'calendar-weekday';
        dayLabel.textContent = day;
        weekdayColumn.appendChild(dayLabel);
    });
    calendar.appendChild(weekdayColumn);

    // Create main calendar section
    const calendarMain = document.createElement('div');
    calendarMain.className = 'calendar-main';

    // Create month row
    const monthRow = document.createElement('div');
    monthRow.className = 'month-row';

    // Calculate the exact number of weeks needed
    const startDate = new Date(2024, 0, 1);
    const endDate = new Date(2024, 11, 31);

    // Create array to hold month positions
    const monthPositions = [];
    
    // Calculate the position and span for each month
    for (let month = 0; month < 12; month++) {
        const firstOfMonth = new Date(2024, month, 1);
        // Calculate which week column this month starts in
        const weekOffset = Math.floor((firstOfMonth.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        
        // Calculate the number of weeks this month spans
        const lastOfMonth = new Date(2024, month + 1, 0);
        const weekEnd = Math.floor((lastOfMonth.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
        const weekSpan = weekEnd - weekOffset + 1;

        monthPositions.push({
            name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month],
            start: weekOffset,
            span: weekSpan
        });
    }

    // Create all week columns for the month row (53 total)
    for (let week = 0; week < 53; week++) {
        const monthLabel = document.createElement('div');
        monthLabel.className = 'month-label';
        
        // Find which month this week belongs to
        const month = monthPositions.find(m => week >= m.start && week < (m.start + m.span));
        if (month) {
            // Only show the month name in the middle week of its span
            const monthMiddle = month.start + Math.floor(month.span / 2);
            if (week === monthMiddle) {
                monthLabel.textContent = month.name;
            }
        }
        
        monthRow.appendChild(monthLabel);
    }
    calendarMain.appendChild(monthRow);

    // Create days grid
    const daysGrid = document.createElement('div');
    daysGrid.className = 'days-grid';

    // Create the full grid of boxes
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 53; col++) {
            const dayBox = document.createElement('div');
            dayBox.className = 'calendar-day';
            
            // Calculate the date for this position
            const dayOfWeek = row;
            const currentDate = new Date(startDate);
            const daysToAdd = (col * 7) + ((dayOfWeek - (startDate.getDay() - 1) + 7) % 7);
            currentDate.setDate(currentDate.getDate() + daysToAdd);

            // Only add date information if it's within the year
            if (currentDate >= startDate && currentDate <= endDate) {
                dayBox.dataset.date = currentDate.toISOString().split('T')[0];
            } else {
                dayBox.classList.add('spacer');
            }

            daysGrid.appendChild(dayBox);
        }
    }

    calendarMain.appendChild(daysGrid);
    calendar.appendChild(calendarMain);
}

function getLocationDisplay(location) {
    // Convert to lowercase for case-insensitive matching
    const lowercaseLocation = location.toLowerCase();
    
    // Location mapping
    const locationMap = {
        'san francisco, ca': { text: '', background: '🌁', backgroundColor: '#FFFACD' }, // light yellow
        'new york, ny': { text: '', background: '🗽', backgroundColor: '#FFE4E1' },     // light red
        'avon, co': { text: '', background: '🏔️', backgroundColor: '#FFE4B5' },        // light orange
        'berkeley, ca': { text: '', background: '🐻', backgroundColor: '#E6F3FF' },     // light blue
        'aspen, co': { text: '', background: '❄️', backgroundColor: '#E6F3FF' },
        'darien, ct': { text: '', background: '🌊', backgroundColor: '#E6F3FF' },
        'stamford, ct': { text: '', background: '🌊', backgroundColor: '#E6F3FF' },
        'portland, me': { text: '', background: '🦞', backgroundColor: '#E6F3FF' },
        'st. louis, mo': { text: '', background: '🎢', backgroundColor: '#E6F3FF' },
        'raleigh, nc': { text: '', background: '🦋', backgroundColor: '#E6F3FF' },
        'austin, tx': { text: '', background: '🤠', backgroundColor: '#E6F3FF' },
        'st. george, ut': { text: '', background: '🏜️', backgroundColor: '#E6F3FF' },
        'san diego, ca': { text: '', background: '🏖️', backgroundColor: '#E6F3FF' },
        'seattle, wa': { text: '', background: '🛸', backgroundColor: '#E6F3FF' },
        'olympic peninsula, wa': { text: '', background: '🚴‍♂️', backgroundColor: '#E6F3FF' },
    };

    return locationMap[lowercaseLocation] || { text: '', background: '✈️' };
}

function updateLocationCalendar(dailyLocations) {
    const calendar = document.getElementById('locationCalendar');
    if (!calendar) {
        return;
    }

    // Remove existing tooltips first
    calendar.querySelectorAll('.calendar-tooltip').forEach(tooltip => tooltip.remove());

    // Update each day box with location data
    const dayBoxes = calendar.querySelectorAll('.calendar-day:not(.spacer)');
    
    dayBoxes.forEach(box => {
        const date = box.dataset.date;
        const location = dailyLocations[date];
        
        if (location) {
            box.classList.add('has-location');
            
            // Remove any existing tooltip and location text
            box.querySelector('.calendar-tooltip')?.remove();
            box.querySelector('.location-text')?.remove();
            
            // Get the display version of the location
            const displayLocation = getLocationDisplay(location);
            
            // Format the date
            const tooltipDate = new Date(date + 'T00:00:00');
            const formattedDate = tooltipDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'UTC'
            });

            // Add tooltip with full location and date
            const tooltip = document.createElement('div');
            tooltip.className = 'calendar-tooltip';
            tooltip.textContent = `${formattedDate} • ${location}`;
            box.appendChild(tooltip);

            // Add abbreviated location text
            const locationText = document.createElement('div');
            locationText.className = 'location-text';
            locationText.textContent = displayLocation.text;
            box.appendChild(locationText);

            // Set the background emoji
            if (displayLocation.background) {
                box.style.backgroundImage = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="65%" x="50%" dominant-baseline="middle" text-anchor="middle" font-size="100">${displayLocation.background}</text></svg>')`;
                box.style.backgroundPosition = 'center';
                box.style.backgroundSize = 'contain';
                box.style.backgroundRepeat = 'no-repeat';
                box.style.border = '1px solid rgba(0, 0, 0, 0.1)';
                // Apply background color if specified
                if (displayLocation.backgroundColor) {
                    box.style.backgroundColor = displayLocation.backgroundColor;
                }
            }
        } else {
            box.classList.remove('has-location');
            box.querySelector('.calendar-tooltip')?.remove();
            box.querySelector('.location-text')?.remove();
            box.style.backgroundImage = '';
            box.style.backgroundColor = '';
            box.style.border = '1px solid rgba(0, 0, 0, 0.5)';
        }
    });
}

function updateCharts(data) {
    // Store locations globally for tooltip access
    window.chartLocations = data.locations;

    // Update location calendar
    updateLocationCalendar(data.dailyLocations);

    // Use the actual Date objects for the x-axis
    const dates = data.dates;

    // Calculate cumulative totals
    const runningCumulative = [];
    const bikingCumulative = [];
    let runningTotal = 0;
    let bikingTotal = 0;

    data.running.forEach(miles => {
        runningTotal += (miles || 0);
        runningCumulative.push(runningTotal);
    });

    data.biking.forEach(miles => {
        bikingTotal += (miles || 0);
        bikingCumulative.push(bikingTotal);
    });

    // Calculate the max y-axis values with 10% padding
    const runningMax = Math.max(
        runningTotal * 1.1,
        500 // minimum to always show goal line
    );
    const bikingMax = Math.max(
        bikingTotal * 1.1,
        1000 // minimum to always show goal line
    );

    // Update Weight and Body Fat Chart
    weightChart.data.labels = dates;
    weightChart.data.datasets[0].data = data.weight;
    weightChart.data.datasets[1].data = data.bodyfat;
    weightChart.update('none');

    // Update Running Chart
    runningChart.data.labels = dates;
    runningChart.data.datasets[0].data = data.running;
    runningChart.data.datasets[1].data = runningCumulative;
    runningChart.options.scales['y-cumulative'].max = runningMax;
    runningChart.update('none');

    // Update Biking Chart
    bikingChart.data.labels = dates;
    bikingChart.data.datasets[0].data = data.biking;
    bikingChart.data.datasets[1].data = bikingCumulative;
    bikingChart.options.scales['y-cumulative'].max = bikingMax;
    bikingChart.update('none');
}

// Create charts when the page loads
document.addEventListener('DOMContentLoaded', () => {
    createCharts();
    createLocationCalendar();
}); 