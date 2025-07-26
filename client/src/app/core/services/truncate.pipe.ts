import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 100, completeWords = true, ellipsis = '...'): string {
    if (!value) return '';
    if (value.length <= limit) return value;

    if (completeWords) {
      const lastSpaceIndex = value.substring(0, limit).lastIndexOf(' ');
      limit = lastSpaceIndex > 0 ? lastSpaceIndex : limit;
    }

    return `${value.substring(0, limit)}${ellipsis}`;
  }
}
