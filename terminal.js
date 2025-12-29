// Terminal interaction logic - Menu Navigation

// Queries available to run
const QUERIES = [
    {
        sql: 'SELECT * FROM users;',
        name: 'About',
        title: 'ABOUT',
        chartType: 'user',
        displayFormat: 'vertical'
    },
    {
        sql: 'SELECT * FROM experience WHERE user_id = 1 ORDER BY start_date DESC;',
        name: 'Experience',
        title: 'EXPERIENCE',
        chartType: 'experience',
        actualSql: 'SELECT company, role, start_date, end_date FROM experience WHERE user_id = 1 ORDER BY start_date DESC;',
        displayFormat: 'table'
    },
    {
        sql: 'SELECT * FROM education WHERE user_id = 1;',
        name: 'Education',
        title: 'EDUCATION',
        chartType: 'education',
        actualSql: 'SELECT school, degree, year FROM education WHERE user_id = 1;',
        displayFormat: 'table'
    },
    {
        sql: 'SELECT * FROM projects WHERE user_id = 1;',
        name: 'Projects',
        title: 'PROJECTS',
        chartType: null,
        actualSql: 'SELECT name, description, url FROM projects WHERE user_id = 1;',
        displayFormat: 'table'
    },
    {
        sql: 'SELECT * FROM skills WHERE user_id = 1;',
        name: 'Skills',
        title: 'SKILLS',
        chartType: null,
        actualSql: 'SELECT name FROM skills WHERE user_id = 1;',
        displayFormat: 'table'
    },
    {
        sql: 'SELECT * FROM social_links WHERE user_id = 1;',
        name: 'Connect',
        title: 'CONNECT',
        chartType: null,
        actualSql: 'SELECT platform, url FROM social_links WHERE user_id = 1;',
        displayFormat: 'table'
    }
];

let selectedIndex = 0;
let dbReady = false;
let currentChart = null;

// DOM elements
const queryList = document.getElementById('query-list');
const resultsPlaceholder = document.getElementById('results-placeholder');
const resultsContent = document.getElementById('results-content');
const chartCanvas = document.getElementById('main-chart');

// Initialize
async function init() {
    renderQueryList();
    showLoading();
    try {
        await initDatabase();
        dbReady = true;
        hideLoading();
        updateSelection();
    } catch (error) {
        showError('Failed to initialize database: ' + error.message);
    }
}

function showLoading() {
    resultsPlaceholder.innerHTML = '<span class="loading">Initializing database...</span>';
}

function hideLoading() {
    resultsPlaceholder.innerHTML = '<span class="comment">-- Select a query and press Enter</span>';
}

function showError(message) {
    resultsPlaceholder.innerHTML = `<span style="color: #ff6b6b;">${message}</span>`;
}

// Render the query list
function renderQueryList() {
    queryList.innerHTML = '';
    QUERIES.forEach((query, index) => {
        const item = document.createElement('div');
        item.className = 'query-item';
        item.dataset.index = index;
        item.innerHTML = `
            <div class="query-main">
                <span class="query-number">${index + 1}.</span>
                <span class="query-name">${query.name}</span>
            </div>
            <div class="query-sql">${query.sql}</div>
        `;
        item.addEventListener('click', () => {
            selectedIndex = index;
            updateSelection();
            executeQuery();
        });
        queryList.appendChild(item);
    });
}

