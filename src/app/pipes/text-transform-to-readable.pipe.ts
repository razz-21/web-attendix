import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textTransformToReadable',
})
export class TextTransformToReadablePipe implements PipeTransform {
  transform(value: string): string {
    return value
      .replace(/[-_.]+/g, ' ')
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}