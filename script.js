document.getElementById('fileInput').addEventListener('change', handleFileSelect);
document.getElementById('companySelect').addEventListener('change', updateCharts);
document.getElementById('loadS3Button').addEventListener('click', fetchS3File);

let csvData = [];
let charts = []; // Track chart instances

// AWS S3 configuration
AWS.config.region = 'us-east-1'; // Replace with your region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:3c64b487-1e8d-4d08-975c-0a909bcab72f', // Replace with your Identity Pool ID
});

var s3 = new AWS.S3();

// Function to fetch CSV file from S3
function fetchS3File() {
    const params = {
        Bucket: 'nepse-stock-data', // Replace with your S3 bucket name
        Key: 'https://nepse-stock-data.s3.amazonaws.com/nepse_data_2024-09-12.csv', // Replace with the path to your CSV file in the bucket
    };

    s3.getObject(params, function(err, data) {
        if (err) {
            console.log("Error fetching file", err);
        } else {
            const csvContent = data.Body.toString('utf-8');
            parseCSV(csvContent); // Parse the CSV content
        }
    });
}

// Function to handle file upload and parse CSV
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            csvData = results.data;
            resetCharts(); // Reset charts for new file
            populateCompanySelect();
        }
    });
}

// Function to parse CSV fetched from S3
function parseCSV(csvContent) {
    Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            csvData = results.data;
            resetCharts();
            populateCompanySelect();
        }
    });
}

// The rest of the code to handle charts (remains the same)
function populateCompanySelect() {
    const select = document.getElementById('companySelect');
    select.innerHTML = ''; // Clear existing options
    const symbols = [...new Set(csvData.map(row => row.SYMBOL))];

    symbols.forEach(symbol => {
        const option = document.createElement('option');
        option.value = symbol;
        option.text = symbol;
        select.add(option);
    });

    if (symbols.length > 0) {
        select.value = symbols[0];
        updateCharts(); // Update charts with the first company
    }
}

// The rest of your charting functions (drawStockPriceChart, drawTradingVolumeChart, etc.) stay the same
// ...

// Function to reset and destroy existing charts
function resetCharts() {
    charts.forEach(chart => chart.destroy());
    charts = [];
}
