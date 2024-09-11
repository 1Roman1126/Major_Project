document.getElementById('fileInput').addEventListener('change', handleFileSelect);
document.getElementById('companySelect').addEventListener('change', updateCharts);

let csvData = [];
let companies = [];

// Function to handle file upload and parse CSV
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            csvData = results.data;
            populateCompanySelect();
        }
    });
}

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
    const highPrices = companyData.map(row => parseFloat(row.HIGH_PRICE));
    const lowPrices = companyData.map(row => parseFloat(row.LOW_PRICE));
    const closePrices = companyData.map(row => parseFloat(row.CLOSE_PRICE));
    const tradedQuantities = companyData.map(row => parseFloat(row.TOTAL_TRADED_QUANTITY));
    const marketCaps = companyData.map(row => parseFloat(row.MARKET_CAPITALIZATION));
    const fiftyTwoWeeksHigh = companyData.map(row => parseFloat(row.FIFTY_TWO_WEEKS_HIGH));
    const fiftyTwoWeeksLow = companyData.map(row => parseFloat(row.FIFTY_TWO_WEEKS_LOW));
    const averageTradedPrice = companyData.map(row => parseFloat(row.AVERAGE_TRADED_PRICE));
    const previousDayClosePrice = companyData.map(row => parseFloat(row.PREVIOUS_DAY_CLOSE_PRICE));
    const totalTrades = companyData.map(row => parseFloat(row.TOTAL_TRADES));
    const lastUpdatedPrice = companyData.map(row => parseFloat(row.LAST_UPDATED_PRICE));

    // Stock Prices Chart
    const ctxStockPrice = document.getElementById('stockPriceChart').getContext('2d');
    new Chart(ctxStockPrice, {
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
            plugins: {
                legend: {
                    position: 'top',
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

    // Trading Volume Chart
    const ctxTradingVolume = document.getElementById('tradingVolumeChart').getContext('2d');
    new Chart(ctxTradingVolume, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Total Traded Quantity',
                data: tradedQuantities,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
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

    // Market Capitalization Chart
    const ctxMarketCap = document.getElementById('marketCapChart').getContext('2d');
    new Chart(ctxMarketCap, {
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
            plugins: {
                legend: {
                    position: 'top',
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

    // High vs Low Prices Chart
    const ctxHighLowPrices = document.getElementById('highLowPricesChart').getContext('2d');
    new Chart(ctxHighLowPrices, {
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
            plugins: {
                legend: {
                    position: 'top',
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

    // Price and Value Metrics Chart
    const ctxPriceValue = document.getElementById('priceValueChart').getContext('2d');
    new Chart(ctxPriceValue, {
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
            plugins: {
                legend: {
                    position: 'top',
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
}
