import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
  HostListener,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelect } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { stagger80ms } from '../../../../../../@vex/animations/stagger.animation';
import { fadeInUp400ms } from '../../../../../../@vex/animations/fade-in-up.animation';
import { scaleIn400ms } from '../../../../../../@vex/animations/scale-in.animation';
import { fadeInRight400ms } from '../../../../../../@vex/animations/fade-in-right.animation';

import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icClose from '@iconify/icons-ic/twotone-close';
import icRule from '@iconify/icons-ic/twotone-rule';
import { environment } from '../../../../../../environments/environment';

import { ServiceResponse } from '../../../../../interfaces/service-response.interface';

import { ItemType, IItemType } from '../../item-types/models/itemType.model';
import { Supplier } from '../../suppliers/models/supplier.model';

import { FileUploadService } from '../../../../../services/file-upload.service';
import { SupplierService } from '../../../../../services/modules/inventory-module/suppliers/supplier.service';

import { Observable, ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NgxFileDropEntry } from 'ngx-file-drop';
import { ActivatedRoute, Router } from '@angular/router';

import { CATEGORIAS, MONEDAS, UNIDADES } from '../../../../../../static-data/constants/enums';
import Swal from 'sweetalert2';
import { ItemTypeService } from 'src/app/services/modules/inventory-module/item-types/item-type.service';

import { CanComponentDeactivate } from '../../../../../guards/unsaved-changes';


const supplierFilterOptions = {
  multiple: true,
  autoComplete: true,
};

@Component({
  selector: 'zurit-items-update',
  templateUrl: './items-update.component.html',
  styleUrls: ['./items-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    stagger80ms,
    fadeInUp400ms,
    scaleIn400ms,
    fadeInRight400ms
  ]
})

export class ItemsUpdateComponent implements OnInit, OnDestroy, CanComponentDeactivate {

  layoutCtrl = new FormControl("boxed");

  categoriaItems: { key: string, value: any }[] = [];
  monedaItems: { key: string, value: any }[] = [];
  unidadItems: { key: string, value: any }[] = [];

  protected suppliers: Supplier[] = [];
  public suppliersCtrl: FormControl = new FormControl();
  public suppliersFilterCtrl: FormControl = new FormControl('', [Validators.required]);
  public filteredSuppliers: ReplaySubject<Supplier[]> = new ReplaySubject<Supplier[]>(0);
  @ViewChild('suppliersSelect', { static: true }) suppliersSelect: MatSelect;

  public nombreCtrl: FormControl = new FormControl('', [Validators.required]);
  public descripcionCtrl: FormControl = new FormControl('', [Validators.required]);
  public exentoCtrl: FormControl = new FormControl(false);
  public costoCompraCtrl: FormControl = new FormControl('', [Validators.required]);
  public monedaCtrl: FormControl = new FormControl('', [Validators.required]);
  public marcaCtrl: FormControl = new FormControl('', [Validators.required]);
  public modeloCtrl: FormControl = new FormControl('');
  public categoriaCtrl: FormControl = new FormControl('', [Validators.required]);
  public unidadCtrl: FormControl = new FormControl('', [Validators.required]);
  public minStockCtrl: FormControl = new FormControl('', [Validators.required]);
  public maxStockCtrl: FormControl = new FormControl('', [Validators.required]);
  public fichaTecnicaCtrl: FormControl = new FormControl('');
  public imagenCtrl: FormControl = new FormControl('');

  protected _onDestroy = new Subject<void>();

  itemFormGroup: FormGroup;
  item: IItemType;
  icMoreVert = icMoreVert;
  icClose = icClose;
  icRule = icRule;

  public spinner = false;
  public files: NgxFileDropEntry[] = [];
  public photoFiles: NgxFileDropEntry[] = [];

  imagePreviews: any[] = [];
  imageBlob: any[] = [];
  imageOriginal: any[] = [];

