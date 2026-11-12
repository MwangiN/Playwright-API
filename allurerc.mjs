import { defineConfig } from "allure";

export default defineConfig({
  name: "SauceDemo Playwright Tests",
  output: "./allure-report",
  // Trend history. Each `allure generate` appends this run to the file.
  // In CI the file is restored from the published Pages site (see workflow).
  historyPath: "./allure-history/history.jsonl",
  historyLimit: 20,
});
