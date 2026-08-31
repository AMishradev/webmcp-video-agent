import { Effect } from "effect";
import type { Video } from "./catalog.ts";
import {
  findVideo,
  parseSearchInput,
  parseVideoInput,
  searchVideos,
} from "./domain.ts";

export interface VideoActions {
  readonly showMatches: (videos: ReadonlyArray<Video>) => void;
  readonly play: (video: Video) => void;
  readonly enqueue: (video: Video) => void;
  readonly clearQueue: () => void;
}

const textResult = (text: string) => ({
  content: [{ type: "text" as const, text }],
});

const runTool = <A>(effect: Effect.Effect<A, Error>) =>
  Effect.runPromise(
    effect.pipe(
      Effect.catchAll((error) =>
        Effect.succeed(textResult(`Tool could not complete: ${error.message}`)),
      ),
    ),
  );

export const registerVideoTools = async (
  videos: ReadonlyArray<Video>,
  actions: VideoActions,
) => {
  if (document.modelContext === undefined) return false;

  await document.modelContext.registerTool({
    name: "search_videos",
    description:
      "Search the visible learning-video catalog and highlight matching cards. Use this before choosing a video when the user describes a topic, level, or time limit.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Topic, title, or creator text to match.",
        },
        level: {
          type: "string",
          enum: ["beginner", "intermediate"],
          description: "Optional learner level.",
        },
        maxMinutes: {
          type: "number",
          minimum: 1,
          description: "Optional maximum video length in minutes.",
        },
      },
      additionalProperties: false,
    },
    execute: (input) =>
      runTool(
        parseSearchInput(input).pipe(
          Effect.map((filters) => searchVideos(videos, filters)),
          Effect.tap((matches) => Effect.sync(() => actions.showMatches(matches))),
          Effect.map((matches) =>
            textResult(
              JSON.stringify({
                count: matches.length,
                videos: matches.map(({ id, title, creator, minutes, level }) => ({
                  id,
                  title,
                  creator,
                  minutes,
                  level,
                })),
              }),
            ),
          ),
        ),
      ),
  });

  await document.modelContext.registerTool({
    name: "play_video",
    description:
      "Load one catalog video in the visible player. Use a videoId returned by search_videos. This changes the page but does not navigate away.",
    inputSchema: {
      type: "object",
      properties: {
        videoId: { type: "string", description: "Catalog video id." },
      },
      required: ["videoId"],
      additionalProperties: false,
    },
    execute: (input) =>
      runTool(
        parseVideoInput(input).pipe(
          Effect.flatMap(({ videoId }) => findVideo(videos, videoId)),
          Effect.tap((video) => Effect.sync(() => actions.play(video))),
          Effect.map((video) => textResult(`Loaded "${video.title}" in the player.`)),
        ),
      ),
  });

  await document.modelContext.registerTool({
    name: "add_to_queue",
    description:
      "Add one catalog video to the shared visible learning queue. Duplicate videos are ignored. Use a videoId returned by search_videos.",
    inputSchema: {
      type: "object",
      properties: {
        videoId: { type: "string", description: "Catalog video id." },
      },
      required: ["videoId"],
      additionalProperties: false,
    },
    execute: (input) =>
      runTool(
        parseVideoInput(input).pipe(
          Effect.flatMap(({ videoId }) => findVideo(videos, videoId)),
          Effect.tap((video) => Effect.sync(() => actions.enqueue(video))),
          Effect.map((video) => textResult(`Added "${video.title}" to the queue.`)),
        ),
      ),
  });

  await document.modelContext.registerTool({
    name: "clear_queue",
    description: "Clear every video from the shared visible learning queue.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    execute: () => {
      actions.clearQueue();
      return textResult("The learning queue is now empty.");
    },
  });

  return true;
};
