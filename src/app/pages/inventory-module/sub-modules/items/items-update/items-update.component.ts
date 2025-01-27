import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
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
import { Item, IItem } from '../models/item.model';
import { Supplier, ISupplier } from '../../suppliers/models/supplier.model';

import { FileUploadService } from '../../../../../services/file-upload.service';
import { InventoryService } from '../../../../../services/modules/inventory-module/items/inventory.service';
import { SupplierService } from '../../../../../services/modules/inventory-module/suppliers/supplier.service';

import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NgxFileDropEntry } from 'ngx-file-drop';
import { ActivatedRoute, Router } from '@angular/router';

import { CATEGORIAS, MONEDAS, UNIDADES } from '../../../../../../static-data/constants/enums';
import Swal from 'sweetalert2';
import { ExpenseService } from 'src/app/services/modules/admin-module/expense.service';
import { IncomeService } from 'src/app/services/modules/admin-module/income.service';
import { IIncome } from 'src/app/pages/admin-module/sub-modules/incomes/models/income.model';
import { escapeIdentifier } from '@angular/compiler/src/output/abstract_emitter';
const base_url = environment.base_url;

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

export class ItemsUpdateComponent implements OnInit {

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
  public loteCtrl: FormControl = new FormControl('');
  public fechaVencimientoCtrl: FormControl = new FormControl('');
  public serialCtrl: FormControl = new FormControl('');
  public skuCtrl: FormControl = new FormControl('');
  public exentoCtrl: FormControl = new FormControl(false);
  public costoCompraCtrl: FormControl = new FormControl('', [Validators.required]);
  public monedaCtrl: FormControl = new FormControl('', [Validators.required]);
  public marcaCtrl: FormControl = new FormControl('', [Validators.required]);
  public modeloCtrl: FormControl = new FormControl('');
  public categoriaCtrl: FormControl = new FormControl('', [Validators.required]);
  public cantidadCtrl: FormControl = new FormControl('', [Validators.required]);
  public unidadCtrl: FormControl = new FormControl('', [Validators.required]);
  public minStockCtrl: FormControl = new FormControl('', [Validators.required]);
  public maxStockCtrl: FormControl = new FormControl('', [Validators.required]);
  public fichaTecnicaCtrl: FormControl = new FormControl('');
  public imagenCtrl: FormControl = new FormControl('');

  protected _onDestroy = new Subject<void>();

  itemFormGroup: FormGroup;
  item: IItem;
  icMoreVert = icMoreVert;
  icClose = icClose;
  icRule = icRule;

  public spinner = false;
  public files: NgxFileDropEntry[] = [];
  public photoFiles: NgxFileDropEntry[] = [];
  public itemsFiles: File[] = [];
  imagePreviews: any[] = [];
  imageBlob: any[] = [];
  imageOriginal: any[] = [];

