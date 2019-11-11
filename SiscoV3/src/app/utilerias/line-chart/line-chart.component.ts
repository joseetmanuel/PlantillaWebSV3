import { Component, OnInit, ViewChild, Input, OnChanges, SimpleChange } from '@angular/core';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, BaseChartDirective, Label } from 'ng2-charts';
import * as pluginAnnotations from 'chartjs-plugin-annotation';
import { SiscoV3Service } from '../../services/siscov3.service';
import { ExcepcionComponent } from '../excepcion/excepcion.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  providers: [SiscoV3Service]
})
export class LineChartComponent implements OnInit, OnChanges {

  @Input() objeto;
  @Input() idClase;
  @Input() bandCostoVenta;

  lineChartData = [];
  // public lineChartData = [
  //   { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
  //   { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' },
  //   { data: [180, 480, 770, 90, 1000, 270, 400], label: 'Series C', yAxisID: 'y-axis-1' }
  // ];
  public lineChartLabels: Label[] = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  colores = [
    {
      color: [67, 117, 237]
    },
    {
      color: [225, 118, 28]
    },
    {
      color: [99, 164, 78]
    },
    {
      color: [115, 162, 251]
    },
    {
      color: [230, 152, 73]
    },
    {
      color: [140, 213, 127]
    }
  ]
  public lineChartColors: Color[];

  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [pluginAnnotations];

  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  spinner: boolean;
  datosGrafica = [];
  bandGrafica: boolean;

  constructor(
    private siscoV3Service: SiscoV3Service,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.loadData();
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.grafica(this.datosGrafica)
  }

  loadData() {
    const data = {
      idClase: this.idClase,
      idTipoObjeto: this.objeto.idTipoObjeto,
      idObjeto: this.objeto.idObjeto,
      rfcEmpresa: this.objeto.rfcEmpresa,
      idCliente: this.objeto.idCliente,
      numeroContrato: this.objeto.numeroContrato
    }

    this.siscoV3Service.postService('proveedor/PostMantenimientoPorAno', data).subscribe(
      (res: any) => {
        this.datosGrafica = res;
        this.grafica(this.datosGrafica);
      }, (error: any) => {
        this.excepciones(error, 2);
      }
    );
  }

  grafica(res) {
    this.bandGrafica = false;
    this.lineChartData = [];
    this.lineChartColors = [];
    res.forEach((e, i, a) => {
      this.lineChartData.push({ label: e.ano, data: [] })
      this.lineChartColors.push(
        {
          backgroundColor: `rgba(${this.colores[i].color}, 0.2)`,
          borderColor: `rgba(${this.colores[i].color}, 1)`,
          pointBackgroundColor: `rgba(${this.colores[i].color}, 1)`,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: `rgba(${this.colores[i].color}, 1)`
        }
      )
      e.meses.forEach((em, im, am) => {
        if (this.bandCostoVenta) {
          this.lineChartData[i].data.push(em.costo)
        } else {
          this.lineChartData[i].data.push(em.venta)
        }
      })
      if (i + 1 === a.length) {
        this.bandGrafica = true;
      }
    })
  }


  excepciones(error, tipoExcepcion: number) {
    try {
      const dialogRef = this.dialog.open(ExcepcionComponent, {
        width: '60%',
        data: {
          idTipoExcepcion: tipoExcepcion,
          idUsuario: 1,
          idOperacion: 1,
          idAplicacion: 1,
          moduloExcepcion: 'sel-centro-costos.component',
          mensajeExcepcion: '',
          stack: error
        }
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        this.spinner = false;
      });
    } catch (error) {
      this.spinner = false;
      console.error(error);
    }
  }
}
