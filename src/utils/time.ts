import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export function formatRelativeTime(isoString: string): string {
  const date = dayjs(isoString);
  if (!date.isValid()) {
    return isoString;
  }

  const diffSeconds = dayjs().diff(date, 'second');
  if (diffSeconds < 30) {
    return '刚刚';
  }

  return date.fromNow();
}
