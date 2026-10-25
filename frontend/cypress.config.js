const { defineConfig } = require("cypress");

module.exports = defineConfig({
  defaultBrowser: "chrome",
  e2e: {
    baseUrl: "http://localhost:5173",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});