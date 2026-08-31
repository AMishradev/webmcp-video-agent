# WebMCP video learning queue

A deliberately small WebMCP Challenge project: a person and a browser agent build a YouTube learning queue together on the same page.

> The challenge organizers recommend that participants choose their own project name. “WebMCP video learning queue” is only a descriptive working title—rename it before submission.

## What it does

The page contains a short, curated catalog of TypeScript learning videos. A person can use the visible Play and Queue buttons. In a WebMCP-enabled browser, an agent can use four structured tools to manipulate the exact same interface:

| Tool | Visible result |
| --- | --- |
| `search_videos` | Filters the cards by topic, level, or duration |
| `play_video` | Loads the chosen video in the embedded player |
| `add_to_queue` | Adds a video to the shared queue |
| `clear_queue` | Empties the queue |

Try this prompt in ChatGPT's in-app browser or Chrome's Model Context Tool Inspector:

> Find a beginner TypeScript video under 10 minutes, add it to my queue, and play it.

The expected tool sequence is `search_videos` → `add_to_queue` → `play_video`.

## Why this is a strong fit for WebMCP

Video sites are visual and interaction-heavy. A general browser agent would otherwise inspect cards, infer the meaning of labels, find buttons, and simulate clicks. Each step is brittle.

WebMCP lets this page state its capabilities directly with names, descriptions, and JSON Schemas. The agent receives reliable video IDs and calls the same client-side functions used by the human-facing interface. No separate MCP server, copied login state, or hidden backend workflow is needed.

The important experience is collaboration, not automation in the background:

- The agent turns a natural-language goal such as “a short beginner lesson” into structured filters.
- The page visibly highlights the matches so the person can inspect the agent's choices.
- Either participant can change the queue or start playback.
- All state stays in the current browser tab and remains visible to the person.

This shared, inspectable state is difficult to preserve with a traditional backend MCP integration, which usually acts outside the page, and is unreliable with screenshot-and-click automation.

## How WebMCP is implemented

The entire integration is in [`src/webmcp.ts`](src/webmcp.ts). Each tool is registered with `document.modelContext.registerTool(...)`:

```ts
void document.modelContext.registerTool({
  name: "search_videos",
  description: "Search the visible learning-video catalog...",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string" },
      level: { type: "string", enum: ["beginner", "intermediate"] },
      maxMinutes: { type: "number", minimum: 1 },
    },
    additionalProperties: false,
  },
  execute: (input) => /* validate, search, and update the visible UI */,
});
```

The site progressively enhances: ordinary buttons continue to work in browsers without WebMCP, while a status badge says whether `document.modelContext` is available.

## Why Effect is here

Effect is used only where it makes the flow clearer:

1. `Schema.decodeUnknown` validates untrusted agent input.
2. Expected errors such as an unknown video ID stay in the typed Effect error channel.
3. The WebMCP boundary converts each Effect into a Promise and a readable tool result.

Start with [`src/domain.ts`](src/domain.ts), then read [`src/webmcp.ts`](src/webmcp.ts), and finally [`src/main.ts`](src/main.ts). There is no frontend framework, server, database, or YouTube API key.

## Run locally

Prerequisites: Node.js 22 or newer and npm.

```bash
npm install
npm run dev
```

Open the printed local URL. For WebMCP support, use either:

- ChatGPT's in-app browser, or
- Chrome 149+ with `chrome://flags/#enable-webmcp-testing` enabled and the browser relaunched.

Chrome's Model Context Tool Inspector can list and manually call the registered tools. The normal UI remains usable in any modern browser.

## Checks

```bash
npm run check
```

That command runs:

- Oxlint with the generic and Effect anti-slop plugins
- TypeScript in strict mode
- Vitest unit tests for validation, search, and error behavior
- A production Vite build

## Project map

```text
src/
  catalog.ts       Four curated video records
  domain.ts        Effect schemas and pure catalog operations
  domain.test.ts   Small unit-test suite
  webmcp.ts        The four WebMCP tool registrations
  main.ts          DOM state and human interactions
  style.css        Responsive presentation
tools/oxlint/      Vendored anti-slop rules
```

## Challenge submission notes

- The repository is private during development, as requested. The challenge rules require it to be public at submission time.
- An MIT license is included and will be visible to GitHub after the repository is made public.
- The live app needs HTTPS and must be tested in ChatGPT's in-app browser or WebMCP-enabled Chrome.
- A public YouTube demo shorter than three minutes with audio is required.
- Do not edit the submitted repository, live app, or Devpost entry after the September 3, 2026 1:00 PM PDT deadline while judging is active.

See [`docs/SUBMISSION.md`](docs/SUBMISSION.md) for ready-to-edit submission copy and a short demo script.

## Sources used

- [WebMCP explainer](https://github.com/webmachinelearning/webmcp)
- [Chrome WebMCP developer documentation](https://developer.chrome.com/docs/ai/webmcp)
- [Chrome WebMCP eval guidance](https://developer.chrome.com/docs/ai/webmcp/evals)
- [WebMCP Challenge resources and FAQ](https://webmcp.devpost.com/resources)
- [YouTube privacy-enhanced embeds](https://support.google.com/youtube/answer/171780)

## License

[MIT](LICENSE)
