declare module '*.md' {
  export const meta: import('./TweetData').TweetMeta;
  export const html: string;
}
