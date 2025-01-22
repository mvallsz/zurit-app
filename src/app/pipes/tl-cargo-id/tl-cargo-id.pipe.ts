import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tlCargoId'
})
export class TlCargoIdPipe implements PipeTransform {

  transform(value: string, ...args: string[]): string {
    return `${ args[0]}-${ value.substring(0, 5) }${ value.substring(value.toString().length - 5) }`;
  }

}
