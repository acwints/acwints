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
        actualSql: 'SELECT category, name FROM skills WHERE user_id = 1 ORDER BY category;',
        displayFormat: 'pivot'
    },
    {
        sql: 'SELECT * FROM code_activity WHERE user_id = 1 ORDER BY week_start DESC;',
        name: 'Code',
        title: 'CODE',
        chartType: null,
        displayFormat: 'code'
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
const chartArea = document.getElementById('chart-area');

const GITHUB_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const GITHUB_SUMMARY_CACHE_KEY = 'acwints_code_weekly_summary_v1';
const GITHUB_ONE_YEAR_WEEKS = 52;

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
async function executeQuery() {
    if (!dbReady) return;

    const query = QUERIES[selectedIndex];

    // Hide placeholder, show results
    resultsPlaceholder.style.display = 'none';
    resultsContent.classList.add('active');

    // Clear and add new results
    resultsContent.innerHTML = '';

    if (query.displayFormat === 'code') {
        updateChart(query.chartType);
        await renderCodeSection();
        return;
    }

    const sqlToRun = query.actualSql || query.sql;
    const results = executeQuerySQL(sqlToRun);

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
    } else if (displayFormat === 'pivot') {
        // Pivot table format - group by first column (category)
        const categoryIndex = 0;
        const nameIndex = 1;
        const categories = {};

        // Group values by category
        values.forEach(row => {
            const category = row[categoryIndex];
            const name = row[nameIndex];
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(name);
        });

        // Create pivot table
        const pivotContainer = document.createElement('div');
        pivotContainer.className = 'pivot-table';
        pivotContainer.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem;';

        Object.keys(categories).forEach((category, catIndex) => {
            const categoryCol = document.createElement('div');
            categoryCol.className = 'pivot-column';
            categoryCol.style.cssText = 'animation: recordFadeIn 0.3s ease-out forwards; opacity: 0;';
            categoryCol.style.animationDelay = `${catIndex * 0.05}s`;

            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'pivot-header';
            categoryHeader.style.cssText = 'font-weight: 600; color: #0d2240; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 0.75rem; border-bottom: 2px solid #0d2240; margin-bottom: 0.75rem;';
            categoryHeader.textContent = category;
            categoryCol.appendChild(categoryHeader);

            categories[category].forEach((skill, skillIndex) => {
                const skillItem = document.createElement('div');
                skillItem.className = 'pivot-item';
                skillItem.style.cssText = 'padding: 0.4rem 0; color: #0d2240; font-size: 0.85rem; border-bottom: 1px solid #e9ecef;';
                skillItem.textContent = skill;
                categoryCol.appendChild(skillItem);
            });

            pivotContainer.appendChild(categoryCol);
        });

        container.appendChild(pivotContainer);
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

function getGithubUsername() {
    const githubLink = PORTFOLIO_DATA.social_links.find(link => link.platform === 'GitHub');
    if (!githubLink) return 'acwints';
    if (githubLink.username) {
        return githubLink.username.replace(/^@/, '');
    }
    try {
        const url = new URL(githubLink.url);
        return url.pathname.replace(/\//g, '') || 'acwints';
    } catch {
        return 'acwints';
    }
}

function getLastYearDateRange() {
    const end = new Date();
    const start = new Date(end);
    start.setFullYear(end.getFullYear() - 1);
    const toISO = end.toISOString().slice(0, 10);
    const fromISO = start.toISOString().slice(0, 10);
    return { fromISO, toISO };
}

function getWeekStart(dateLike) {
    const date = new Date(dateLike);
    date.setHours(0, 0, 0, 0);
    const day = date.getDay();
    date.setDate(date.getDate() - day);
    return date;
}

function formatWeekKey(dateLike) {
    const date = getWeekStart(dateLike);
    return date.toISOString().slice(0, 10);
}

function buildWeekSkeleton(weeksCount) {
    const currentWeekStart = getWeekStart(new Date());
    const weeks = [];

    for (let offset = weeksCount - 1; offset >= 0; offset -= 1) {
        const weekStart = new Date(currentWeekStart);
        weekStart.setDate(currentWeekStart.getDate() - (offset * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weeks.push({
            key: formatWeekKey(weekStart),
            weekStart,
            weekEnd,
            commits: 0,
            additions: 0,
            deletions: 0,
            repos: []
        });
    }

    return weeks;
}

function buildWeekLabel(weekStart, weekEnd) {
    const fmtMonthDay = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
    });
    const fmtYear = new Intl.DateTimeFormat('en-US', {
        year: 'numeric'
    });
    return `${fmtMonthDay.format(weekStart)} - ${fmtMonthDay.format(weekEnd)}, ${fmtYear.format(weekEnd)}`;
}

function buildWeeklySummaryHtml(weeklySummary) {
    const rows = weeklySummary
        .slice()
        .reverse()
        .map((week) => {
            const repoText = week.repos.length > 0
                ? week.repos
                    .slice(0, 3)
                    .map(repo => `${repo.name} (${repo.commits})`)
                    .join(' · ')
                : '<span class="code-muted">No public commits</span>';
            const extraReposCount = Math.max(0, week.repos.length - 3);
            const extraReposText = extraReposCount > 0
                ? `<span class="code-extra">+${extraReposCount} more</span>`
                : '';
            return `
                <div class="code-week-row${week.commits > 0 ? ' is-active' : ''}">
                    <div class="code-week-cell week-label">${buildWeekLabel(week.weekStart, week.weekEnd)}</div>
                    <div class="code-week-cell week-commits">${week.commits}</div>
                    <div class="code-week-cell week-built">${repoText} ${extraReposText}</div>
                </div>
            `;
        })
        .join('');

    return `
        <div class="code-week-table">
            <div class="code-week-head">
                <div class="code-week-cell">Week</div>
                <div class="code-week-cell">Commits</div>
                <div class="code-week-cell">Built</div>
            </div>
            ${rows}
        </div>
    `;
}

function buildSummaryStats(weeklySummary) {
    const totalCommits = weeklySummary.reduce((sum, week) => sum + week.commits, 0);
    const activeWeeks = weeklySummary.filter(week => week.commits > 0).length;
    const touchedRepos = new Set(
        weeklySummary.flatMap(week => week.repos.map(repo => repo.name))
    ).size;
    return { totalCommits, activeWeeks, touchedRepos };
}

async function fetchGithubRepos(username, fromDateIso) {
    let page = 1;
    const repos = [];
    const cutoffTime = new Date(fromDateIso).getTime();

    while (true) {
        const response = await fetch(
            `https://api.github.com/users/${username}/repos?per_page=100&type=owner&sort=updated&page=${page}`,
            { headers: { Accept: 'application/vnd.github+json' } }
        );
        if (response.status === 403) {
            const resetHeader = response.headers.get('x-ratelimit-reset');
            const msg = resetHeader
                ? `GitHub API rate limit exceeded. Try again after ${new Date(parseInt(resetHeader, 10) * 1000).toLocaleTimeString()}.`
                : 'GitHub API rate limit exceeded (60 req/hr unauthenticated).';
            throw new Error(msg);
        }
        if (!response.ok) {
            throw new Error(`GitHub repo request failed (${response.status})`);
        }

        const pageRepos = await response.json();
        if (pageRepos.length === 0) break;

        const filtered = pageRepos.filter(repo =>
            !repo.fork &&
            !repo.archived &&
            new Date(repo.pushed_at).getTime() >= cutoffTime
        );
        repos.push(...filtered);

        if (pageRepos.length < 100) break;
        page += 1;
    }

    return repos;
}

async function fetchRepoContributorStats(owner, repo, maxRetries = 5) {
    const url = `https://api.github.com/repos/${owner}/${repo}/stats/contributors`;

    for (let attempt = 0; attempt < maxRetries; attempt += 1) {
        const response = await fetch(url, {
            headers: { Accept: 'application/vnd.github+json' }
        });

        if (response.status === 202) {
            await new Promise(resolve => setTimeout(resolve, 800 * (attempt + 1)));
            continue;
        }

        if (response.status === 204) return [];

        if (response.status === 403) {
            throw new Error('GitHub API rate limit exceeded. Summary will show after limit resets.');
        }
        if (!response.ok) {
            throw new Error(`GitHub stats request failed for ${repo} (${response.status})`);
        }

        return response.json();
    }

    return [];
}

function readSummaryCache(cacheKey) {
    try {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed.savedAt || !Array.isArray(parsed.summary)) return null;
        if (Date.now() - parsed.savedAt > GITHUB_CACHE_TTL_MS) return null;
        return parsed.summary;
    } catch {
        return null;
    }
}

function writeSummaryCache(cacheKey, summary) {
    try {
        localStorage.setItem(cacheKey, JSON.stringify({
            savedAt: Date.now(),
            summary
        }));
    } catch {
        // No-op if storage is unavailable.
    }
}

async function getWeeklyBuildSummary(username) {
    const cacheKey = `${GITHUB_SUMMARY_CACHE_KEY}_${username}`;
    const cached = readSummaryCache(cacheKey);
    if (cached) {
        return cached.map(week => ({
            ...week,
            weekStart: new Date(week.weekStart),
            weekEnd: new Date(week.weekEnd)
        }));
    }

    const { fromISO } = getLastYearDateRange();
    const weeklySummary = buildWeekSkeleton(GITHUB_ONE_YEAR_WEEKS);
    const summaryByWeek = new Map(weeklySummary.map(week => [week.key, week]));

    const repos = await fetchGithubRepos(username, fromISO);
    // Limit repos to stay under GitHub's 60 req/hr unauthenticated limit (1 repo list + N stats calls)
    const MAX_REPOS_FOR_STATS = 15;
    const reposToQuery = repos.slice(0, MAX_REPOS_FOR_STATS);
    for (const repo of reposToQuery) {
        let contributors = [];
        try {
            contributors = await fetchRepoContributorStats(username, repo.name);
        } catch {
            continue;
        }
        const myStats = contributors.find(
            contributor => contributor.author && contributor.author.login === username
        );
        if (!myStats || !Array.isArray(myStats.weeks)) continue;

        myStats.weeks.forEach((week) => {
            if (!week.c) return;
            const weekStartDate = new Date(week.w * 1000);
            if (weekStartDate < new Date(fromISO)) return;

            const key = formatWeekKey(weekStartDate);
            const current = summaryByWeek.get(key);
            if (!current) return;

            current.commits += week.c;
            current.additions += week.a;
            current.deletions += week.d;
            current.repos.push({
                name: repo.name,
                commits: week.c,
                additions: week.a,
                deletions: week.d
            });
        });
    }

    weeklySummary.forEach((week) => {
        week.repos.sort((a, b) => b.commits - a.commits);
    });

    writeSummaryCache(cacheKey, weeklySummary);
    return weeklySummary;
}

async function renderCodeSection() {
    const username = getGithubUsername();
    const githubUrl = `https://github.com/${username}`;
    const { fromISO, toISO } = getLastYearDateRange();
    // GitHub's /contributions URL returns HTML, not an image. Use ghchart.rshah.org for embeddable SVG.
    const contributionGraphUrl = `https://ghchart.rshah.org/${username}`;

    const container = document.createElement('div');
    container.className = 'results-table code-section';
    container.innerHTML = `
        <div class="results-table-title">CODE</div>
        <div class="code-header">
            <div class="code-header-copy">Public coding activity and weekly build log (last 52 weeks)</div>
            <a href="${githubUrl}" target="_blank" rel="noopener" class="code-github-link">View GitHub</a>
        </div>
        <div class="code-graph-wrap">
            <img src="${contributionGraphUrl}" alt="${username} GitHub contribution graph" class="code-graph-img">
        </div>
        <div class="code-disclaimer">Data source: GitHub public API. Summary reflects public repositories where your account was the contributor.</div>
        <div class="code-stats" id="code-stats">
            <div class="code-stat-card"><span class="code-stat-label">Total commits</span><span class="code-stat-value">...</span></div>
            <div class="code-stat-card"><span class="code-stat-label">Active weeks</span><span class="code-stat-value">...</span></div>
            <div class="code-stat-card"><span class="code-stat-label">Repos touched</span><span class="code-stat-value">...</span></div>
        </div>
        <div class="code-weekly" id="code-weekly">
            <div class="loading">Loading weekly build summary from GitHub...</div>
        </div>
    `;
    resultsContent.appendChild(container);

    const weeklyContainer = container.querySelector('#code-weekly');
    const statsContainer = container.querySelector('#code-stats');

    try {
        const weeklySummary = await getWeeklyBuildSummary(username);
        const stats = buildSummaryStats(weeklySummary);

        statsContainer.innerHTML = `
            <div class="code-stat-card"><span class="code-stat-label">Total commits</span><span class="code-stat-value">${stats.totalCommits}</span></div>
            <div class="code-stat-card"><span class="code-stat-label">Active weeks</span><span class="code-stat-value">${stats.activeWeeks} / ${GITHUB_ONE_YEAR_WEEKS}</span></div>
            <div class="code-stat-card"><span class="code-stat-label">Repos touched</span><span class="code-stat-value">${stats.touchedRepos}</span></div>
        `;
        weeklyContainer.innerHTML = buildWeeklySummaryHtml(weeklySummary);
    } catch (error) {
        weeklyContainer.innerHTML = `
            <div style="color: #ff6b6b;">Could not load weekly summary: ${error.message}</div>
            <div class="code-disclaimer">Open your GitHub profile directly: <a href="${githubUrl}" target="_blank" rel="noopener">${githubUrl}</a></div>
        `;
    }
}

// Update chart based on query type
function updateChart(chartType) {
    // Destroy existing chart
    if (currentChart) {
        currentChart.destroy();
        currentChart = null;
    }

    chartArea.classList.remove('is-hidden');

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
        chartArea.classList.add('is-hidden');
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
            img.style.cssText = 'height: 80px; width: auto; object-fit: contain; border: 1px solid #e9ecef; border-radius: 8px; padding: 8px;';

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
