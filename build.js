require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlPath = path.join(__dirname, '2024.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Replace process.env.GITHUB_TOKEN with the actual token
htmlContent = htmlContent.replace('process.env.GITHUB_TOKEN', `'${process.env.GITHUB_TOKEN}'`);

// Write the processed file
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath);
}

fs.writeFileSync(path.join(distPath, '2024.html'), htmlContent);

// Copy other necessary files
const filesToCopy = ['styles.css', 'charts.js', 'sheets.js'];
filesToCopy.forEach(file => {
    fs.copyFileSync(
        path.join(__dirname, file),
        path.join(distPath, file)
    );
}); 