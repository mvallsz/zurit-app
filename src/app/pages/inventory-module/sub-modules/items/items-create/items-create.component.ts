import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  HostListener,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelect } from '@angular/material/select';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxFileDropEntry } from 'ngx-file-drop';
import { Router } from '@angular/router';

import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { stagger80ms } from '../../../../../../@vex/animations/stagger.animation';
import { fadeInUp400ms } from '../../../../../../@vex/animations/fade-in-up.animation';
import { scaleIn400ms } from '../../../../../../@vex/animations/scale-in.animation';
import { fadeInRight400ms } from '../../../../../../@vex/animations/fade-in-right.animation';

import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icClose from '@iconify/icons-ic/twotone-close';
import icRule from '@iconify/icons-ic/twotone-rule';

import { ServiceResponse } from '../../../../../interfaces/service-response.interface';
import { Supplier } from '../../suppliers/models/supplier.model';
import { IItemType, ItemType } from '../../item-types/models/itemType.model';
import { CATEGORIAS, MONEDAS, UNIDADES } from '../../../../../../static-data/constants/enums';

import { FileUploadService } from '../../../../../services/file-upload.service';
import { InventoryService } from '../../../../../services/modules/inventory-module/items/inventory.service';
import { SupplierService } from '../../../../../services/modules/inventory-module/suppliers/supplier.service';
import { ItemTypeService } from '../../../../../services/modules/inventory-module/item-types/item-type.service';

import Swal from 'sweetalert2';

const supplierFilterOptions = {
  multiple: true,
  autoComplete: true,
};

const itemTypesFilterOptions = {
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
  public exentoCtrl: FormControl = new FormControl(false);
  public costoCompraCtrl: FormControl = new FormControl('', [Validators.required]);
  public monedaCtrl: FormControl = new FormControl('', [Validators.required]);
  public marcaCtrl: FormControl = new FormControl('', [Validators.required]);
  public modeloCtrl: FormControl = new FormControl('');
  public skuCtrl: FormControl = new FormControl('');
  public categoriaCtrl: FormControl = new FormControl('', [Validators.required]);
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
  public invalidMsg = '';

  itemTypes: ItemType[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cd: ChangeDetectorRef,
    private supplierService: SupplierService,
    private fileUploadService: FileUploadService,
    private snackBar: MatSnackBar,
    private itemTypeService: ItemTypeService) {
  }

  ngOnInit() {

    this.categoriaItems = Object.keys(CATEGORIAS).map(key => ({ key, value: CATEGORIAS[key] }));
    this.monedaItems = Object.keys(MONEDAS).map(key => ({ key, value: MONEDAS[key] }));
    this.unidadItems = Object.keys(UNIDADES).map(key => ({ key, value: UNIDADES[key] }));

    this.itemFormGroup = this.fb.group({
      nombre: this.nombreCtrl,
      descripcion: this.descripcionCtrl,
      exento: this.exentoCtrl,
      costo_compra: this.costoCompraCtrl,
      moneda: this.monedaCtrl,
      marca: this.marcaCtrl,
      modelo: this.modeloCtrl,
      sku: this.skuCtrl,
      categoria: this.categoriaCtrl,
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

    this.itemTypeService.getItemTypes('', itemTypesFilterOptions).subscribe((resp: ServiceResponse) => {
      if (!resp.ok) {
        this.openSnackbar('Error cargando los tipos de artículos, por favor notifique al administrador del sistema e intente de nuevo más tarde.');
        return;
      }
      this.itemTypes = resp.data;
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
      this.invalidMsg = 'Por favor complete los campos requeridos.';
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
    this.spinner = true;
    let isValidForm = this.createItemValidation();

    if (isValidForm) {
      const item: IItemType = {
        nombre: this.nombreCtrl.value,
        descripcion: this.descripcionCtrl.value,
        exento: this.exentoCtrl.value,
        costo_compra: this.costoCompraCtrl.value,
        moneda: this.monedaCtrl.value,
        marca: this.marcaCtrl.value,
        modelo: this.modeloCtrl.value,
        sku: this.skuCtrl.value,
        categoria: this.categoriaCtrl.value,
        proveedor: this.suppliersCtrl.value,
        unidad: this.unidadCtrl.value,
        min_stock: this.minStockCtrl.value,
        max_stock: this.maxStockCtrl.value,
        ficha_tecnica: this.fichaTecnicaCtrl.value,
      };

      this.itemTypeService.createItemType(item).subscribe(async (resp: ServiceResponse) => {
        if (resp.ok) {

          try {

            const itemId = resp.data._id;

            const uploadPromises: Promise<any>[] = [];

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

            resp.data.imagenes = photoFileIds;

            const updateItemResult = await this.itemTypeService.updateItemType(itemId, resp.data).toPromise();

            if (updateItemResult.ok) {
              Swal.fire({
                title: 'Artículo registrado con exito en el sistema!!',
                text: 'Ya puedes agregar stock a este artículo.',
                icon: 'success',
                timer: 5000,
                showConfirmButton: true
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
      duration: 5000,
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

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.photoFiles.length > 0) {
      $event.returnValue = 'Tienes imágenes nuevas cargadas. Si no guardas, no se cargarán las imágenes nuevas.';
    }
  }
}
