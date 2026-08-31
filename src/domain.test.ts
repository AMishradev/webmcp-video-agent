import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { catalog } from "./catalog.ts";
import {
  findVideo,
  parseSearchInput,
  searchVideos,
  VideoNotFound,
} from "./domain.ts";

describe("video catalog", () => {
  it("filters by natural topic, level, and duration", () => {
    const matches = searchVideos(catalog, {
      query: "typescript",
      level: "beginner",
      maxMinutes: 10,
    });

    expect(matches.map((video) => video.id)).toEqual(["zQnBQ4tB3ZA"]);
  });

  it("validates agent input at the boundary", async () => {
    const result = await Effect.runPromise(parseSearchInput({ maxMinutes: 20 }));
    expect(result).toEqual({ maxMinutes: 20 });
  });

  it("fails clearly for an unknown video", async () => {
    const error = await Effect.runPromise(Effect.flip(findVideo(catalog, "missing")));
    expect(error).toBeInstanceOf(VideoNotFound);
  });
});
