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

/* ---------------- LIVE SPORTS API ---------------- */

async function fetchNcaaSchedule(sportPath) {
  try {
    // For today’s date
    const now = new Date();
    const year = now.getFullYear();

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
  // Example game object from NCAA API
  const home = game.home.names.short.toUpperCase();
  const away = game.away.names.short.toUpperCase();
  const status = game.status || "Scheduled";
  const gameTime = game.time || "";
  const score = game.home.score + "-" + game.away.score;

  return `${away} @ ${home} ${status} ${score} ${gameTime}`;
}

async function loadSportsPanel() {
  const footballGames = await fetchNcaaSchedule(CONFIG.SPORTS_API.FOOTBALL);
  const basketballGames = await fetchNcaaSchedule(CONFIG.SPORTS_API.BASKETBALL);

  let html = `<h2>Sports Updates</h2>`;

  if (footballGames.length) {
    html += `<div><strong>Football</strong>`;
    footballGames.forEach(g => {
      html += `<div>${formatNcaaGame(g)}</div>`;
    });
    html += `</div>`;
  }

  if (basketballGames.length) {
    html += `<div><strong>Basketball</strong>`;
    basketballGames.forEach(g => {
      html += `<div>${formatNcaaGame(g)}</div>`;
    });
    html += `</div>`;
  }

  document.getElementById("sports").innerHTML = html;

  // For ticker, use simple next games text
  const nextFootball = footballGames[0]
    ? formatNcaaGame(footballGames[0])
    : "No football today";
  const nextBasketball = basketballGames[0]
    ? formatNcaaGame(basketballGames[0])
    : "No basketball today";

  return `${nextFootball} | ${nextBasketball}`;
}


/* ---------------- STOCKS ---------------- */

const STOCK_API_KEY = "d5fj6jhr01qnjhocksh0d5fj6jhr01qnjhockshg";

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
  const containerWidth = ticker.parentElement.offsetWidth;
  const tickerWidth = ticker.offsetWidth;

  // total distance for ticker to travel
  const distance = tickerWidth + containerWidth;

  const speed = 100; // pixels per second
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

    const tickerText = `${weatherText}   |   ${stockText}   |   ${sportsText}`;
    document.getElementById("ticker-content").textContent = tickerText;

    // start dynamic scroll
    startTicker();
  } catch (error) {
    console.error("Ticker update failed:", error);
  }
}

// Initial load
updateTicker();

// Refresh every 2 minutes
setInterval(updateTicker, 120000);