  public searching = false;
  invalidMsg: string;
  photoLoad = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private itemTypeService: ItemTypeService,
    private supplierService: SupplierService,
    private fileUploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    private snackBar: MatSnackBar) {
  }

  ngOnInit() {

    this.categoriaItems = Object.keys(CATEGORIAS).map(key => ({ key, value: CATEGORIAS[key] }));
    this.monedaItems = Object.keys(MONEDAS).map(key => ({ key, value: MONEDAS[key] }));
    this.unidadItems = Object.keys(UNIDADES).map(key => ({ key, value: UNIDADES[key] }));

    this.itemFormGroup = this.fb.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      exento: [false],
      costo_compra: ['', [Validators.required]],
      moneda: ['', [Validators.required]],
      marca: ['', [Validators.required]],
      modelo: [''],
      categoria: ['', [Validators.required]],
      proveedor: ['', [Validators.required]],
      unidad: ['', [Validators.required]],
      min_stock: ['', [Validators.required]],
      max_stock: ['', [Validators.required]],
      ficha_tecnica: [''],
      imagenes: [[]],
    });

    this.route.params.subscribe(params => {
      const itemId = params['id'];
      this.loadItem(itemId);
    });

    this.supplierService.getSuppliers('', supplierFilterOptions).subscribe(
      (resp: ServiceResponse) => {

        this.suppliers = resp.data;
        this.filteredSuppliers.next(this.suppliers.slice());
        this.suppliersFilterCtrl.valueChanges
          .pipe(takeUntil(this._onDestroy))
          .subscribe(() => {
            this.filterSuppliers();
          });
      });

    // Add beforeunload event listener
    window.addEventListener('beforeunload', this.unloadNotification.bind(this));


    this.cd.detectChanges();

  }

  ngOnDestroy(): void {
    // Remove beforeunload event listener
    window.removeEventListener('beforeunload', this.unloadNotification.bind(this));
  }

  unloadNotification(event: BeforeUnloadEvent): void {
    if (this.photoFiles.length > 0 && !this.photoLoad) {
      event.preventDefault();
      this.openSnackbar('Tienes imágenes nuevas cargadas. Si no guardas, no se cargarán las imágenes nuevas.');
    }
  }

  canDeactivate(): Observable<boolean> | boolean {
    if (this.photoFiles.length > 0 && !this.photoLoad) {
      return new Observable<boolean>((observer) => {
        Swal.fire({
          title: '¿Estás seguro?',
          text: 'Tienes imágenes nuevas cargadas. Si no guardas, no se cargarán las imágenes nuevas.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sí, quiero salir',
          cancelButtonText: 'No, quédate en el formulario de edición',

        }).then((result) => {
          if (result.isConfirmed) {
            observer.next(true);
          } else {
            observer.next(false);
          }
          observer.complete();
        });
      });
    }
    return true;
  }

  loadItem(itemId: string) {
    this.itemTypeService.getItemTypeById(itemId).subscribe(async (response: ServiceResponse) => {
      if (response.ok) {
        this.item = response.data[0];

        this.nombreCtrl.setValue(this.item.nombre);
        this.descripcionCtrl.setValue(this.item.descripcion);
        this.exentoCtrl.setValue(this.item.exento);
        this.costoCompraCtrl.setValue(this.item.costo_compra);
        this.monedaCtrl.setValue(this.item.moneda.toString());
        this.marcaCtrl.setValue(this.item.marca);
        this.modeloCtrl.setValue(this.item.modelo);
        this.categoriaCtrl.setValue(this.item.categoria.toString());
        this.suppliersCtrl.setValue(this.item.proveedor._id);
        this.unidadCtrl.setValue(this.item.unidad.toString());
        this.minStockCtrl.setValue(this.item.min_stock);
        this.maxStockCtrl.setValue(this.item.max_stock);
        this.fichaTecnicaCtrl.setValue(this.item.ficha_tecnica);

        try {
          const imagePromises = this.item.imagenes.map(image => this.loadImage(`${image.replace('uploads', 'files')}`));
          const imageUrls = await Promise.all(imagePromises);
          this.imagePreviews = imageUrls.map(url => url.url_sana);
          this.imageBlob = imageUrls.map(url => url.url_blob);
          this.imageOriginal = imageUrls.map(url => url.originalPath);

        } catch (error) {
          this.openSnackbar('Error loading images');
        }
        this.cd.detectChanges();
      } else {
        this.openSnackbar('Error loading item data');
      }
    });
  }

  loadImage(imagePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.fileUploadService.getImagePath(imagePath).subscribe((blob) => {
        const urls = { url_sana: this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob)), url_blob: URL.createObjectURL(blob), originalPath: imagePath };
        resolve(urls);
      }, error => {
        reject(error);
      });
    });
  }
  openImageInNewWindow(index) {
    window.open(this.imageBlob[index], '_blank');
  }

  removeImage(index: number) {

    const imageIndex = this.item.imagenes.findIndex(image => image === this.imageOriginal[index]);

    this.imagePreviews.splice(index, 1);
    this.imageBlob.splice(index, 1);
    this.item.imagenes.splice(imageIndex, 1);
    this.itemTypeService.updateItemType(this.item._id, new ItemType(this.item)).subscribe(
      (response: ServiceResponse) => {
        if (response.ok) {
          this.fileUploadService.deleteFile(this.imageOriginal[index]).subscribe(
            (resp: ServiceResponse) => {
              if (resp.ok) {
                this.openSnackbar('Imagen eliminada con éxito');
              } else {
                this.openSnackbar('Error al eliminar la imagen');
              }
            },
            (error) => {
              this.openSnackbar('Error al eliminar la imagen');
            }
          );
        } else {
          this.openSnackbar('Error al eliminar la imagen');
        }
      },
      (error) => {
        this.openSnackbar('Error al eliminar la imagen');
      }
    );
    this.cd.detectChanges();

  }

  protected filterSuppliers() {
    if (!this.suppliers) {
      return;
    }
    let search = this.suppliersFilterCtrl.value;
    if (!search) {
      this.filteredSuppliers.next(this.suppliers.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredSuppliers.next(
      this.suppliers.filter(supplier => supplier.nombre.toLowerCase().indexOf(search) > -1)
    );
  }


  // FORM FUNCTIONS

  resetItemFormGroup() {
    this.itemFormGroup.reset();
    this.suppliersCtrl.reset();
    this.imagenCtrl.reset();
  }


  public updateItemValidation() {
    let formOk = true;
    if (
      'INVALID' === this.nombreCtrl.status ||
      'INVALID' === this.descripcionCtrl.status ||
      'INVALID' === this.costoCompraCtrl.status ||
      'INVALID' === this.monedaCtrl.status ||
      'INVALID' === this.suppliersCtrl.status ||
      'INVALID' === this.marcaCtrl.status ||
      'INVALID' === this.categoriaCtrl.status ||
      'INVALID' === this.unidadCtrl.status ||
      'INVALID' === this.minStockCtrl.status ||
      'INVALID' === this.maxStockCtrl.status) {

      if (this.nombreCtrl.invalid) {
        this.nombreCtrl.setErrors({ 'invalid': true });
      }
      if (this.descripcionCtrl.invalid) {
        this.descripcionCtrl.setErrors({ 'invalid': true });
      }
      if (this.costoCompraCtrl.invalid) {
        this.costoCompraCtrl.setErrors({ 'invalid': true });
      }
      if (this.marcaCtrl.invalid) {
        this.marcaCtrl.setErrors({ 'invalid': true });
      }
      if (this.categoriaCtrl.invalid) {
        this.categoriaCtrl.setErrors({ 'invalid': true });
      }
      if (this.unidadCtrl.invalid) {
        this.unidadCtrl.setErrors({ 'invalid': true });
      }
      if (this.minStockCtrl.invalid) {
        this.minStockCtrl.setErrors({ 'invalid': true });
      }
      if (this.maxStockCtrl.invalid) {
        this.maxStockCtrl.setErrors({ 'invalid': true });
      }
      if (this.monedaCtrl.invalid) {
        this.monedaCtrl.setErrors({ 'invalid': true });
      }
      if (this.suppliersCtrl.invalid) {
        this.suppliersCtrl.setErrors({ 'invalid': true });
      }
      this.invalidMsg = 'Por favor, complete los campos requeridos.';
      formOk = false;

    }

    if (this.costoCompraCtrl.value < 0) {
      this.costoCompraCtrl.setErrors({ 'invalid': true });
      this.invalidMsg = 'El costo de compra no puede ser menor a 0.';
      formOk = false;
    }

    if (this.minStockCtrl.value > this.maxStockCtrl.value) {
      this.minStockCtrl.setErrors({ 'invalid': true });
      this.maxStockCtrl.setErrors({ 'invalid': true });
      this.invalidMsg = 'El stock mínimo no puede ser mayor al stock máximo.';
      formOk = false;
    }


    return formOk;
  }

  async submit() {
    if (this.updateItemValidation()) {

      const originalCost = this.item.costo_compra;
      const originalCurrency = this.item.moneda;

      const newCost = this.costoCompraCtrl.value;
      const newCurrency = this.monedaCtrl.value;


      let updatedItem: IItemType = {
        nombre: this.nombreCtrl.value,
        descripcion: this.descripcionCtrl.value,
        exento: this.exentoCtrl.value,
        costo_compra: this.costoCompraCtrl.value,
        moneda: this.monedaCtrl.value,
        marca: this.marcaCtrl.value,
        modelo: this.modeloCtrl.value,
        categoria: this.categoriaCtrl.value,
        proveedor: this.suppliersCtrl.value,
        unidad: this.unidadCtrl.value,
        min_stock: this.minStockCtrl.value,
        max_stock: this.maxStockCtrl.value,
        ficha_tecnica: this.fichaTecnicaCtrl.value,
        createdBy: this.item.createdBy
      };


      if (newCurrency !== originalCurrency.toString() && newCost === originalCost) {
        this.openSnackbar('Debe ingresar un nuevo costo de compra si cambia la moneda');
        return;
      }

      this.itemTypeService.updateItemType(this.item._id, new ItemType(updatedItem)).subscribe(async (response: ServiceResponse) => {
        if (response.ok) {

          const item = response.data;
          const uploadPromises: Promise<any>[] = [];

          for (const file of this.photoFiles) {
            if (file.fileEntry.isFile) {
              const fileEntry = file.fileEntry as FileSystemFileEntry;
              const filePromise = new Promise<void>((resolve, reject) => {
                fileEntry.file((file: File) => {
                  uploadPromises.push(this.fileUploadService.photoUpdate(file, 'items', item._id));
                  resolve();
                }, reject);
              });
              await filePromise;
            }
          }

          const uploadResults = await Promise.all(uploadPromises);

          const fileIds = uploadResults.map(result => result.pathToFront); // Assuming the response contains the fileId
          const photoFileIds = fileIds.filter(id => id.includes('items'));

          let updateItemResp;
          if (photoFileIds.length > 0) {
            if (item.imagenes.length > 0) {
              item.imagenes = item.imagenes.concat(photoFileIds);
            } else {
              item.imagenes = photoFileIds;
            }
            updateItemResp = await this.itemTypeService.updateItemType(item._id, item).toPromise();
          }


          if (updateItemResp.ok) {
            this.photoLoad = true;
            Swal.fire({
              title: 'Artículo actualizado con éxito!!',
              icon: 'success',
              timer: 5000,
              showConfirmButton: true
            }).then(() => {
              this.router.navigate(['/app/items/']);
            });

          } else {
            this.spinner = false;
            this.openSnackbar('Error actualizando el artículo, por favor notifique al administrador del sistema e intente de nuevo más tarde.');
            this.cd.detectChanges();
          }
        } else {
          this.spinner = false;
          this.openSnackbar('Error actualizando el artículo, por favor notifique al administrador del sistema e intente de nuevo más tarde.');
          this.cd.detectChanges();
        }
      });
    } else {
      this.spinner = false;
      this.openSnackbar(this.invalidMsg);
    }
  }
  // UTILITY FUNCTIOS

  keyPressNumbersWithDecimal(event, input: string) {

    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode !== 46 && charCode > 31
      && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }

    if (charCode === 46) {
      const index = this.itemFormGroup.get(input).value.indexOf('.');
      if (index > 0) {
        event.preventDefault();
        return false;
      }
    }
    return true;
  }

  keyPressNumbersWithDecimalFC(event, input: FormControl) {

    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode !== 46 && charCode > 31
      && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }

    if (charCode === 46) {
      const index = input.value.indexOf('.');
      if (index > 0) {
        event.preventDefault();
        return false;
      }
    }
    return true;
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, 'CERRAR', {
      duration: 10000,
      horizontalPosition: 'right'
    });
  }


  public photoDropped(files: NgxFileDropEntry[]) {
    this.photoFiles = this.photoFiles.concat(files);
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imagePreviews.push(e.target.result);
            this.cd.detectChanges();
          };
          reader.readAsDataURL(file);
        });
      }
    }
  }


}
