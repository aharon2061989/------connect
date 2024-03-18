const fs = require('fs');
try {
    const rawData = fs.readFileSync('task.json');
    const data = JSON.parse(rawData);
    console.log(data);
}
catch(error) {
    console.log('Error reading JSON file: ', error);
}