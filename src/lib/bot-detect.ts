/**
 * Known crawler / monitoring / headless signatures. Matching visits are never
 * counted as real visitors. Deliberately conservative: false positives would
 * hide real patients, false negatives are caught by the engagement rule.
 */
const BOT_PATTERNS = [
  "bot",
  "crawl",
  "spider",
  "slurp",
  "headless",
  "phantomjs",
  "puppeteer",
  "playwright",
  "selenium",
  "curl/",
  "wget",
  "python-requests",
  "httpclient",
  "go-http-client",
  "java/",
  "libwww",
  "okhttp",
  "axios/",
  "node-fetch",
  "lighthouse",
  "pagespeed",
  "gtmetrix",
  "pingdom",
  "uptime",
  "monitor",
  "preview",
  "fetcher",
  "scraper",
  "archive.org_bot",
  "facebookexternalhit",
  "whatsapp",
  "telegrambot",
  "slackbot",
  "discordbot",
  "embedly",
  "quora link preview",
  "vkshare",
  "skypeuripreview",
  "semrush",
  "ahrefs",
  "mj12",
  "dotbot",
  "petalbot",
  "bytespider",
  "dataforseo",
  "seokicks",
  "screaming frog",
  "gptbot",
  "ccbot",
  "claudebot",
  "perplexitybot",
  "applebot",
];

export function isBotUserAgent(userAgent: string): boolean {
  const ua = userAgent.toLowerCase().trim();
  if (!ua) return true; // no UA at all is never a real browser
  return BOT_PATTERNS.some((p) => ua.includes(p));
}
