/* ================= CONFIG ================= */
const CONFIG = {
  LOCATION: "Birmingham, US",
  LAT: 33.5186,
  LON: -86.8104,
  WEATHER_API_KEY: "4af01e1ce83bbf0724a64a0eab2b9fd7",
  STOCKS: ["SPY", "DJI", "AAPL", "TSLA", "NVDA"],
};

const STOCK_API_KEY = "d5fk5a1r01qnjhocqd70d5fk5a1r01qnjhocqd7g";

/* ================= CLOCK ================= */
function updateClock() {
  const now = new Date();
  document.getElementById("time").textContent =
    now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  document.getElementById("date").textContent =
    now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
}
setInterval(updateClock, 1000);
updateClock();

/* ================= WEATHER (TEXT ONLY) ================= */
let latestWeatherText = "Loading weather...";

async function loadWeather() {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${CONFIG.LAT}&lon=${CONFIG.LON}&units=imperial&appid=${CONFIG.WEATHER_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    const temp = Math.round(data.main.temp);
    const condition = data.weather[0].main;

    document.getElementById("weather-location").textContent = CONFIG.LOCATION;
    document.getElementById("weather-temp").textContent = `${temp}°F`;
    document.getElementById("weather-condition").textContent = condition;

    latestWeatherText = `${CONFIG.LOCATION} ${temp}°F ${condition}`;
  } catch (err) {
    console.error("Weather failed:", err);
    latestWeatherText = "Weather unavailable";
  }
}

loadWeather();
setInterval(loadWeather, 60000);

/* ================= STOCKS ================= */
async function fetchStock(symbol) {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${STOCK_API_KEY}`
    );
    const data = await res.json();

    const up = data.dp >= 0;
    return `<span class="${up ? "stock-up" : "stock-down"}">
      ${symbol} ${data.c.toFixed(2)} ${up ? "▲" : "▼"}${Math.abs(data.dp).toFixed(2)}%
    </span>`;
  } catch {
    return `<span>${symbol} N/A</span>`;
  }
}

async function loadStocks() {
  const stocks = await Promise.all(CONFIG.STOCKS.map(fetchStock));
  document.getElementById("stocks").innerHTML =
    `<h2>Markets</h2><div class="stock-row">${stocks.join(" | ")}</div>`;
  return stocks.join(" | ");
}

/* ================= SPORTS (STATIC PLACEHOLDER – STABLE) ================= */
function loadSports() {
  const sportsText =
    "Auburn Basketball: Next game TBD | Auburn Baseball: Season Ongoing";
  document.getElementById("sports").innerHTML =
    `<h2>Auburn Sports</h2><p>${sportsText}</p>`;
  return sportsText;
}

/* ================= TICKER ================= */
function resetTickerPosition() {
  const ticker = document.getElementById("ticker-content");
  const container = ticker.parentElement;

  ticker.style.transition = "none";
  ticker.style.transform = `translateX(${container.offsetWidth}px)`;
}

function startTickerAnimation() {
  const ticker = document.getElementById("ticker-content");
  const container = ticker.parentElement;

  const distance = ticker.offsetWidth + container.offsetWidth;
  const duration = distance / 80; // slower, readable

  ticker.style.transition = `transform ${duration}s linear`;
  ticker.style.transform = `translateX(-${ticker.offsetWidth}px)`;

  ticker.addEventListener(
    "transitionend",
    () => {
      resetTickerPosition();
      requestAnimationFrame(startTickerAnimation);
    },
    { once: true }
  );
}

/* ================= TICKER UPDATE ================= */
async function updateTicker() {
  const stockText = await loadStocks();
  const sportsText = loadSports();

  const ticker = document.getElementById("ticker-content");

  // 1️⃣ Inject content
  ticker.innerHTML =
    `${latestWeatherText} | ${stockText} | ${sportsText}`;

  // 2️⃣ Force layout calculation
  ticker.offsetWidth;

  // 3️⃣ Reset + animate on next frame
  resetTickerPosition();
  requestAnimationFrame(startTickerAnimation);
}

/* ================= INIT ================= */
updateTicker();
setInterval(updateTicker, 120000);
