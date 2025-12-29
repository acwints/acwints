// Database setup using sql.js (SQLite compiled to WebAssembly)

let db = null;

async function initDatabase() {
    // Initialize sql.js
    const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
    });

    // Create a new database
    db = new SQL.Database();

    // Create tables
    db.run(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            name TEXT,
            title TEXT,
            location TEXT,
            email TEXT,
            bio TEXT
        )
    `);

    db.run(`
        CREATE TABLE experience (
            id INTEGER PRIMARY KEY,
            company TEXT,
            role TEXT,
            start_date TEXT,
            end_date TEXT,
            description TEXT
        )
    `);

    db.run(`
        CREATE TABLE projects (
            id INTEGER PRIMARY KEY,
            name TEXT,
            description TEXT,
            url TEXT
        )
    `);

    db.run(`
        CREATE TABLE skills (
            id INTEGER PRIMARY KEY,
            name TEXT
        )
    `);

    db.run(`
        CREATE TABLE social_links (
            id INTEGER PRIMARY KEY,
            platform TEXT,
            url TEXT,
            username TEXT
        )
    `);

    // Seed data from data.js
    seedDatabase();

    return db;
}

function seedDatabase() {
    // Insert users
    const userStmt = db.prepare(
        'INSERT INTO users (id, name, title, location, email, bio) VALUES (?, ?, ?, ?, ?, ?)'
    );
    PORTFOLIO_DATA.users.forEach(u => {
        userStmt.run([u.id, u.name, u.title, u.location, u.email, u.bio]);
    });
    userStmt.free();

    // Insert experience
    const expStmt = db.prepare(
        'INSERT INTO experience (id, company, role, start_date, end_date, description) VALUES (?, ?, ?, ?, ?, ?)'
    );
    PORTFOLIO_DATA.experience.forEach(e => {
        expStmt.run([e.id, e.company, e.role, e.start_date, e.end_date, e.description]);
    });
    expStmt.free();

    // Insert projects
    const projStmt = db.prepare(
        'INSERT INTO projects (id, name, description, url) VALUES (?, ?, ?, ?)'
    );
    PORTFOLIO_DATA.projects.forEach(p => {
        projStmt.run([p.id, p.name, p.description, p.url]);
    });
    projStmt.free();

    // Insert skills
    const skillStmt = db.prepare(
        'INSERT INTO skills (id, name) VALUES (?, ?)'
    );
    PORTFOLIO_DATA.skills.forEach(s => {
        skillStmt.run([s.id, s.name]);
    });
    skillStmt.free();

    // Insert social links
    const socialStmt = db.prepare(
        'INSERT INTO social_links (id, platform, url, username) VALUES (?, ?, ?, ?)'
    );
    PORTFOLIO_DATA.social_links.forEach(s => {
        socialStmt.run([s.id, s.platform, s.url, s.username]);
    });
    socialStmt.free();
}

function executeQuery(sql) {
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
