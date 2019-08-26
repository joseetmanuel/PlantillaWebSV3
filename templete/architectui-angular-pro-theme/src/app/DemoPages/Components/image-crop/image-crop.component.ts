import {Component, OnInit, ViewChild} from '@angular/core';
import {ImageCroppedEvent, ImageCropperComponent} from 'ngx-image-cropper';

@Component({
  selector: 'app-image-crop',
  templateUrl: './image-crop.component.html',
})
export class ImageCropComponent implements OnInit {

  heading = 'Image Crop';
  subheading = 'You can easily crop and edit images with this Vue plugin.';
  icon = 'pe-7s-signal icon-gradient bg-malibu-beach';

  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper = false;

  @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    console.log(event);
  }

  imageLoaded() {
    this.showCropper = true;
    console.log('Image loaded');
  }

  cropperReady() {
    console.log('Cropper ready');
  }

  loadImageFailed() {
    console.log('Load failed');
  }

  rotateLeft() {
    this.imageCropper.rotateLeft();
  }

  rotateRight() {
    this.imageCropper.rotateRight();
  }

  flipHorizontal() {
    this.imageCropper.flipHorizontal();
  }

  flipVertical() {
    this.imageCropper.flipVertical();
  }

  ngOnInit() {
  }

}
