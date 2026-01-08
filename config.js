/* ================= V2 CONFIG ================= */

const CONFIG = {
  // -------- Dashboard Mode --------
  MODE: "KIOSK", // informational only for now

  // -------- Location --------
  LOCATION: {
    NAME: "Birmingham, US",
    LAT: 33.5186,
    LON: -86.8104
  },

  // -------- Feature Toggles --------
  FEATURES: {
    WEATHER: true,
    STOCKS: true,
    SPORTS: true,
    TICKER: true
  },

  // -------- Refresh Intervals (ms) --------
  REFRESH: {
    CLOCK: 1000,
    WEATHER: 60_000,      // 1 min (safe for free tier)
    STOCKS: 120_000,      // 2 min
    SPORTS: 300_000,      // 5 min
    TICKER: 120_000
  },

  // -------- Weather --------
  WEATHER: {
    PROVIDER: "OPENWEATHER",
    API_KEY: "4af01e1ce83bbf0724a64a0eab2b9fd7",
    UNITS: "imperial"
  },

  // -------- Markets --------
  STOCKS: {
    PROVIDER: "FINNHUB",
    API_KEY: "d5fk5a1r01qnjhocqd70d5fk5a1r01qnjhocqd7g",
    SYMBOLS: ["SPY", "DOW", "AAPL", "TSLA", "NVDA"]
  },

  // -------- Sports (Auburn Only) --------
  SPORTS: {
    ENABLED: true,
    TEAM: "AUBURN",
    SPORTS: ["BASKETBALL", "BASEBALL"], // football later
    PROVIDER: "STATIC_V2_1" // API added in V2.2
  }
};
