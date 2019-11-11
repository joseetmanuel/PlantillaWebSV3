import { Component, OnInit, ViewChild, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { ToastrService, GlobalConfig, ToastContainerDirective } from 'ngx-toastr';
import { MessagingService } from 'src/app/services/messaging.service';
import { BehaviorSubject } from 'rxjs';
import { cloneDeep } from 'lodash';
import { BaseService } from '../../../services/base.service';

@Component({
  selector: 'app-toast-sisco',
  templateUrl: './toast-sisco.component.html',
  styleUrls: ['./toast-sisco.component.sass']
})
export class ToastSISCOComponent implements OnInit, AfterViewInit {
  options: GlobalConfig;
  private lastInserted: number[] = [];
  currentMessage = new BehaviorSubject(null);
  modulosColor: [any];
  @ViewChild(ToastContainerDirective) toastContainer: ToastContainerDirective;
  @ViewChild("toastSISCOContainer") toastSISCOContainer: ElementRef;
  constructor(private toastrService: ToastrService, private messagingService: MessagingService, private renderer: Renderer2, private baseService: BaseService) {
    this.options = this.toastrService.toastrConfig;
  }

  ngOnInit() {
    this.toastrService.overlayContainer = this.toastContainer;
    this.suscribirFirebase();
  }

  ngAfterViewInit() { }

  private getColorMapped() {
    const secu = this.baseService.getSecurityData();
    this.modulosColor = secu.modulos.filter(m => m.caption.color).map(m => {
      return { id: m.id, color: m.caption.color }
    });
  }

  private suscribirFirebase() {
    const recMenSus = this.messagingService.recibirMensajes();
    recMenSus.subscribe((res: any) => {
      this.getColorMapped();
      this.currentMessage.next(res);
      this.openToast(res.notification.body, res.notification.title);
    })
  }

  private openToast(mensaje, titulo) {
    const opt = cloneDeep(this.options);
    opt.positionClass = 'toast-bottom-right';
    opt.toastClass =  'toast';
    opt.timeOut = 2000;
    const inserted = this.toastrService.show(mensaje, titulo, opt);
    const idModulo = Number(titulo.split(' ', 1)[0]);
    const colorModulo = this.modulosColor.find(m => m.id === idModulo);
    const color = colorModulo ? colorModulo.color : null;
    if(color) {
      this.renderer.setStyle(this.toastSISCOContainer.nativeElement.children[0].children[0], 'background-color', color)
    }
    if(inserted) {
      this.lastInserted[0] = (inserted.toastId);
    }
    return inserted;
  }
}
