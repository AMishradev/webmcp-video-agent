export type Level = "beginner" | "intermediate";

export interface Video {
  readonly id: string;
  readonly title: string;
  readonly creator: string;
  readonly minutes: number;
  readonly level: Level;
  readonly topics: ReadonlyArray<string>;
}

export const catalog: ReadonlyArray<Video> = [
  {
    id: "zQnBQ4tB3ZA",
    title: "TypeScript in 100 Seconds",
    creator: "Fireship",
    minutes: 2,
    level: "beginner",
    topics: ["typescript", "overview", "types"],
  },
  {
    id: "d56mG7DezGs",
    title: "TypeScript Tutorial for Beginners",
    creator: "Programming with Mosh",
    minutes: 64,
    level: "beginner",
    topics: ["typescript", "fundamentals", "compiler"],
  },
  {
    id: "BCg4U1FzODs",
    title: "TypeScript Crash Course",
    creator: "Traversy Media",
    minutes: 52,
    level: "beginner",
    topics: ["typescript", "generics", "classes"],
  },
  {
    id: "30LWjhZzg50",
    title: "Learn TypeScript – Full Tutorial",
    creator: "freeCodeCamp.org",
    minutes: 282,
    level: "intermediate",
    topics: ["typescript", "projects", "deep dive"],
  },
];
