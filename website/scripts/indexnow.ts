/**
 * IndexNow submitter — pings participating search engines (Bing, Yandex,
 * Naver, Seznam) that the site's URLs have changed. Google does not
 * participate. One POST covers every engine via the api.indexnow.org hub.
 *
 * Run after a deploy:  bun run indexnow
 *
 * The key is a public ownership token, verified by fetching
 * https://apple.raintree.technology/<key>.txt — keep the file in public/ in
 * sync with INDEXNOW_KEY below.
 */
import { getAllTopicMetas } from "../lib/topics";

const BASE_URL = "https://apple.raintree.technology";
const KEY = process.env.INDEXNOW_KEY ?? "6373a59ca3dd4ed6aba586d41ea5d3c6";
const ENDPOINT = "https://api.indexnow.org/indexnow";

function buildUrlList(): string[] {
  const topics = getAllTopicMetas();
  return [
    BASE_URL,
    `${BASE_URL}/topics`,
    ...topics.map((t) => `${BASE_URL}/topics/${t.slug}`),
  ];
}

async function main(): Promise<void> {
  const urlList = buildUrlList();
  const host = new URL(BASE_URL).host;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key: KEY,
      keyLocation: `${BASE_URL}/${KEY}.txt`,
      urlList,
    }),
  });

  if (!res.ok) {
    console.error(
      `IndexNow submission failed: ${res.status} ${res.statusText}`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `IndexNow: submitted ${urlList.length} URLs (HTTP ${res.status})`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
