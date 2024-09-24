const droplist = document.querySelectorAll(".drop-list select"),
    fromCurrency = document.querySelector(".from select"),
    toCurrency = document.querySelector(".to select"),
    getButton = document.querySelector("form button");
let chart; // Declare a global variable to store the chart instance

for (let i = 0; i < droplist.length; i++) {
    for (currency_code in country_code) {
        // selecting INR by default as FROM currency and USD as TO currency
        let selected;
        if (i == 0) {
            selected = currency_code == "INR" ? "selected" : "";
        } else if (i == 1) {
            selected = currency_code == "USD" ? "selected" : "";
        }
        // creating option tag with passing currency code as a text and value
        let optionTag = `<option value="${currency_code}" ${selected}>${currency_code}</option>`;
        //inserting options tag inside select tag
        droplist[i].insertAdjacentHTML("beforeend", optionTag);
    }
    droplist[i].addEventListener("change", e => {
        loadFlag(e.target); // calling loadFlag with passing target element as an argument
    });
}

function loadFlag(element) {
    for (code in country_code) {
        if (code == element.value) { // if currency code of country list is equal to option value
            let imgTag = element.parentElement.querySelector("img"); // selecting img tag of particular drop list
            // passing country code of a selected currency code in a img url
            imgTag.src = `https://flagsapi.com/${country_code[code]}/flat/64.png`
        }
    }
}

function getExchangeRate() {
    const amount = document.querySelector(".amount input");
    exchangeRateTxt = document.querySelector(".exchange-rate");
    let amountVal = amount.value;
    // If user doesn't enter any value or enters 0, we'll put 1 value by default in the input field
    if (amountVal == "" || amountVal == "0") {
        amount.value = "1";
        amountVal = 1;
    }
    exchangeRateTxt.innerText = "Getting Exchange Rate.....";
    let url = `https://v6.exchangerate-api.com/v6/05e8b32767b2e5c3fc6a7342/latest/${fromCurrency.value}`;
    // fetching API response and returning it with parsing into js obj and in another then method receiving the obj
    fetch(url).then(response => response.json()).then(result => {
        let exchangeRate = result.conversion_rates[toCurrency.value];
        let totalExchangeRate = (amountVal * exchangeRate).toFixed(2);
        exchangeRateTxt.innerText = `${amountVal} ${fromCurrency.value} = ${totalExchangeRate} ${toCurrency.value}`;
    }).catch(() => { // If user is offline or any other error occurred while fetching function will run
        exchangeRateTxt.innerText = "Something went wrong!!!";
    });
}

// Function to fetch historical data and update the chart
function getHistoricalData(fromCurrency, toCurrency) {
    let url = `https://v6.exchangerate-api.com/v6/YOUR_API_KEY/history/${fromCurrency}/7day`;

    fetch(url)
    .then(response => response.json())
    .then(data => {
        const rates = data.rates; // Ensure this matches the API structure
        if (!rates) {
            console.error("No historical data available.");
            return;
        }

        // Assuming the API returns data with dates as keys and exchange rates as values
        const labels = Object.keys(rates); // Dates
        const values = labels.map(date => rates[date][toCurrency]); // Exchange rates for 'toCurrency'

        if (chart) {
            chart.destroy(); // Destroy the existing chart before creating a new one
        }

        const ctx = document.getElementById('exchangeRateChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Exchange Rate (${fromCurrency} to ${toCurrency})`,
                    data: values,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    fill: true,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Exchange Rate'
                        },
                        beginAtZero: false
                    }
                }
            }
        });
    })
    .catch(() => {
        console.error("Failed to fetch historical data.");
    });
}


window.addEventListener("load", () => {
    getExchangeRate();
    getHistoricalData(fromCurrency.value, toCurrency.value); // Fetch historical data on load
});

getButton.addEventListener("click", e => {
    e.preventDefault(); // preventing form from submitting
    getExchangeRate();
    getHistoricalData(fromCurrency.value, toCurrency.value); // Fetch historical data when button is clicked
});

const exchangeIcon = document.querySelector(".drop-list .icon");
exchangeIcon.addEventListener("click", () => {
    let tempCode = fromCurrency.value; // temporary currency code of FROM drop list
    fromCurrency.value = toCurrency.value; // passing TO currency code to FROM currency code
    toCurrency.value = tempCode; // passing temporary currency code to TO currency code
    loadFlag(fromCurrency); // calling loadFlag with passing select element(fromCurrency) of FROM
    loadFlag(toCurrency); // calling loadFlag with passing select element (toCurrency) of TO
    getExchangeRate();
    getHistoricalData(fromCurrency.value, toCurrency.value); // Fetch historical data when currencies are switched
});
