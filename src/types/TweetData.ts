/** Metadata parsed from YAML frontmatter of each tweet Markdown file. */
export interface TweetMeta {
  /** Emoji representing the author's mood when writing. e.g. "😊", "🤔", "🎉" */
  mood: string;
  /** ISO 8601 timestamp with timezone offset. e.g. "2026-05-02T10:30:00+08:00" */
  created: string;
  /** Optional image URLs to display in the tweet card. */
  images?: string[];
  /** Optional tags for categorization/filtering. */
  tags?: string[];
}

/** Complete tweet data produced by the build pipeline, consumed by rendering components. */
export interface TweetData {
  /** Frontmatter metadata (mood, timestamp, images, tags) */
  meta: TweetMeta;
  /** Pre-rendered HTML string from build-time marked processing. NEVER contains raw Markdown. */
  html: string;
  /** URL-safe identifier derived from the Markdown filename without .md extension. e.g. "hello-world" */
  slug: string;
}
