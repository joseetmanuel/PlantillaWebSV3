import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterAlarma',
  pure: false
})
export class FilterAlarmaPipe implements PipeTransform {
    transform(items: any[], term: any): any {
        // I am unsure what id is here. did you mean title?
       if (items && term) {
            return items.filter(item => {
                if (item.alarma) {
                    return item.alarma.tipo.indexOf(term.tipo) !== -1;
                }
            });
       }
    }
}