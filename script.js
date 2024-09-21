import { Storage } from 'aws-amplify';
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';  // Your Amplify configuration

Amplify.configure(awsconfig);

let csvData = [];
let charts = [];  // Track chart instances

// Fetch the CSV file from the public S3 URL when the page loads
async function fetchCSVFromS3() {
    try {
        const fileUrl = 'https://nepse-stock-data.s3.amazonaws.com/nepse_data_2024-09-18.csv';
        const response = await fetch(fileUrl);
        const csvText = await response.text();  // Convert to text
        console.log(csvText);  // Check the fetched CSV content

        parseCSVData(csvText);  // Parse and use CSV data
    } catch (error) {
        console.error("Error fetching CSV from S3:", error);
    }
}

// Parse the fetched CSV data using PapaParse and populate charts
function parseCSVData(csvText) {
    Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            csvData = results.data;
            console.log(csvData);  // Log the parsed CSV data

            populateCompanySelect();  // Populate dropdown with company symbols
        }
    });
}

// Populate company selection dropdown
function populateCompanySelect() {
    const select = document.getElementById('companySelect');
    const symbols = [...new Set(csvData.map(row => row.SYMBOL))];  // Get unique symbols

    // Clear existing options
    select.innerHTML = '';

    // Add new options based on fetched data
    symbols.forEach(symbol => {
        const option = document.createElement('option');
        option.value = symbol;
        option.text = symbol;
        select.add(option);
    });

    // Automatically update charts with the first company
    if (symbols.length > 0) {
        select.value = symbols[0];
        updateCharts();
    }

    // Update charts on company selection
    select.addEventListener('change', updateCharts);
}

// Update charts based on selected company
function updateCharts() {
    const selectedSymbol = document.getElementById('companySelect').value;
    const companyData = csvData.filter(row => row.SYMBOL === selectedSymbol);

    if (companyData.length === 0) return;

    const dates = companyData.map(row => row.BUSINESS_DATE);
    const openPrices = companyData.map(row => parseFloat(row.OPEN_PRICE));
    const closePrices = companyData.map(row => parseFloat(row.CLOSE_PRICE));
    const tradedQuantities = companyData.map(row => parseFloat(row.TOTAL_TRADED_QUANTITY));

    // Reset existing charts
    resetCharts();

    // Draw new charts with the fetched data
    drawStockPriceChart(dates, openPrices, closePrices);
    drawTradingVolumeChart(dates, tradedQuantities);
}

// Helper function to draw Stock Price chart
function drawStockPriceChart(dates, openPrices, closePrices) {
    const ctx = document.getElementById('stockPriceChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Open Price',
                    data: openPrices,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 2
                },
                {
                    label: 'Close Price',
                    data: closePrices,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { title: { display: true, text: 'Price' }, beginAtZero: false }
            }
        }
    });
    charts.push(chart);
}

// Helper function to draw Trading Volume chart
function drawTradingVolumeChart(dates, tradedQuantities) {
    const ctx = document.getElementById('tradingVolumeChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Traded Quantity',
                data: tradedQuantities,
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { title: { display: true, text: 'Quantity' }, beginAtZero: true }
            }
        }
    });
    charts.push(chart);
}

// Reset and destroy existing charts
function resetCharts() {
    charts.forEach(chart => chart.destroy());
    charts = [];
}

// Load the CSV data from S3 when the page loads
window.onload = fetchCSVFromS3;
