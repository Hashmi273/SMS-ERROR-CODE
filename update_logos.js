const fs = require('fs');
const path = require('path');

// 1. Copy image files to assets directory
const brainDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d585fdb5-89ea-47f1-945d-843ffe5b905f\\.user_uploaded';
const assetsDir = path.join(__dirname, 'assets');

if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

fs.copyFileSync(path.join(brainDir, 'media_1789623112717.png'), path.join(assetsDir, 'smartping-logo.png'));
fs.copyFileSync(path.join(brainDir, 'media_1789623124631.png'), path.join(assetsDir, 'jio-logo.png'));
fs.copyFileSync(path.join(brainDir, 'media_1789623137790.png'), path.join(assetsDir, 'airtel-logo.png'));
fs.copyFileSync(path.join(brainDir, 'media_1789623155100.jpg'), path.join(assetsDir, 'vi-logo.jpg'));

// 2. Update app.js logic to use logos
const appJsPath = path.join(__dirname, 'js', 'app.js');
let appJs = fs.readFileSync(appJsPath, 'utf8');

const oldLogic = `let opClass = 'op-default';
    if(operator === 'Jio') opClass = 'op-jio';
    else if(operator === 'Vi') opClass = 'op-vi';
    else if(operator === 'Airtel') opClass = 'op-airtel';
    else if(operator === 'SmartPing') opClass = 'op-smartping';`;

const newLogic = `let opLogoHtml = '<span class="operator-badge op-default">' + escapeHtml(operator) + '</span>';
    if(operator === 'Jio') opLogoHtml = '<img src="assets/jio-logo.png" alt="Jio" class="operator-logo" title="Jio">';
    else if(operator === 'Vi') opLogoHtml = '<img src="assets/vi-logo.jpg" alt="Vi" class="operator-logo" title="Vi">';
    else if(operator === 'Airtel') opLogoHtml = '<img src="assets/airtel-logo.png" alt="Airtel" class="operator-logo" title="Airtel">';
    else if(operator === 'SmartPing') opLogoHtml = '<img src="assets/smartping-logo.png" alt="SmartPing" class="operator-logo" title="SmartPing">';`;

appJs = appJs.replace(oldLogic, newLogic);

const oldHtmlLine = `'    <span class="operator-badge ' + opClass + '">' + escapeHtml(operator) + '</span>',`;
const newHtmlLine = `    '    ' + opLogoHtml,`;
appJs = appJs.replace(oldHtmlLine, newHtmlLine);

fs.writeFileSync(appJsPath, appJs);

// 3. Update style.css
const cssPath = path.join(__dirname, 'css', 'style.css');
let css = fs.readFileSync(cssPath, 'utf8');

if (!css.includes('.operator-logo')) {
    css += `\n/* Operator Logos */\n.operator-logo {\n  height: 28px;\n  width: auto;\n  max-width: 90px;\n  object-fit: contain;\n  display: inline-block;\n  vertical-align: middle;\n  mix-blend-mode: multiply;\n}\n`;
    fs.writeFileSync(cssPath, css);
}

console.log('Logos successfully integrated into UI!');
