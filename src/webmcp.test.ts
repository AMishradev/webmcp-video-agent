// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { catalog } from "./catalog.ts";
import { registerVideoTools } from "./webmcp.ts";

class ModelContextStub extends EventTarget implements WebMCP.ModelContext {
  readonly tools: Array<WebMCP.ModelContextTool> = [];
  ontoolchange: ((event: Event) => void) | null = null;

  registerTool(tool: WebMCP.ModelContextTool) {
    this.tools.push(tool);
    return Promise.resolve();
  }

  getTools() {
    return Promise.resolve([]);
  }
}

describe("WebMCP tools", () => {
  it("registers and executes the catalog search tool", async () => {
    const context = new ModelContextStub();
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: context,
    });
    const showMatches = vi.fn();

    const registered = registerVideoTools(catalog, {
      showMatches,
      play: vi.fn(),
      enqueue: vi.fn(),
      clearQueue: vi.fn(),
    });

    expect(registered).toBe(true);
    expect(context.tools.map((tool) => tool.name)).toEqual([
      "search_videos",
      "play_video",
      "add_to_queue",
      "clear_queue",
    ]);

    const searchTool = context.tools.find((tool) => tool.name === "search_videos");
    if (searchTool === undefined) throw new Error("search_videos was not registered");
    await searchTool.execute(
      { maxMinutes: 10 },
      { signal: new AbortController().signal },
    );

    expect(showMatches).toHaveBeenCalledOnce();
    expect(showMatches.mock.calls[0]?.[0]).toHaveLength(1);
  });
});
