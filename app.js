/* ---------------- CONFIG ---------------- */
// Make sure CONFIG has LAT, LON for your weather
// Example:
// const CONFIG = {
//   LOCATION: "Birmingham,AL",
//   LAT: 33.5186,
//   LON: -86.8104,
//   WEATHER_API_KEY: "YOUR_OPENWEATHER_KEY",
//   STOCKS: ["AAPL","MSFT","SPY"],
//   SPORTS_API: { BASE: "https://ncaa-api.henrygd.me/openapi", FOOTBALL: "football/fbs", BASKETBALL: "basketball-men/d1" }
// }

const STOCK_API_KEY = "d5fjdr9r01qnjhocm5dgd5fjdr9r01qnjhocm5e0";

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

    const current = data.current;
    latestWeatherText = `${CONFIG.LOCATION} ${Math.round(current.temp)}°F ${current.weather[0].main}`;

    // Render panel
    document.getElementById("weather").innerHTML = `
      <h2>Weather</h2>
      <p>${CONFIG.LOCATION}</p>
      <p style="font-size:42px">${Math.round(current.temp)}°F</p>
      <p>${current.weather[0].main}</p>
      <canvas id="weeklyChart" width="400" height="150"></canvas>
    `;

    // Prepare 7-day forecast data
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
    console.error("Weather API failed", err);
    document.getElementById("weather").textContent = "Weather unavailable";
    latestWeatherText = `${CONFIG.LOCATION} Weather N/A`;
  }
}

// Refresh weather every 60 seconds independently
loadWeather();
setInterval(loadWeather, 60000);

/* ---------------- STOCKS ---------------- */
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

function formatNcaaGame(game) {
  const home = game.home.names.short.toUpperCase();
  const away = game.away.names.short.toUpperCase();
  const status = game.status || "Scheduled";
  const score = (game.home.score || 0) + "-" + (game.away.score || 0);
  const gameTime = game.time || "";
  return `${away} @ ${home} ${status} ${score} ${gameTime}`;
}

async function loadSportsPanel() {
  const footballGames = await fetchNcaaSchedule(CONFIG.SPORTS_API.FOOTBALL);
  const basketballGames = await fetchNcaaSchedule(CONFIG.SPORTS_API.BASKETBALL);

  let html = `<h2>Sports Updates</h2>`;

  if (footballGames.length) {
    html += `<div><strong>Football</strong>`;
    footballGames.forEach(g => { html += `<div>${formatNcaaGame(g)}</div>`; });
    html += `</div>`;
  }

  if (basketballGames.length) {
    html += `<div><strong>Basketball</strong>`;
    basketballGames.forEach(g => { html += `<div>${formatNcaaGame(g)}</div>`; });
    html += `</div>`;
  }

  document.getElementById("sports").innerHTML = html;

  const nextFootball = footballGames[0] ? formatNcaaGame(footballGames[0]) : "No football today";
  const nextBasketball = basketballGames[0] ? formatNcaaGame(basketballGames[0]) : "No basketball today";

  return `${nextFootball} | ${nextBasketball}`;
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
    const weatherText = latestWeatherText; // always latest
    const stockText = await loadStocks();
    const sportsText = await loadSportsPanel();

    document.getElementById("ticker-content").textContent =
      `${weatherText}   |   ${stockText}   |   ${sportsText}`;

    startTicker();
  } catch (err) {
    console.error("Ticker update failed", err);
  }
}

// Initial ticker load and repeat every 2 minutes
updateTicker();
setInterval(updateTicker, 120000);

