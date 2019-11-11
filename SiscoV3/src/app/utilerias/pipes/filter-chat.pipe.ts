import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterChat'
})
export class FilterChatPipe implements PipeTransform {

  transform(items: any[], searchText: any): any[] {
    if (!items) return [];
    if (!searchText) return items;
    const _searchText = searchText.toLowerCase();
    return items.filter(it => {
      const numeroOrden = it.numeroOrden.toLowerCase().includes(_searchText)
      const usuarios = it.usuarios.toLowerCase().includes(_searchText)
      return (numeroOrden + usuarios);
    })
  }

}
