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
      <p style="font-size:36px">${Math.round(data.main.temp)}°F</p>
      <p>${data.weather[0].description}</p>
    `;
  } catch {
    document.getElementById("weather").textContent = "Weather unavailable";
  }
}

/* ---------------- SPORTS ---------------- */

function loadSports() {
  document.getElementById("sports").innerHTML = `
    <h2>Sports</h2>
    <p>${CONFIG.SPORTS.TEAM}</p>
    <p>Next Game: Saturday 2:30 PM</p>
  `;
}

/* ---------------- STOCK TICKER ---------------- */

function loadTicker() {
  const stockText = "AAPL 189.3 ▲1.2% | MSFT 402.1 ▼0.4% | SPY 478.2 ▲0.6%";
  const weatherText = "Birmingham 72°F Clear";
  const sportsText = "Auburn vs Alabama – Sat 2:30 PM";

  document.getElementById("ticker-content").textContent =
    `${weatherText}   |   ${stockText}   |   ${sportsText}`;
}

/* ---------------- INIT ---------------- */

loadWeather();
loadSports();
loadTicker();

setInterval(loadWeather, 300000); // refresh every 5 minutes
