/* ---------------- CLOCK ---------------- */

function updateClock() {
  const now = new Date();

  document.getElementById("time").textContent =
    now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  document.getElementById("date").textContent =
    now.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
}

setInterval(updateClock, 1000);
updateClock();

/* ---------------- WEATHER ---------------- */

async function loadWeather() {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${CONFIG.LOCATION}&units=imperial&appid=${CONFIG.WEATHER_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    document.getElementById("weather").innerHTML = `
      <h2>Weather</h2>
      <p>${CONFIG.LOCATION}</p>
      <p style="font-size:42px">${Math.round(data.main.temp)}°F</p>
      <p>${data.weather[0].main}</p>
    `;

    return `${CONFIG.LOCATION} ${Math.round(data.main.temp)}°F ${data.weather[0].main}`;
  } catch {
    document.getElementById("weather").textContent = "Weather unavailable";
    return `${CONFIG.LOCATION} Weather N/A`;
  }
}

/* ---------------- SPORTS ---------------- */

function formatGameDate(dateString, timeString) {
  const date = new Date(`${dateString} ${timeString}`);
  return date.toLocaleDateString([], {
    weekday: "short",
    month: "long",
    day: "numeric"
  }) + " at " + timeString;
}

function loadSportsPanel() {
  document.getElementById("sports").innerHTML = `
    <h2>Sports Updates</h2>

    <div style="margin-bottom:16px">
      <strong>Auburn Basketball</strong>
      <div>
        Next Game: ${formatGameDate("2026-03-12", "7:00 PM")} vs Kentucky
      </div>
    </div>

    <div style="margin-bottom:16px">
      <strong>Auburn Football</strong>
      <div>
        Next Game: ${formatGameDate("2026-11-29", "2:30 PM")} vs Alabama
      </div>
    </div>

    <div>
      <strong>Auburn Baseball</strong>
      <div>
        Next Game: ${formatGameDate("2026-04-03", "6:00 PM")} vs LSU
      </div>
    </div>
  `;
  // Return text for ticker
  return "Auburn Basketball Wed 7:00 PM | Football Sat 2:30 PM | Baseball Fri 6:00 PM";
}

/* ---------------- STOCKS ---------------- */

const STOCK_API_KEY = "d5fip2pr01qnjhocifq0d5fip2pr01qnjhocifqg";

async function fetchStockData(symbol) {
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${STOCK_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const arrow = data.dp >= 0 ? "▲" : "▼";
    const changePercent = Math.abs(data.dp).toFixed(2);
    return `${symbol} ${data.c.toFixed(2)} ${arrow}${changePercent}%`;
  } catch {
    return `${symbol} N/A`;
  }
}

async function loadStocks() {
  const promises = CONFIG.STOCKS.map(fetchStockData);
  const results = await Promise.all(promises);
  return results.join(" | ");
}

/* ---------------- DYNAMIC TICKER ---------------- */

function animateTicker() {
  const ticker = document.getElementById("ticker-content");
  const tickerWidth = ticker.offsetWidth;
  const containerWidth = ticker.parentElement.offsetWidth;
  const distance = tickerWidth + containerWidth;
  const speed = 100; // pixels per second, adjust to preference
  const duration = distance / speed;

  ticker.style.transition = `transform ${duration}s linear`;
  ticker.style.transform = `translateX(-${tickerWidth}px)`;

  ticker.addEventListener(
    "transitionend",
    () => {
      ticker.style.transition = "none";
      ticker.style.transform = `translateX(${containerWidth}px)`;
      requestAnimationFrame(() => requestAnimationFrame(animateTicker));
    },
    { once: true }
  );
}

function startTicker() {
  const ticker = document.getElementById("ticker-content");
  ticker.style.transition = "none";
  ticker.style.transform = `translateX(${ticker.parentElement.offsetWidth}px)`;
  requestAnimationFrame(() => requestAnimationFrame(animateTicker));
}

/* ---------------- LOAD & UPDATE TICKER ---------------- */

async function updateTicker() {
  try {
    const weatherText = await loadWeather();
    const stockText = await loadStocks();
    const sportsText = loadSportsPanel();

    document.getElementById("ticker-content").textContent =
      `${weatherText}   |   ${stockText}   |   ${sportsText}`;

    startTicker();
  } catch (error) {
    console.error("Ticker update failed:", error);
  }
}

// Initial load
updateTicker();

// Refresh every 2 minutes
setInterval(updateTicker, 120000);
