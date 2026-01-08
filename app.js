/* ---------------- CONFIG ---------------- */
const CONFIG = {
  LOCATION: "Birmingham,AL",
  LAT: 33.5186,
  LON: -86.8104,
  WEATHER_API_KEY: "4af01e1ce83bbf0724a64a0eab2b9fd7",
  STOCKS: ["AAPL","MSFT","SPY"],
  SPORTS_API: {
    BASE: "https://ncaa-api.henrygd.me/openapi",
    FOOTBALL: "football/fbs",
    BASKETBALL: "basketball-men/d1",
    BASEBALL: "baseball-men/d1"
  }
};

const STOCK_API_KEY = "d5fk0u1r01qnjhocpkd0d5fk0u1r01qnjhocpkdg";

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

async function loadWeather() {
  try {
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${CONFIG.LAT}&lon=${CONFIG.LON}&exclude=minutely,hourly,alerts&units=imperial&appid=${CONFIG.WEATHER_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.current || !data.daily) throw new Error("Invalid weather data");

    const current = data.current;
    latestWeatherText = `${CONFIG.LOCATION} ${Math.round(current.temp)}°F ${current.weather[0].main}`;

    // Render weather panel
    document.getElementById("weather").innerHTML = `
      <h2>Weather</h2>
      <p>${CONFIG.LOCATION}</p>
      <p style="font-size:42px">${Math.round(current.temp)}°F</p>
      <p>${current.weather[0].main}</p>
      <canvas id="weeklyChart" width="400" height="150"></canvas>
    `;

    // 7-day forecast chart
    const labels = data.daily.map(d => {
      const date = new Date(d.dt * 1000);
      return date.toLocaleDateString([], { weekday: "short" });
    });
    const tempsMax = data.daily.map(d => d.temp.max);
    const tempsMin = data.daily.map(d => d.temp.min);

    const ctx = document.getElementById("weeklyChart").getContext("2d");
    new Chart(ctx, {
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
  } catch (err) {
    console.error("Weather API failed:", err);
    document.getElementById("weather").textContent = "Weather unavailable";
    latestWeatherText = `${CONFIG.LOCATION} Weather N/A`;
  }
}
loadWeather();
setInterval(loadWeather, 60000); // refresh every 60s

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
  const promises = CONFIG.STOCKS.map(fetchStockData);
  const results = await Promise.all(promises);
  return results.join(" | ");
}

/* ---------------- SPORTS ---------------- */
async function fetchNcaaSchedule(sportPath) {
  try {
    const year = new Date().getFullYear();
    const url = `${CONFIG.SPORTS_API.BASE}/scoreboard/${sportPath}/${year}/all-conf`;
    const res = await fetch(url);
    const data = await res.json();
    return data.games || [];
  } catch (err) {
    console.error("Sports API failed", err);
    return [];
  }
}

function filterAuburnGames(games) {
  return games.filter(
    g =>
      g.home.names.short.toUpperCase() === "AUBURN" ||
      g.away.names.short.toUpperCase() === "AUBURN"
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
  const footballGames = await fetchNcaaSchedule(CONFIG.SPORTS_API.FOOTBALL);
  const basketballGames = await fetchNcaaSchedule(CONFIG.SPORTS_API.BASKETBALL);
  const baseballGames = await fetchNcaaSchedule(CONFIG.SPORTS_API.BASEBALL);

  const auburnFootball = filterAuburnGames(footballGames);
  const auburnBasketball = filterAuburnGames(basketballGames);
  const auburnBaseball = filterAuburnGames(baseballGames);

  let html = `<h2>Live Auburn Sports</h2>`;

  if (auburnFootball.length) {
    html += `<div><strong>Football</strong>`;
    auburnFootball.forEach(g => { html += `<div>${formatAuburnGame(g)}</div>`; });
    html += `</div>`;
  } else html += `<div><strong>Football</strong><div>No games today</div></div>`;

  if (auburnBasketball.length) {
    html += `<div><strong>Basketball</strong>`;
    auburnBasketball.forEach(g => { html += `<div>${formatAuburnGame(g)}</div>`; });
    html += `</div>`;
  } else html += `<div><strong>Basketball</strong><div>No games today</div></div>`;

  if (auburnBaseball.length) {
    html += `<div><strong>Baseball</strong>`;
    auburnBaseball.forEach(g => { html += `<div>${formatAuburnGame(g)}</div>`; });
    html += `</div>`;
  } else html += `<div><strong>Baseball</strong><div>No games today</div></div>`;

  document.getElementById("sports").innerHTML = html;

  // Prepare ticker text
  const nextFootball = auburnFootball[0] ? formatAuburnGame(auburnFootball[0]) : "No football today";
  const nextBasketball = auburnBasketball[0] ? formatAuburnGame(auburnBasketball[0]) : "No basketball today";
  const nextBaseball = auburnBaseball[0] ? formatAuburnGame(auburnBaseball[0]) : "No baseball today";

  return `${nextFootball} | ${nextBasketball} | ${nextBaseball}`;
}

/* ---------------- DYNAMIC TICKER ---------------- */
function animateTicker() {
  const ticker = document.getElementById("ticker-content");
  const containerWidth = ticker.parentElement.offsetWidth;
  const tickerWidth = ticker.offsetWidth;
  const distance = tickerWidth + containerWidth;
  const speed = 100; // pixels/sec
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

// Initial load and repeat every 2 minutes
updateTicker();
setInterval(updateTicker, 120000);
