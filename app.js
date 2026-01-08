/* ---------------- CONFIG ---------------- */
const CONFIG = {
  LOCATION: "Birmingham,US",
  LAT: 33.5186,
  LON: -86.8104,
  WEATHER_API_KEY: "ec17977d965fdd9d0ef4cc0d2963af17",
  STOCKS: ["KO","DAL","SPY"],
  SPORTS_API: {
    BASE: "https://ncaa-api.henrygd.me/openapi",
    FOOTBALL: "football/fbs",
    BASKETBALL: "basketball-men/d1",
    BASEBALL: "baseball-men/d1"
  }
};
const STOCK_API_KEY = "d5fk5a1r01qnjhocqd70d5fk5a1r01qnjhocqd7g";

/* ---------------- CLOCK ---------------- */
function updateClock() {
  const now = new Date();
  document.getElementById("time").textContent =
    now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  document.getElementById("date").textContent =
    now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
}
setInterval(updateClock, 1000);
updateClock();

/* ---------------- WEATHER ---------------- */
let latestWeatherText = "Loading weather...";
let weatherChart; // persistent Chart.js object

async function loadWeather() {
  try {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${CONFIG.LAT}&lon=${CONFIG.LON}&exclude=minutely,hourly,alerts&units=imperial&appid=${CONFIG.WEATHER_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const current = data.current;

    latestWeatherText = `${CONFIG.LOCATION} ${Math.round(current.temp)}°F ${current.weather[0].main}`;

    // Update text elements directly
    document.getElementById("weather-location").textContent = CONFIG.LOCATION;
    document.getElementById("weather-temp").textContent = `${Math.round(current.temp)}°F`;
    document.getElementById("weather-condition").textContent = current.weather[0].main;

    // Prepare 7-day forecast data
    const labels = data.daily.map(d => {
      const date = new Date(d.dt * 1000);
      return date.toLocaleDateString([], { weekday: "short" });
    });
    const tempsMax = data.daily.map(d => d.temp.max);
    const tempsMin = data.daily.map(d => d.temp.min);

    const ctx = document.getElementById("weeklyChart").getContext("2d");

    if (weatherChart) {
      // Update existing chart
      weatherChart.data.labels = labels;
      weatherChart.data.datasets[0].data = tempsMax;
      weatherChart.data.datasets[1].data = tempsMin;
      weatherChart.update();
    } else {
      // Create chart for the first time
      weatherChart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            { label: "Max Temp °F", data: tempsMax, borderColor: "rgb(255,99,132)", fill: false },
            { label: "Min Temp °F", data: tempsMin, borderColor: "rgb(54,162,235)", fill: false }
          ]
        },
        options: { responsive: true, plugins: { legend: { position: "bottom" } } }
      });
    }

  } catch (err) {
    console.error("Weather API failed:", err);
    document.getElementById("weather-location").textContent = CONFIG.LOCATION;
    document.getElementById("weather-temp").textContent = "N/A";
    document.getElementById("weather-condition").textContent = "Weather Unavailable";
    latestWeatherText = `${CONFIG.LOCATION} Weather N/A`;
  }
}
loadWeather();
setInterval(loadWeather, 60000); // refresh every 60 seconds

/* ---------------- STOCKS ---------------- */
async function fetchStockData(symbol) {
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${STOCK_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    const up = data.dp >= 0;
    const arrow = up ? "▲" : "▼";
    const changePercent = Math.abs(data.dp).toFixed(2);
    return `<span class="${up ? "stock-up" : "stock-down"}">${symbol} ${data.c.toFixed(2)} ${arrow}${changePercent}%</span>`;
  } catch {
    return `${symbol} N/A`;
  }
}

async function loadStocks() {
  const results = await Promise.all(CONFIG.STOCKS.map(fetchStockData));
  document.getElementById("stocks").innerHTML = "<h2>Stocks</h2><p>" + results.join(" | ") + "</p>";
  return results.join(" | ");
}

/* ---------------- SPORTS ---------------- */
async function fetchNcaaSchedule(sportPath) {
  try {
    const year = new Date().getFullYear();
    const res = await fetch(`${CONFIG.SPORTS_API.BASE}/scoreboard/${sportPath}/${year}/all-conf`);
    const data = await res.json();
    return data.games || [];
  } catch {
    return [];
  }
}

function filterAuburnGames(games) {
  return games.filter(
    g => g.home.names.short.toUpperCase() === "AUBURN" || g.away.names.short.toUpperCase() === "AUBURN"
  );
}

function formatAuburnGame(game) {
  const home = game.home.names.short.toUpperCase();
  const away = game.away.names.short.toUpperCase();
  const homeScore = game.home.score || 0;
  const awayScore = game.away.score || 0;
  const status = game.status || "Scheduled";
  const time = game.time || "";
  return `${away} @ ${home} | ${awayScore}-${homeScore} | ${status} ${time}`;
}

async function loadAuburnSportsPanel() {
  const football = filterAuburnGames(await fetchNcaaSchedule(CONFIG.SPORTS_API.FOOTBALL));
  const basketball = filterAuburnGames(await fetchNcaaSchedule(CONFIG.SPORTS_API.BASKETBALL));
  const baseball = filterAuburnGames(await fetchNcaaSchedule(CONFIG.SPORTS_API.BASEBALL));

  let html = `<h2>Live Auburn Sports</h2>`;
  html += football.length ? `<div><strong>Football</strong>` + football.map(formatAuburnGame).join("<br>") + "</div>" : `<div><strong>Football</strong><div>No games today</div></div>`;
  html += basketball.length ? `<div><strong>Basketball</strong>` + basketball.map(formatAuburnGame).join("<br>") + "</div>" : `<div><strong>Basketball</strong><div>No games today</div></div>`;
  html += baseball.length ? `<div><strong>Baseball</strong>` + baseball.map(formatAuburnGame).join("<br>") + "</div>" : `<div><strong>Baseball</strong><div>No games today</div></div>`;

  document.getElementById("sports").innerHTML = html;

  const nextFootball = football[0] ? formatAuburnGame(football[0]) : "No football today";
  const nextBasketball = basketball[0] ? formatAuburnGame(basketball[0]) : "No basketball today";
  const nextBaseball = baseball[0] ? formatAuburnGame(baseball[0]) : "No baseball today";

  return `${nextFootball} | ${nextBasketball} | ${nextBaseball}`;
}

/* ---------------- DYNAMIC TICKER ---------------- */
function animateTicker() {
  const ticker = document.getElementById("ticker-content");
  const containerWidth = ticker.parentElement.offsetWidth;
  const tickerWidth = ticker.offsetWidth;
  const distance = tickerWidth + containerWidth;
  const speed = 100; // px/sec
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

/* ---------------- UPDATE TICKER ---------------- */
async function updateTicker() {
  try {
    const weatherText = latestWeatherText;
    const stockText = await loadStocks();
    const sportsText = await loadAuburnSportsPanel();

    document.getElementById("ticker-content").innerHTML =
      `${weatherText}   |   ${stockText}   |   ${sportsText}`;

    startTicker();
  } catch (err) {
    console.error("Ticker update failed:", err);
  }
}

// Initial load & repeating updates
updateTicker();
setInterval(updateTicker, 120000);
