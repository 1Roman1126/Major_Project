import { Storage } from 'aws-amplify';
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports';  // AWS Amplify configuration file

Amplify.configure(awsconfig);


document.getElementById('fileInput').addEventListener('change', handleFileSelect);
document.getElementById('companySelect').addEventListener('change', updateCharts);

let csvData = [];
let charts = []; // Track chart instances

// Fetch data from S3
async function fetchCSVFromS3() {
    try {
        const fileKey = 'nepse_data_2024-09-18.csv'; // Use the actual file key from S3
        const csvContent = await Storage.get(fileKey, { download: true });
        console.log(csvContent.Body.toString('utf-8'));  // Log the content of the file
        
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
}catch (error) {
        console.error("Error fetching CSV from S3:", error);
    }
}

// Call fetchCSVFromS3 when the page loads
window.onload = function() {
fetchCSVFromS3();  // Automatically fetch data from S3 when the page loads
};

// Function to populate the company selection dropdown
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

// Function to update charts based on selected company
function updateCharts() {
    const selectedSymbol = document.getElementById('companySelect').value;
    const companyData = csvData.filter(row => row.SYMBOL === selectedSymbol);

    if (companyData.length === 0) return;

    const dates = companyData.map(row => row.BUSINESS_DATE);
    const openPrices = companyData.map(row => parseFloat(row.OPEN_PRICE));
    const closePrices = companyData.map(row => parseFloat(row.CLOSE_PRICE));
    const tradedQuantities = companyData.map(row => parseFloat(row.TOTAL_TRADED_QUANTITY));
    const marketCaps = companyData.map(row => parseFloat(row.MARKET_CAPITALIZATION));
    const highPrices = companyData.map(row => parseFloat(row.HIGH_PRICE));
    const lowPrices = companyData.map(row => parseFloat(row.LOW_PRICE));
    const averageTradedPrice = companyData.map(row => parseFloat(row.AVERAGE_TRADED_PRICE));
    const previousDayClosePrice = companyData.map(row => parseFloat(row.PREVIOUS_DAY_CLOSE_PRICE));

    // Reset existing charts before drawing new ones
    resetCharts();

    // Draw new charts
    drawStockPriceChart(dates, openPrices, closePrices);
    drawTradingVolumeChart(dates, tradedQuantities);
    drawMarketCapChart(dates, marketCaps);
    drawHighLowPricesChart(dates, highPrices, lowPrices);
    drawPriceValueChart(dates, averageTradedPrice, previousDayClosePrice);
}

// Helper function to draw the Stock Prices Chart
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
                    borderWidth: 2,
                },
                {
                    label: 'Close Price',
                    data: closePrices,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    onClick: function(e, legendItem) {
                        const index = legendItem.datasetIndex;
                        const ci = this.chart;
                        const meta = ci.getDatasetMeta(index);
                        meta.hidden = !meta.hidden; // Toggle dataset visibility
                        ci.update();
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { title: { display: true, text: 'Price' }, beginAtZero: false }
            }
        }
    });
    charts.push(chart);
}

// Function to draw the Trading Volume Chart
function drawTradingVolumeChart(dates, tradedQuantities) {
    const ctx = document.getElementById('tradingVolumeChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Total Traded Quantity',
                data: tradedQuantities,
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { title: { display: true, text: 'Quantity' }, beginAtZero: true }
            }
        }
    });
    charts.push(chart);
}

// Function to draw the Market Capitalization Chart
function drawMarketCapChart(dates, marketCaps) {
    const ctx = document.getElementById('marketCapChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Market Capitalization',
                data: marketCaps,
                borderColor: 'rgba(255, 159, 64, 1)',
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { title: { display: true, text: 'Market Cap (in millions)' }, beginAtZero: true }
            }
        }
    });
    charts.push(chart);
}

// Function to draw the High vs Low Prices Chart
function drawHighLowPricesChart(dates, highPrices, lowPrices) {
    const ctx = document.getElementById('highLowPricesChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'High Price',
                    data: highPrices,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 2,
                },
                {
                    label: 'Low Price',
                    data: lowPrices,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderWidth: 2,
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { title: { display: true, text: 'Price' }, beginAtZero: false }
            }
        }
    });
    charts.push(chart);
}

// Function to draw the Price and Value Metrics Chart
function drawPriceValueChart(dates, averageTradedPrice, previousDayClosePrice) {
    const ctx = document.getElementById('priceValueChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Average Traded Price',
                    data: averageTradedPrice,
                    backgroundColor: 'rgba(255, 205, 86, 0.2)',
                    borderColor: 'rgba(255, 205, 86, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Previous Day Close Price',
                    data: previousDayClosePrice,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: { title: { display: true, text: 'Date' } },
                y: { title: { display: true, text: 'Price' }, beginAtZero: false }
            }
        }
    });
    charts.push(chart);
}

// Function to reset and destroy existing charts
function resetCharts() {
    charts.forEach(chart => chart.destroy());
    charts = [];
}
