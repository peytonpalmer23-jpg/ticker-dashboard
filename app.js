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

    // Display only the weather description (Clear, Rain, Clouds, etc.)
    document.getElementById("weather").innerHTML = `
      <h2>Weather</h2>
      <p>${CONFIG.LOCATION}</p>
      <p style="font-size:42px">${Math.round(data.main.temp)}°F</p>
      <p>${data.weather[0].main}</p>
    `;
  } catch {
    document.getElementById("weather").textContent = "Weather unavailable";
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

function loadSports() {
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
}

/* ---------------- STOCK TICKER ---------------- */

async function loadTicker() {
  // In the future, replace these placeholders with live API data
  const weatherText = "Birmingham 72°F Clear"; 
  const stockText = "AAPL 189.3 ▲1.2% | MSFT 402.1 ▼0.4% | SPY 478.2 ▲0.6%";
  const sportsText = "Auburn Basketball Wed 7:00 PM | Football Sat 2:30 PM";

  document.getElementById("ticker-content").textContent =
    `${weatherText}   |   ${stockText}   |   ${sportsText}`;
}

/* ---------------- INIT ---------------- */

loadWeather();
loadSports();
loadTicker();

// Refresh weather and ticker every 2 minutes
setInterval(() => {
  loadWeather();
  loadTicker();
}, 120000);
