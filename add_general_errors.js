const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, 'data', 'new_batch_raw.csv');
const jsonPath = path.join(__dirname, 'data', 'errors.json');
const jsPath = path.join(__dirname, 'js', 'errors-data.js');

const rawCsv = fs.readFileSync(csvPath, 'utf8');
const existingJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Combine quoted strings safely (primitive CSV parser)
const lines = rawCsv.split('\n').map(l => l.trim()).filter(l => l.length > 0);

const newData = [];
for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Custom split on comma outside quotes
    const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    const values = line.split(regex).map(v => {
        let val = v.trim();
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1).trim();
        }
        if (val.startsWith("'") && val.endsWith("'")) {
            val = val.substring(1, val.length - 1).trim();
        }
        return val;
    });

    if (values.length >= 2) {
        let code = values[0].toUpperCase();
        let desc = values[1];
        
        newData.push({
            operator: 'General', // Assigning to "General" since no operator provided
            error_code: code,
            error_name: desc.substring(0, 30).toUpperCase().replace(/[^A-Z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, ''), // Mock name
            description: desc,
            category: 'Other',
            stage: 'Unknown',
            retry: 'MAYBE',
            portal_action: 'Check logs/system',
            source: 'User Upload (Bulk)',
            verification: 'UNVERIFIED'
        });
    }
}

// deduplicate logic
// We'll deduplicate by exact error code + description combo across the ENTIRE dataset to avoid repeating
// Or, if error_code exists for "General", we skip.
// Let's use map with key: `operator_errorCode`

const uniqueMap = new Map();

// Load existing
for (const entry of existingJson) {
    const key = `${entry.operator}_${entry.error_code}`;
    uniqueMap.set(key, entry);
}

// Add new - but check for duplicates. "Duplicate entry nhi honi chahiye"
let skipped = 0;
let added = 0;

for (const entry of newData) {
    const key = `${entry.operator}_${entry.error_code}`;
    
    // Custom check: Do we already have this error code with the EXACT same description anywhere?
    let isGlobalDuplicate = false;
    for (const [existingKey, existingEntry] of uniqueMap.entries()) {
        if (existingEntry.error_code === entry.error_code && existingEntry.description.toLowerCase() === entry.description.toLowerCase()) {
            isGlobalDuplicate = true;
            break;
        }
    }

    if (isGlobalDuplicate) {
        skipped++;
        continue; // strictly no duplicates
    }

    // Overwrite or set new for General operator
    if (uniqueMap.has(key)) {
        // If it exists exactly for 'General', check if description differs, else just overwrite
        uniqueMap.set(key, entry);
        added++; // Treating as update
    } else {
        uniqueMap.set(key, entry);
        added++;
    }
}

const uniqueData = Array.from(uniqueMap.values());

fs.writeFileSync(jsonPath, JSON.stringify(uniqueData, null, 2));

const jsContent = `// Fallback dataset for offline usage
window.IMMENSE_ERRORS_DATA = ${JSON.stringify(uniqueData, null, 2)};
`;
fs.writeFileSync(jsPath, jsContent);

console.log(`Merge complete!`);
console.log(`Added/Updated: ${added}`);
console.log(`Skipped (Duplicate descriptions): ${skipped}`);
console.log(`Total unique records now: ${uniqueData.length}`);
