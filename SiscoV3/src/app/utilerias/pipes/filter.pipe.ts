import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
   name: 'filter'
})

export class FilterPipe implements PipeTransform {
   transform(items: any[], searchText: string, prop?: any): any[] {
      if (!items) return [];
      if (!searchText || !prop) return items;
      const _searchText = searchText.toLowerCase(),
         _isArr = Array.isArray(items),
         _flag = _isArr && typeof items[0] === 'object' ? true : _isArr && typeof items[0] !== 'object' ? false : true;

      return items.filter(ele => {
         let val = _flag ? ele[prop] : ele;
         return val.toString().toLowerCase().includes(_searchText);
      });
   }
}