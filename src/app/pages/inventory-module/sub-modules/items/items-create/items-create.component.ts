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
import { Router } from '@angular/router';

import { CATEGORIAS, MONEDAS, UNIDADES } from '../../../../../../static-data/constants/enums';
import Swal from 'sweetalert2';
import { ExpenseService } from 'src/app/services/modules/admin-module/expense.service';
const base_url = environment.base_url;

const supplierFilterOptions = {
  multiple: true,
  autoComplete: true,
};

@Component({
  selector: 'zurit-items-create',
  templateUrl: './items-create.component.html',
  styleUrls: ['./items-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    stagger80ms,
    fadeInUp400ms,
    scaleIn400ms,
    fadeInRight400ms
  ]
})

export class ItemsCreateComponent implements OnInit {

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

  icMoreVert = icMoreVert;
  icClose = icClose;
  icRule = icRule;

  public spinner = false;
  public files: NgxFileDropEntry[] = [];
  public photoFiles: NgxFileDropEntry[] = [];
  public itemsFiles: File[] = [];
  imagePreviews: string[] = [];

  public searching = false;
  invoiceFile: File;
  /** list of banks filtered after simulating server side search */

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cd: ChangeDetectorRef,
    private inventoryService: InventoryService,
    private supplierService: SupplierService,
    private expenseService: ExpenseService,
    private fileUploadService: FileUploadService,
    private snackbar: MatSnackBar) {
  }

  ngOnInit() {

    this.categoriaItems = Object.keys(CATEGORIAS).map(key => ({ key, value: CATEGORIAS[key] }));
    this.monedaItems = Object.keys(MONEDAS).map(key => ({ key, value: MONEDAS[key] }));
    this.unidadItems = Object.keys(UNIDADES).map(key => ({ key, value: UNIDADES[key] }));

    this.itemFormGroup = this.fb.group({
      nombre: this.nombreCtrl,
      descripcion: this.descripcionCtrl,
      lote: this.loteCtrl,
      fecha_vencimiento: this.fechaVencimientoCtrl,
      serial: this.serialCtrl,
      sku: this.skuCtrl,
      exento: this.exentoCtrl,
      costo_compra: this.costoCompraCtrl,
      moneda: this.monedaCtrl,
      marca: this.marcaCtrl,
      modelo: this.modeloCtrl,
      categoria: this.categoriaCtrl,
      cantidad: this.cantidadCtrl,
      unidad: this.unidadCtrl,
      min_stock: this.minStockCtrl,
      max_stock: this.maxStockCtrl,
      ficha_tecnica: this.fichaTecnicaCtrl,
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


  public createItemValidation() {
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
    this.spinner = true;
    let isValidForm = this.createItemValidation();

    if (isValidForm) {
      const item: IItem = {
        nombre: this.nombreCtrl.value,
        descripcion: this.descripcionCtrl.value,
        lote: this.loteCtrl.value,
        fecha_vencimiento: this.fechaVencimientoCtrl.value,
        serial: this.serialCtrl.value,
        sku: this.skuCtrl.value,
        codigo_uuid: '',
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
      };

      this.inventoryService.createItem(item).subscribe(async (resp: ServiceResponse) => {
        if (resp.ok) {

          try {

            const itemId = resp.data.item._id;
            const expense = resp.data.expense;

            const uploadPromises: Promise<any>[] = [];

            if (this.invoiceFile) {
              uploadPromises.push(this.fileUploadService.photoUpdate(this.invoiceFile, 'expenses', expense._id));
            }

            for (const file of this.photoFiles) {
              if (file.fileEntry.isFile) {
                const fileEntry = file.fileEntry as FileSystemFileEntry;
                const filePromise = new Promise<void>((resolve, reject) => {
                  fileEntry.file((file: File) => {
                    uploadPromises.push(this.fileUploadService.photoUpdate(file, 'items', itemId));
                    resolve();
                  }, reject);
                });
                await filePromise;
              }
            }

            const uploadResults = await Promise.all(uploadPromises);
            const fileIds = uploadResults.map(result => result.pathToFront); // Assuming the response contains the fileId
            const photoFileIds = fileIds.filter(id => id.includes('items'));
            const invoiceFileId = fileIds.find(id => id.includes('expenses'));

            resp.data.item.imagenes = photoFileIds;

            const updateItemResult = await this.inventoryService.updateItem(itemId, resp.data.item).toPromise();
            expense.factura = invoiceFileId;
            const updateExpenseResult = await this.expenseService.updateExpense(expense._id, expense).toPromise();

            if (updateItemResult.ok && updateExpenseResult.ok) {
              Swal.fire({
                title: 'Artículo registrado con exito en el sistema!!',
                icon: 'success',
                timer: 5000,
                showConfirmButton: true
              }).then(() => {
                this.router.navigate(['/app/items/']);
              });
            } else if (updateItemResult.ok && !updateExpenseResult.ok) {
              Swal.fire({
                title: 'Artículo registrado con exito en el sistema!!',
                text: 'Error registrando el documento de gasto, por favor notifique al administrador del sistema.',
                icon: 'warning',
                showConfirmButton: false
              }).then(() => {
                this.router.navigate(['/app/items/']);
              });

            } else {
              this.spinner = false;
              this.openSnackbar('Error registrando el artículo, por favor notifique al administrador del sistema e intente de nuevo más tarde.');
              this.cd.detectChanges();
            }


          } catch (error) {
            this.spinner = false;
            this.openSnackbar('Error registrando el artículo, por favor notifique al administrador del sistema e intente de nuevo más tarde.');
            this.cd.detectChanges();
          }


        } else {
          this.spinner = false;
          this.openSnackbar('Error registrando el artículo, por favor notifique al administrador del sistema e intente de nuevo más tarde.');
          this.cd.detectChanges();
        }
      });

    } else {
      this.spinner = false;
      this.openSnackbar('');
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
      duration: 5000,
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