// Update visual selection
function updateSelection() {
    const items = queryList.querySelectorAll('.query-item');
    items.forEach((item, index) => {
        item.classList.toggle('selected', index === selectedIndex);
    });

    // Scroll selected into view
    items[selectedIndex]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

// Execute the selected query
function executeQuery() {
    if (!dbReady) return;

    const query = QUERIES[selectedIndex];
    const sqlToRun = query.actualSql || query.sql;
    const results = executeQuerySQL(sqlToRun);

    // Hide placeholder, show results
    resultsPlaceholder.style.display = 'none';
    resultsContent.classList.add('active');

    // Clear and add new results
    resultsContent.innerHTML = '';

    if (results.error) {
        resultsContent.innerHTML = `<div style="color: #ff6b6b;">Error: ${results.error}</div>`;
    } else {
        const table = formatResults(results, query.title, query.displayFormat);
        resultsContent.appendChild(table);
    }

    // Update chart
    updateChart(query.chartType);
}

// Execute SQL (renamed to avoid conflict with db.js)
function executeQuerySQL(sql) {
    try {
        const results = db.exec(sql);
        if (results.length === 0) {
            return { columns: [], values: [] };
        }
        return {
            columns: results[0].columns,
            values: results[0].values
        };
    } catch (error) {
        return { error: error.message };
    }
}

// Format query results
function formatResults(results, title, displayFormat) {
    const container = document.createElement('div');
    container.className = 'results-table';

    // Add title
    const titleEl = document.createElement('div');
    titleEl.className = 'results-table-title';
    titleEl.textContent = title;
    container.appendChild(titleEl);

    if (results.values.length === 0) {
        container.innerHTML += '<div class="comment">(no results)</div>';
        return container;
    }

    const columns = results.columns;
    const values = results.values;

    if (displayFormat === 'table') {
        // Traditional table format
        const table = document.createElement('table');
        table.className = 'sql-table';

        // Header row
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Data rows
        const tbody = document.createElement('tbody');
        values.forEach((row, rowIndex) => {
            const tr = document.createElement('tr');
            tr.style.animationDelay = `${rowIndex * 0.03}s`;
            row.forEach(cell => {
                const td = document.createElement('td');
                const cellStr = String(cell || '');
                if (cellStr.startsWith('http')) {
                    td.innerHTML = `<a href="${cellStr}" target="_blank" rel="noopener">${cellStr}</a>`;
                } else {
                    td.textContent = cellStr;
                }
                td.appendChild(document.createTextNode(''));
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        container.appendChild(table);
    } else {
        // Vertical key-value format (for About/single record)
        values.forEach((row, rowIndex) => {
            const recordEl = document.createElement('div');
            recordEl.className = 'result-record';
            recordEl.style.animationDelay = `${rowIndex * 0.05}s`;

            row.forEach((cell, colIndex) => {
                const rowEl = document.createElement('div');
                rowEl.className = 'result-row';

                const keyEl = document.createElement('span');
                keyEl.className = 'result-key';
                keyEl.textContent = columns[colIndex];

                const valueEl = document.createElement('span');
                valueEl.className = 'result-value';

                const cellStr = String(cell || '');

                // Make URLs clickable
                if (cellStr.startsWith('http')) {
                    valueEl.innerHTML = `<a href="${cellStr}" target="_blank" rel="noopener">${cellStr}</a>`;
                } else {
                    valueEl.textContent = cellStr;
                }

                rowEl.appendChild(keyEl);
                rowEl.appendChild(valueEl);
                recordEl.appendChild(rowEl);
            });

            container.appendChild(recordEl);
        });
    }

    // Row count
    const count = document.createElement('div');
    count.className = 'row-count';
    count.textContent = `${values.length} record${values.length !== 1 ? 's' : ''}`;
    container.appendChild(count);

    return container;
}

// Update chart based on query type
function updateChart(chartType) {
    // Destroy existing chart
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }

    // Hide custom containers if they exist
    const logosContainer = document.getElementById('education-logos');
    if (logosContainer) {
        logosContainer.style.display = 'none';
    }
    const userPhotoContainer = document.getElementById('user-photo');
    if (userPhotoContainer) {
        userPhotoContainer.style.display = 'none';
    }

    if (!chartType) {
        chartCanvas.style.display = 'none';
        return;
    }

    chartCanvas.style.display = 'block';
    const ctx = chartCanvas.getContext('2d');

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                grid: { color: '#e9ecef' },
                ticks: {
                    color: '#6c757d',
                    font: { family: "'JetBrains Mono', monospace", size: 10 }
                }
            },
            y: {
                grid: { color: '#e9ecef' },
                ticks: {
                    color: '#6c757d',
                    font: { family: "'JetBrains Mono', monospace", size: 10 }
                },
                beginAtZero: true
            }
        }
    };

    if (chartType === 'skills') {
        const skillsData = PORTFOLIO_DATA.skills;
        currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: skillsData.map(s => s.name),
                datasets: [{
                    data: skillsData.map(s => s.proficiency),
                    backgroundColor: '#0d2240',
                    borderRadius: 4
                }]
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    y: { ...chartOptions.scales.y, max: 5 }
                }
            }
        });
    } else if (chartType === 'experience') {
        // Company colors
        const companyColors = {
            'S&P Global': '#cc0000',
            'ClassPass': '#00b4d8',
            'Winter Advisory': '#4a90a4',
            'Immeasurable': '#7b2cbf',
            'Kahani': '#e85d04',
            'Bantee': '#2d6a4f',
            'True Classic': '#0d2240'
        };

        // Build timeline data
        const minYear = 2015;
        const maxYear = new Date().getFullYear() + 1;

        // Parse experience data with decimal dates, combining same company entries
        const experiencesByCompany = {};
        PORTFOLIO_DATA.experience.forEach(e => {
            const start = new Date(e.start_date);
            const end = e.end_date === 'Present' ? new Date() : new Date(e.end_date);
            const startDecimal = start.getFullYear() + (start.getMonth() / 12);
            const endDecimal = end.getFullYear() + (end.getMonth() / 12);

            if (experiencesByCompany[e.company]) {
                // Extend existing entry to cover full range
                experiencesByCompany[e.company].startDecimal = Math.min(experiencesByCompany[e.company].startDecimal, startDecimal);
                experiencesByCompany[e.company].endDecimal = Math.max(experiencesByCompany[e.company].endDecimal, endDecimal);
            } else {
                experiencesByCompany[e.company] = {
                    company: e.company,
                    startDecimal,
                    endDecimal
                };
            }
        });
        const experiences = Object.values(experiencesByCompany).sort((a, b) => a.startDecimal - b.startDecimal);

        // Check for overlaps and assign rows only when needed
        const rows = [[]];
        experiences.forEach(exp => {
            let assignedRow = -1;
            // Try to fit in existing rows
            for (let i = 0; i < rows.length; i++) {
                const hasOverlap = rows[i].some(existing =>
                    !(exp.startDecimal >= existing.endDecimal || exp.endDecimal <= existing.startDecimal)
                );
                if (!hasOverlap) {
                    assignedRow = i;
                    break;
                }
            }
            // Need a new row if overlaps with all existing rows
            if (assignedRow === -1) {
                assignedRow = rows.length;
                rows.push([]);
            }
            exp.row = assignedRow;
            rows[assignedRow].push(exp);
        });

        // Create row labels
        const rowLabels = rows.map((_, i) => '');

        // Create datasets for each company
        const datasets = experiences.map(exp => {
            // Create data array with null for other rows
            const data = rowLabels.map((_, i) =>
                i === exp.row ? [exp.startDecimal, exp.endDecimal] : null
            );

            return {
                label: exp.company,
                data: data,
                backgroundColor: companyColors[exp.company] || '#6c757d',
                borderRadius: 4,
                barThickness: rows.length > 1 ? 16 : 24,
                skipNull: true
            };
        });

        currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: rowLabels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: '#6c757d',
                            font: { family: "'JetBrains Mono', monospace", size: 9 },
                            boxWidth: 12,
                            padding: 8,
                            sort: (a, b) => {
                                // Already sorted by start date in datasets array
                                return a.datasetIndex - b.datasetIndex;
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const data = context.raw;
                                if (!data) return '';
                                const startYear = Math.floor(data[0]);
                                const startMonth = Math.round((data[0] - startYear) * 12) + 1;
                                const endYear = Math.floor(data[1]);
                                const endMonth = Math.round((data[1] - endYear) * 12) + 1;
                                return `${context.dataset.label}: ${startMonth}/${startYear} - ${endMonth}/${endYear}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        min: minYear,
                        max: maxYear,
                        grid: { color: '#e9ecef' },
                        ticks: {
                            color: '#6c757d',
                            font: { family: "'JetBrains Mono', monospace", size: 10 },
                            stepSize: 1,
                            callback: function(value) {
                                return value.toString();
                            }
                        }
                    },
                    y: {
                        stacked: true,
                        display: false
                    }
                },
                barPercentage: 0.9,
                categoryPercentage: 0.9
            }
        });
    } else if (chartType === 'user') {
        // Display user photo
        chartCanvas.style.display = 'none';
        const chartArea = document.getElementById('chart-area');

        let userPhotoContainer = document.getElementById('user-photo');
        if (!userPhotoContainer) {
            userPhotoContainer = document.createElement('div');
            userPhotoContainer.id = 'user-photo';
            userPhotoContainer.style.cssText = 'display: flex; justify-content: center; align-items: center; height: 100%;';
            chartArea.appendChild(userPhotoContainer);
        }
        userPhotoContainer.style.display = 'flex';
        userPhotoContainer.innerHTML = '';

        const img = document.createElement('img');
        img.src = 'andrew.jpeg';
        img.alt = 'Andrew Winter';
        img.style.cssText = 'height: 100%; max-height: 180px; width: auto; object-fit: contain; border-radius: 8px;';
        userPhotoContainer.appendChild(img);
    } else if (chartType === 'education') {
        // Display education logos instead of a chart
        chartCanvas.style.display = 'none';
        const chartArea = document.getElementById('chart-area');

        // Create logos container
        let logosContainer = document.getElementById('education-logos');
        if (!logosContainer) {
            logosContainer = document.createElement('div');
            logosContainer.id = 'education-logos';
            logosContainer.style.cssText = 'display: flex; justify-content: center; align-items: center; gap: 3rem; height: 100%;';
            chartArea.appendChild(logosContainer);
        }
        logosContainer.style.display = 'flex';
        logosContainer.innerHTML = '';

        PORTFOLIO_DATA.education.forEach(edu => {
            const logoWrapper = document.createElement('div');
            logoWrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 0.5rem;';

            const img = document.createElement('img');
            img.src = edu.logo;
            img.alt = edu.school;
            img.style.cssText = 'height: 80px; width: auto; object-fit: contain;';

            const label = document.createElement('span');
            label.textContent = edu.year;
            label.style.cssText = 'font-size: 0.75rem; color: #6c757d; font-family: var(--font-mono);';

            logoWrapper.appendChild(img);
            logoWrapper.appendChild(label);
            logosContainer.appendChild(logoWrapper);
        });
    }
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(0, selectedIndex - 1);
        updateSelection();
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(QUERIES.length - 1, selectedIndex + 1);
        updateSelection();
    } else if (e.key === 'Enter') {
        e.preventDefault();
        executeQuery();
    }
});

// Start
init();
