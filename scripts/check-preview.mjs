import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const profile = join(tmpdir(), "ce-preview-chrome-3");
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--remote-debugging-port=9335",
    `--user-data-dir=${profile}`,
    "--window-size=1280,900",
    "--allow-file-access-from-files",
    "about:blank",
  ],
  { stdio: "ignore" },
);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitPort() {
  for (let i = 0; i < 40; i++) {
    try {
      if ((await fetch("http://127.0.0.1:9335/json/version")).ok) return;
    } catch {
      await sleep(200);
    }
  }
  throw new Error("no debug port");
}
await waitPort();
const target = await (await fetch("http://127.0.0.1:9335/json/new?about:blank", { method: "PUT" })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.addEventListener("open", resolve);
  ws.addEventListener("error", reject);
});
let seq = 0;
const pending = new Map();
ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  }
});
const send = (method, params = {}) => {
  const id = ++seq;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve) => pending.set(id, resolve));
};
await send("Page.enable");
await send("Runtime.enable");
await send("Page.navigate", { url: "file:///E:/MyProjects/chianelli-estimating/preview.html" });
await sleep(5000);
const info = await send("Runtime.evaluate", {
  expression: `(() => {
    const el = document.getElementById('previewFrame');
    const r = el.getBoundingClientRect();
    const px = r.x + r.width / 2;
    const py = r.y + r.height * 0.86;
    const hit = document.elementFromPoint(px, py);
    return {
      src: el.src,
      box: { x: r.x, y: r.y, w: r.width, h: r.height },
      hit: hit ? (hit.tagName + '#' + (hit.id || '') + '.' + (hit.className?.baseVal || hit.className || '')) : null
    };
  })()`,
  returnByValue: true,
});
console.log(JSON.stringify(info.result?.result?.value, null, 2));
ws.close();
chrome.kill();
process.exit(0);
