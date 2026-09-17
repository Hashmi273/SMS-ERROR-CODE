const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'data', 'additional_errors.csv');
const jsonPath = path.join(__dirname, 'data', 'errors.json');
const jsPath = path.join(__dirname, 'js', 'errors-data.js');

const rawCsv = fs.readFileSync(csvPath, 'utf8');
const existingJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Parse CSV manually
const lines = rawCsv.split('\n').map(l => l.trim()).filter(l => l.length > 0);
const headers = lines[0].split(',').map(h => h.trim());

const newData = [];
for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    const values = line.split(regex).map(v => {
        let val = v.trim();
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1);
        }
        return val;
    });
    
    if (values.length >= 10) {
        // Headers: operator_provider,error_code,error_name,description,category,stage,retry,portal_action,source,verification
        const opName = values[0] === 'Provider PDF' ? 'Provider' : values[0];
        newData.push({
            operator: opName,
            error_code: values[1],
            error_name: values[2],
            description: values[3],
            category: values[4],
            stage: values[5],
            retry: values[6],
            portal_action: values[7],
            source: values[8],
            verification: values[9]
        });
    }
}

// Merge and deduplicate exact operator + error_code
const uniqueMap = new Map();
// Add existing
for (const entry of existingJson) {
    const key = `${entry.operator}_${entry.error_code}`;
    uniqueMap.set(key, entry);
}
// Add new (overwrites old if same key)
for (const entry of newData) {
    const key = `${entry.operator}_${entry.error_code}`;
    uniqueMap.set(key, entry);
}

const uniqueData = Array.from(uniqueMap.values());

// Write files
fs.writeFileSync(jsonPath, JSON.stringify(uniqueData, null, 2));

const jsContent = `// Fallback dataset for offline usage
window.IMMENSE_ERRORS_DATA = ${JSON.stringify(uniqueData, null, 2)};
`;
fs.writeFileSync(jsPath, jsContent);

console.log(`Merged! Total unique records: ${uniqueData.length}`);
