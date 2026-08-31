# Submission draft

Replace the working title and bracketed URLs before submitting.

## Description

This project is a shared video learning queue for a person and their browser agent. A learner can ask for something fuzzy—“a beginner TypeScript overview I can finish in ten minutes”—and the agent searches a structured catalog, highlights its matches in the page, adds a selection to the visible queue, and loads it in the player. The learner can inspect or change every choice with the normal interface.

WebMCP is a strong fit because video discovery normally requires an agent to interpret cards and repeatedly simulate clicks. This page instead publishes four explicit browser-native tools with JSON Schemas: `search_videos`, `play_video`, `add_to_queue`, and `clear_queue`. These tools call the same client-side functions as the human interface, so both participants share the page's current state without a separate MCP server, duplicated authentication, or hidden automation.

The experience is faster and more trustworthy: the agent translates natural language into exact filters and IDs, while every result and state change remains visible and reversible. This enables a genuinely cooperative flow where the agent handles search and sequencing and the person retains editorial control.

The app is built with Vite and strict TypeScript. Effect Schema validates inputs at the tool boundary, and typed Effects model expected failures before returning readable results to the agent. It is a static, progressively enhanced site with no API key or backend.

## URLs

- Live app: `[add live URL]`
- Public repository: `[make the private repository public, then add URL]`
- Demo video: `[add public YouTube URL]`

## Demo script (about 90 seconds)

1. “This is a shared learning queue built for WebMCP. I can use it normally with these Play and Queue buttons.”
2. Show the status badge reading “WebMCP ready.”
3. Open the browser agent and say: “Find a beginner TypeScript video under ten minutes, add it to my queue, and play it.”
4. Point out that the agent called `search_videos`, then `add_to_queue`, then `play_video`.
5. Show the filtered shelf, shared queue, and loaded player.
6. “The agent did not scrape the page or guess which buttons to click. The page exposed structured tools that reuse the same client-side actions, so the human and agent stay in one visible, shared context.”
7. Briefly show `src/webmcp.ts`: “Each capability is a `document.modelContext.registerTool` call with a description, JSON Schema, and execute function. Effect Schema validates agent input.”
8. End on the working app and show the repository's MIT license.

## Final checklist

- [ ] Choose the final project name yourself and replace the working title.
- [ ] Deploy over HTTPS and test the exact production URL.
- [ ] Verify all four tools in ChatGPT's in-app browser or Chrome 149+.
- [ ] Make the repository public.
- [ ] Confirm GitHub detects the MIT license at the top of the repository.
- [ ] Add setup and test instructions to the Devpost entry.
- [ ] Record a public, audio-narrated YouTube demo under three minutes.
- [ ] Add all three URLs to Devpost.
- [ ] Stop changing the submitted materials after the deadline.
