import { chromium } from "playwright";
import path from "path";

const out = path.join("docs", "visual-parity", "review");

const browser = await chromium.launch();
const shots = [
  { name: "after-390-light.png", w: 390, h: 844, colorScheme: "light" },
  { name: "after-390-dark.png", w: 390, h: 844, colorScheme: "dark" },
  { name: "after-1440-light.png", w: 1440, h: 900, colorScheme: "light" },
  { name: "after-1440-dark.png", w: 1440, h: 900, colorScheme: "dark" },
];

for (const s of shots) {
  const context = await browser.newContext({
    viewport: { width: s.w, height: s.h },
    colorScheme: s.colorScheme,
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    try {
      indexedDB.deleteDatabase("HabitCheck");
      indexedDB.deleteDatabase("habitcheck");
      localStorage.clear();
    } catch {
      /* ignore */
    }
  });
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.evaluate((scheme) => {
    document.documentElement.classList.toggle("dark", scheme === "dark");
    document.documentElement.style.colorScheme = scheme;
    localStorage.setItem("theme", scheme);
  }, s.colorScheme);
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(out, s.name), fullPage: true });
  await context.close();
  console.log("wrote", s.name);
}

await browser.close();
