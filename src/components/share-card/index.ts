import type { TweetData } from '../../types/TweetData';
import { ShareCardDialog } from './dialog';

export function openShareCard(tweet: TweetData): void {
  document.querySelector('.sharecard-overlay')?.remove();
  new ShareCardDialog(tweet).open();
}
