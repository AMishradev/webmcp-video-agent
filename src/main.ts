import "./style.css";
import { catalog, type Video } from "./catalog.ts";
import { registerVideoTools } from "./webmcp.ts";

const app = document.querySelector<HTMLDivElement>("#app");
if (app === null) throw new Error("Missing #app element.");

let visibleIds = new Set(catalog.map((video) => video.id));
let queue: ReadonlyArray<Video> = [];

app.innerHTML = `
  <header class="hero">
    <nav><span class="mark">WM</span><span>Learning Queue</span><span id="status" class="status"></span></nav>
    <div class="hero-copy">
      <p class="eyebrow">A tiny human + agent experiment</p>
      <h1>Tell your browser what you want to learn.</h1>
      <p class="lede">Your agent can search this shelf, build a queue, and load a lesson. You stay in the same page, see every change, and remain in control.</p>
      <div class="prompt"><span>Try asking</span><code>Find a beginner TypeScript video under 10 minutes, add it to my queue, and play it.</code></div>
    </div>
  </header>
  <main>
    <section id="player-section" class="player-section" hidden>
      <div class="section-heading"><p class="eyebrow">Now learning</p><h2 id="player-title"></h2></div>
      <div class="player-shell"><iframe id="player" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>
    </section>
    <div class="layout">
      <section>
        <div class="section-heading"><p class="eyebrow">Curated shelf</p><h2>Pick a lesson</h2><p id="match-count"></p></div>
        <div id="catalog" class="catalog"></div>
      </section>
      <aside>
        <div class="section-heading"><p class="eyebrow">Shared state</p><h2>Your queue</h2></div>
        <ol id="queue" class="queue"></ol>
        <button id="clear" class="secondary" type="button">Clear queue</button>
      </aside>
    </div>
  </main>
  <footer>Four browser-native tools · No API key · Built with TypeScript, Effect, and WebMCP</footer>
`;

const requiredElement = <ElementType extends Element>(selector: string) => {
  const element = document.querySelector<ElementType>(selector);
  if (element === null) throw new Error(`Missing element: ${selector}`);
  return element;
};

const catalogElement = requiredElement<HTMLDivElement>("#catalog");
const queueElement = requiredElement<HTMLOListElement>("#queue");
const matchCount = requiredElement<HTMLParagraphElement>("#match-count");
const playerSection = requiredElement<HTMLElement>("#player-section");
const playerTitle = requiredElement<HTMLHeadingElement>("#player-title");
const player = requiredElement<HTMLIFrameElement>("#player");
const status = requiredElement<HTMLSpanElement>("#status");

const thumbnailUrl = (video: Video) =>
  `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;

const renderCatalog = () => {
  const visible = catalog.filter((video) => visibleIds.has(video.id));
  matchCount.textContent = `${visible.length} of ${catalog.length} videos shown`;
  catalogElement.replaceChildren(
    ...visible.map((video) => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <img src="${thumbnailUrl(video)}" alt="" />
        <div class="card-body">
          <div class="meta"><span>${video.level}</span><span>${video.minutes} min</span></div>
          <h3>${video.title}</h3><p>${video.creator}</p>
          <div class="actions"><button data-play="${video.id}" type="button">Play</button><button class="secondary" data-queue="${video.id}" type="button">+ Queue</button></div>
        </div>`;
      return card;
    }),
  );
};

const renderQueue = () => {
  queueElement.replaceChildren(
    ...(queue.length === 0
      ? [Object.assign(document.createElement("li"), { className: "empty", textContent: "Nothing queued yet. Ask your agent or pick a video." })]
      : queue.map((video) => {
          const item = document.createElement("li");
          item.innerHTML = `<button data-play="${video.id}" type="button"><span>${video.title}</span><small>${video.minutes} min</small></button>`;
          return item;
        })),
  );
};

const play = (video: Video) => {
  playerTitle.textContent = video.title;
  player.src = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1`;
  playerSection.hidden = false;
  playerSection.scrollIntoView({ behavior: "smooth", block: "start" });
};

const enqueue = (video: Video) => {
  if (!queue.some((queued) => queued.id === video.id)) queue = [...queue, video];
  renderQueue();
};

const byId = (id: string) => catalog.find((video) => video.id === id);

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>("button");
  if (button === null) return;
  const videoToPlay = button.dataset.play ? byId(button.dataset.play) : undefined;
  const videoToQueue = button.dataset.queue ? byId(button.dataset.queue) : undefined;
  if (videoToPlay) play(videoToPlay);
  if (videoToQueue) enqueue(videoToQueue);
});

requiredElement<HTMLButtonElement>("#clear").addEventListener("click", () => {
  queue = [];
  renderQueue();
});

const hasWebMcp = registerVideoTools(catalog, {
  showMatches: (videos) => {
    visibleIds = new Set(videos.map((video) => video.id));
    renderCatalog();
  },
  play,
  enqueue,
  clearQueue: () => {
    queue = [];
    renderQueue();
  },
});

status.textContent = hasWebMcp ? "WebMCP ready" : "WebMCP browser needed";
status.classList.toggle("ready", hasWebMcp);
renderCatalog();
renderQueue();