  public searching = false;
  invoiceFile: File;
  needInvoice = false;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private inventoryService: InventoryService,
    private supplierService: SupplierService,
    private expenseService: ExpenseService,
    private incomeService: IncomeService,
    private fileUploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    private snackbar: MatSnackBar) {
  }

  ngOnInit() {

    this.categoriaItems = Object.keys(CATEGORIAS).map(key => ({ key, value: CATEGORIAS[key] }));
    this.monedaItems = Object.keys(MONEDAS).map(key => ({ key, value: MONEDAS[key] }));
    this.unidadItems = Object.keys(UNIDADES).map(key => ({ key, value: UNIDADES[key] }));

    this.itemFormGroup = this.fb.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      lote: [''],
      fecha_vencimiento: [''],
      serial: [''],
      sku: [''],
      exento: [false],
      costo_compra: ['', [Validators.required]],
      moneda: ['', [Validators.required]],
      marca: ['', [Validators.required]],
      modelo: [''],
      categoria: ['', [Validators.required]],
      proveedor: ['', [Validators.required]],
      cantidad: ['', [Validators.required]],
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

    this.cd.detectChanges();

  }

  loadItem(itemId: string) {
    this.inventoryService.getItemById(itemId).subscribe(async (response: ServiceResponse) => {
      if (response.ok) {
        this.item = response.data[0];

        this.nombreCtrl.setValue(this.item.nombre);
        this.descripcionCtrl.setValue(this.item.descripcion);
        this.loteCtrl.setValue(this.item.lote);
        this.fechaVencimientoCtrl.setValue(this.item.fecha_vencimiento);
        this.serialCtrl.setValue(this.item.serial);
        this.skuCtrl.setValue(this.item.sku);
        this.exentoCtrl.setValue(this.item.exento);
        this.costoCompraCtrl.setValue(this.item.costo_compra);
        this.monedaCtrl.setValue(this.item.moneda.toString());
        this.marcaCtrl.setValue(this.item.marca);
        this.modeloCtrl.setValue(this.item.modelo);
        this.categoriaCtrl.setValue(this.item.categoria.toString());
        this.suppliersCtrl.setValue(this.item.proveedor._id);
        this.cantidadCtrl.setValue(this.item.cantidad);
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
    this.inventoryService.updateItem(this.item._id, new Item(this.item)).subscribe(
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
    this.itemsFiles = [];
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
      'INVALID' === this.cantidadCtrl.status ||
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
      if (this.cantidadCtrl.invalid) {
        this.cantidadCtrl.setErrors({ 'invalid': true });
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
      formOk = false;

    }
    return formOk;
  }

  async submit() {
    if (this.updateItemValidation()) {

      const originalQuantity = this.item.cantidad;
      const originalCost = this.item.costo_compra;
      const originalCurrency = this.item.moneda;

      const newCost = this.costoCompraCtrl.value;
      const newQuantity = this.cantidadCtrl.value;
      const newCurrency = this.monedaCtrl.value;

      let updatedItem: IItem = {
        nombre: this.nombreCtrl.value,
        descripcion: this.descripcionCtrl.value,
        lote: this.loteCtrl.value,
        fecha_vencimiento: this.fechaVencimientoCtrl.value,
        serial: this.serialCtrl.value,
        sku: this.skuCtrl.value,
        exento: this.exentoCtrl.value,
        costo_compra: this.costoCompraCtrl.value,
        moneda: this.monedaCtrl.value,
        marca: this.marcaCtrl.value,
        modelo: this.modeloCtrl.value,
        categoria: this.categoriaCtrl.value,
        proveedor: this.suppliersCtrl.value,
        cantidad: this.cantidadCtrl.value,
        unidad: this.unidadCtrl.value,
        min_stock: this.minStockCtrl.value,
        max_stock: this.maxStockCtrl.value,
        ficha_tecnica: this.fichaTecnicaCtrl.value,
        estado: newQuantity === 0 ? '3' : newQuantity < this.minStockCtrl.value ? '4' : this.item.estado,
        createdBy: this.item.createdBy
      };


      if (newQuantity < 0 || newCost < 0) {
        this.openSnackbar('Los valores de cantidad y costo de compra deben ser mayores a 0');
        return;
      }

      if (newQuantity > originalQuantity && !this.invoiceFile) {
        this.needInvoice = true;
        this.openSnackbar('Por favor, es necesario adjuntar una factura para justificar el aumento de stock');
        return;
      }

      if (newCurrency !== originalCurrency.toString() && newCost === originalCost) {
        this.openSnackbar('Debe ingresar un nuevo costo de compra si cambia la moneda');
        return;
      }

      this.inventoryService.updateItem(this.item._id, new Item(updatedItem)).subscribe(async (response: ServiceResponse) => {
        if (response.ok) {

          const item = response.data;
          let expense;
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

          if (newQuantity < originalQuantity) {
            const incomeData: IIncome = {
              tipo: '2',
              fecha: new Date(),
              items: [{
                itemId: this.item._id,
                cantidad: originalQuantity - newQuantity,
                precio: originalCost,
                moneda: originalCurrency
              }],
              total: (originalQuantity - newQuantity) * originalCost,
              estado: 1
            };
            await this.incomeService.createIncome(incomeData).toPromise();
          } else if (newQuantity > originalQuantity) {

            const expenseData = {
              descripcion: `Adjustment for item: ${updatedItem.nombre}, quantity increased from ${originalQuantity} to ${newQuantity}`,
              monto: (newQuantity - originalQuantity) * newCost,
              moneda: newCurrency,
              categoria: 1,
              createdBy: updatedItem.createdBy,
              justificacion: 'Stock adjustment',
              estado: 1
            };

            const expenseResponse = await this.expenseService.createExpense(expenseData).toPromise();
            expense = expenseResponse.data;

            if (this.invoiceFile) {
              uploadPromises.push(this.fileUploadService.photoUpdate(this.invoiceFile, 'expenses', expense._id));
            }

          }

          const uploadResults = await Promise.all(uploadPromises);

          const fileIds = uploadResults.map(result => result.pathToFront); // Assuming the response contains the fileId
          const photoFileIds = fileIds.filter(id => id.includes('items'));
          const invoiceFileId = fileIds.find(id => id.includes('expenses'));

          let updateItemResp;
          let updateExpenseResp;
          if (photoFileIds.length > 0) {
            if (item.imagenes.length > 0) {
              item.imagenes = item.imagenes.concat(photoFileIds);
            } else {
              item.imagenes = photoFileIds;
            }
            updateItemResp = await this.inventoryService.updateItem(item._id, item).toPromise();
          }

          if (invoiceFileId) {
            updateExpenseResp = await this.expenseService.updateExpense(expense._id, expense).toPromise();


            if (updateItemResp.ok && updateExpenseResp.ok) {
              Swal.fire({
                title: 'Artículo actualizado con éxito!!',
                icon: 'success',
                timer: 5000,
                showConfirmButton: true
              }).then(() => {
                this.router.navigate(['/app/items/']);
              });

            } else if (updateItemResp.ok && !updateExpenseResp.ok) {
              Swal.fire({
                title: 'Artículo actualizado con exito en el sistema!!',
                text: 'Error registrando el documento de gasto, por favor notifique al administrador del sistema.',
                icon: 'warning',
                showConfirmButton: false
              }).then(() => {
                this.router.navigate(['/app/items/']);
              });

            } else {
              this.spinner = false;
              this.openSnackbar('Error actualizando el artículo, por favor notifique al administrador del sistema e intente de nuevo más tarde.');
              this.cd.detectChanges();
            }
          } else {
            Swal.fire({
              title: 'Artículo actualizado con éxito!!',
              icon: 'success',
              timer: 5000,
              showConfirmButton: true
            }).then(() => {
              this.router.navigate(['/app/items/']);
            });
          }
        } else {
          this.spinner = false;
          this.openSnackbar('Error actualizando el artículo, por favor notifique al administrador del sistema e intente de nuevo más tarde.');
          this.cd.detectChanges();
        }
      });
    } else {
      this.spinner = false;
      this.openSnackbar('Por favor, complete los campos requeridos');
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
    this.snackbar.open(message, 'CLOSE', {
      duration: 10000,
      horizontalPosition: 'right'
    });
  }

  public dropped(files: NgxFileDropEntry[]) {
    if (files.length > 0 && files[0].fileEntry.isFile) {
      const fileEntry = files[0].fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {
        this.invoiceFile = file;
      });
    }
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
