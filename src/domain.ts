import { Effect, Schema } from "effect";
import type { Video } from "./catalog.ts";

const SearchInput = Schema.Struct({
  query: Schema.optional(Schema.String),
  level: Schema.optional(Schema.Literal("beginner", "intermediate")),
  maxMinutes: Schema.optional(Schema.Number.pipe(Schema.positive())),
});

const VideoInput = Schema.Struct({ videoId: Schema.String });

export type SearchInput = typeof SearchInput.Type;

export interface ToolInput {}

export class InvalidToolInput extends Error {
  readonly _tag = "InvalidToolInput";
}

export class VideoNotFound extends Error {
  readonly _tag = "VideoNotFound";

  constructor(readonly videoId: string) {
    super(`No video has the id "${videoId}".`);
  }
}

export const parseSearchInput = (input: ToolInput) =>
  Schema.decodeUnknown(SearchInput)(input).pipe(
    Effect.mapError(() => new InvalidToolInput("Search filters are invalid.")),
  );

export const parseVideoInput = (input: ToolInput) =>
  Schema.decodeUnknown(VideoInput)(input).pipe(
    Effect.mapError(() => new InvalidToolInput("A videoId is required.")),
  );

const includesQuery = (video: Video, query: string) => {
  const searchable = [video.title, video.creator, ...video.topics]
    .join(" ")
    .toLowerCase();
  return searchable.includes(query.trim().toLowerCase());
};

export const searchVideos = (
  videos: ReadonlyArray<Video>,
  filters: SearchInput,
): ReadonlyArray<Video> =>
  videos.filter((video) => {
    const matchesQuery = filters.query
      ? includesQuery(video, filters.query)
      : true;
    const matchesLevel = filters.level ? video.level === filters.level : true;
    const matchesLength = filters.maxMinutes
      ? video.minutes <= filters.maxMinutes
      : true;
    return matchesQuery && matchesLevel && matchesLength;
  });

export const findVideo = (videos: ReadonlyArray<Video>, videoId: string) =>
  Effect.fromNullable(videos.find((video) => video.id === videoId)).pipe(
    Effect.mapError(() => new VideoNotFound(videoId)),
  );
