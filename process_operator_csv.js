const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'data', 'operator_errors.csv');
const jsonPath = path.join(__dirname, 'data', 'errors.json');
const jsPath = path.join(__dirname, 'js', 'errors-data.js');

const rawCsv = fs.readFileSync(csvPath, 'utf8');

// Parse CSV manually
const lines = rawCsv.split('\n').map(l => l.trim()).filter(l => l.length > 0);
const headers = lines[0].split(',').map(h => h.trim());

const data = [];
for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // basic CSV parsing ignoring quotes for simplicity except splitting
    // simple split by comma won't work well with quotes if they exist.
    // Let's implement a small regex to split by comma outside quotes
    const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    const values = line.split(regex).map(v => {
        let val = v.trim();
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1);
        }
        return val;
    });
    
    if (values.length >= 10) {
        data.push({
            operator: values[0],
            error_code: values[1],
            error_name: values[2],
            description: values[3],
            category: values[4],
            stage: values[5],
            source: values[6],
            verification: values[7],
            retry: values[8],
            portal_action: values[9]
        });
    }
}

// deduplicate exact operator + error_code
const uniqueMap = new Map();
for (const entry of data) {
    const key = `${entry.operator}_${entry.error_code}`;
    if (!uniqueMap.has(key)) {
        uniqueMap.set(key, entry);
    }
}

const uniqueData = Array.from(uniqueMap.values());

// Write files
fs.writeFileSync(jsonPath, JSON.stringify(uniqueData, null, 2));

const jsContent = `// Fallback dataset for offline usage
window.IMMENSE_ERRORS_DATA = ${JSON.stringify(uniqueData, null, 2)};
`;
fs.writeFileSync(jsPath, jsContent);

console.log(`Processed ${uniqueData.length} unique records from ${data.length} total.`);
