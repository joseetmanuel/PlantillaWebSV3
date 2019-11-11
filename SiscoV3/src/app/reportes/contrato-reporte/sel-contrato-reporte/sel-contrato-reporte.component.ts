import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SiscoV3Service } from 'src/app/services/siscov3.service';
import { selectContratoState, AppState, selectAuthState } from 'src/app/store/app.states';
import { MatSnackBar, MatDialog } from '@angular/material';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IGridGeneralConfiguration, TiposdeDato, TiposdeFormato } from 'src/app/interfaces';
import { ExcepcionComponent } from 'src/app/utilerias/excepcion/excepcion.component';

@Component({
  selector: 'app-sel-contrato-reporte',
  templateUrl: './sel-contrato-reporte.component.html',
  styleUrls: ['./sel-contrato-reporte.component.scss']
})
export class SelContratoReporteComponent implements OnInit {

  /** Commons */
  spinner = false;
  gridConfiguration: IGridGeneralConfiguration;
  dataGrid: any = [];
  datosevent: any;

  constructor(private router: Router, private siscoV3Service: SiscoV3Service, public dialog: MatDialog, private snackBar: MatSnackBar) {
    this.fnGridInitializer();
  }

  ngOnInit() {
    this.spinner = true;
    this.siscoV3Service.getService('reporte/GetContrato').subscribe(
      (res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {

          this.dataGrid = res.recordsets[0];
        }
      },
      (error: any) => {
        this.spinner = false;
      }
    );
  }

  Excepciones(stack: any, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'sel-contrato-reporte.component',
          mensajeExcepcion: '',
          stack
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
      });

    } catch (err) {
    }
  }
  
  fnGridInitializer() {
    this.gridConfiguration = {
      GridOptions: {
        paginacion: 50,
        pageSize: [50, 100, 200]
      },
      ExportExcel: { enabled: false, fileName: 'reportes' },
      ColumnHiding: { hide: false },
      Checkbox: { checkboxmode: 'single' },
      Editing: { allowupdate: true, mode: 'batch' },
      Columnchooser: { columnchooser: false },
      SearchPanel: { visible: true, width: 200, placeholder: 'Buscar...', filterRow: true },
      Scroll: { mode: 'standard' },
      Detail: { detail: false },
      ToolbarDetail: null,
      Color: {
        columnas: true,
        alternar: true,
        filas: true
      },
      ToolBox: [
        // {
        //   location: 'after',
        //   widget: 'dxButton',
        //   locateInMenu: 'auto',
        //   options: {
        //     text: 'Agregar',
        //     onClick: this.receiveMessage.bind(this, 'agregar')
        //   },
        //   visible: true
        // },{
        //   location: 'after',
        //   widget: 'dxButton',
        //   locateInMenu: 'auto',
        //   options: {
        //     text: 'Eliminar',
        //     onClick: this.receiveMessage.bind(this, 'eliminar')
        //   },
        //   visible: false,
        //   name: 'simple'
        // }
      ],
      Columns: [
        {
          caption: 'Contrato',
          dataField: 'contrato',
          allowEditing: false
        },
        {
          caption: 'Fecha inicio',
          dataField: 'fechaInicio',
          allowEditing: true,
          dataType: TiposdeDato.date,
          format: TiposdeFormato.dmy
        },
        {
          caption: 'Fecha firma',
          dataField: 'fechaFirma',
          allowEditing: true,
          dataType: TiposdeDato.date,
          format: TiposdeFormato.dmy
        },
        {
          caption: 'Parque vehicular',
          dataField: 'parqueVehicular',
          allowEditing: true
        },
        {
          caption: 'Sustituto',
          dataField: 'sustituto',
          allowEditing: true
        }
      ]
    };
  }

  receiveMessage($event: string) {
    switch ($event) {
      case 'agregar':
        this.router.navigateByUrl('/ins-reporte-contrato');
        break;
        case 'eliminar':
          
          break;
    }
  }

  datosMessage($event: any) {
    this.datosevent = $event.data;
  }

  updateContrato($event) {
    this.spinner = true;
    let data = $event.editdata.key;
    let newdata = $event.editdata.newData;
    for (const key in newdata) {
      if (newdata.hasOwnProperty(key)) {
        data[key] = newdata[key];
      }
    }
    this.spinner = true;
    this.siscoV3Service.putService('reporte/PutContrato', data).subscribe(
      (res: any) => {
        this.spinner = false;
        if (res.err) {
          this.Excepciones(res.err, 4);
        } else if (res.excepcion) {
          this.Excepciones(res.excepcion, 3);
        } else {
          this.snackBar.open('Se a actualizado el contrato.', 'Ok', {
            duration: 2000
          });
        }
      },
      (error: any) => {
        this.spinner = false;
      }
    );
  }
}
