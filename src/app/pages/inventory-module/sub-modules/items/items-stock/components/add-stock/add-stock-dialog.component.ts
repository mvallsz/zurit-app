import { ChangeDetectorRef, Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { FormControl, Validators, FormBuilder, FormGroup, FormArray } from "@angular/forms";
import { UntilDestroy } from "@ngneat/until-destroy";
import { InventoryService } from "src/app/services/modules/inventory-module/items/inventory.service";
import { STOCK_ESTADOS, MONEDAS, CATEGORIAS } from "src/static-data/constants/enums";
import { Item, IItem } from "../../../models/item.model";

@UntilDestroy()
@Component({
  selector: 'zurit-add-stock-dialog',
  templateUrl: './add-stock-dialog.component.html',
  styleUrls: ['./add-stock-dialog.component.scss']
})
export class AddStockDialogComponent implements OnInit {


  quantity: number;
  itemTypeId: string;
  category: number;
  groupEntries: boolean = false;
  repeatFirstItem: boolean = false;
  repeatSerial: boolean = false;

  formControls: {
    lote: FormControl;
    fecha_vencimiento: FormControl;
    costo_compra: FormControl;
    moneda: FormControl;
    exento: FormControl;
    serial: FormControl;
  }[] = [];

  MONEDAS = MONEDAS;
  CATEGORIAS = CATEGORIAS;

  itemForm: FormGroup;
  globalForm: FormGroup;

  repeatableFields: string[] = ['lote', 'fecha_vencimiento', 'costo_compra', 'moneda', 'exento', 'serial'];

  selectedRepeatableFields: boolean[] = [];
  itemFormFields: { field: string; showInIndividual: boolean }[] = [];

  public noneIndividuals = false;

  constructor(
    public dialogRef: MatDialogRef<AddStockDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private itemsService: InventoryService,
    private snackBar: MatSnackBar,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.quantity = data.quantity;
    this.itemTypeId = data.itemTypeId;
    this.category = +data.itemCategory;
  }

  ngOnInit() {

    if (this.category !== 1) {
      this.repeatableFields = this.repeatableFields.filter(field => field !== 'fecha_vencimiento' && field !== 'lote');
    }

    this.globalForm = this.fb.group({
      lote: [''],
      fecha_vencimiento: [''],
      costo_compra: ['', Validators.required],
      moneda: ['', Validators.required],
      exento: [false],
      serial: ['']
    });

    this.itemForm = this.fb.group({
      repeatableFields: this.fb.array(this.repeatableFields.map(() => false)),
      items: this.fb.array(this.createItemForms(this.quantity))
    });

    this.selectedRepeatableFields = new Array(this.repeatableFields.length).fill(false);

    this.setItemFormFields();

    this.cd.detectChanges();
  }

  createItemForms(quantity: number): FormGroup[] {
    const forms = [];
    for (let i = 0; i < quantity; i++) {
      const formGroupConfig: any = {};
      this.repeatableFields.forEach(field => {
        formGroupConfig[field] = [''];
      });
      forms.push(this.fb.group(formGroupConfig));
    }
    return forms;
  }

  saveStock() {
    if (this.itemForm.valid && this.globalForm.valid) {
      const itemsFormArray = this.itemForm.get('items') as FormArray;
      let itemsToCreate: IItem[] = [];

      const globalValues = this.globalForm.value;
      const repeatableFields = (this.itemForm.get('repeatableFields') as FormArray).value;

      itemsToCreate = itemsFormArray.controls.map((control: FormGroup) => {
        const itemValues = {
          itemTypeId: this.itemTypeId,
          lote: control.get('lote') ? control.get('lote').value : '',
          fecha_vencimiento: control.get('fecha_vencimiento') ? control.get('fecha_vencimiento').value : '',
          serial: control.get('serial') ? control.get('serial').value : '',
        };

        repeatableFields.forEach((repeat, index) => {
          if (repeat) {
            const fieldName = this.repeatableFields[index];
            itemValues[fieldName] = globalValues[fieldName];
          }
        });

        return itemValues;
      });

      Promise.all(itemsToCreate.map(item => this.itemsService.createItem(item).toPromise()))
        .then(responses => {
          if (responses.every(resp => resp.ok)) {
            this.openSnackbar('Items agregados correctamente');
            this.dialogRef.close();
          } else {
            this.openSnackbar('Error al agregar items');
          }
        })
        .catch(error => {
          this.openSnackbar('Error al agregar items');
        });
    } else {
      this.openSnackbar('Por favor, complete todos los campos correctamente.');
    }
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, "OK", {
      duration: 5000,
      horizontalPosition: "right",
    });
  }

  showLoteAndFechaVencimiento(): boolean {
    return this.category !== 1;
  }

  toggleRepeatableField(index: number) {
    this.selectedRepeatableFields[index] = !this.selectedRepeatableFields[index];

    if (this.selectedRepeatableFields.every(value => value)) {
      this.noneIndividuals = true;
    } else {
      this.noneIndividuals = false;
    }
    this.setItemFormFields();
  }

  toggleAllRepeatableFields() {
    //this.selectedRepeatableFields = this.selectedRepeatableFields.map(() => !this.selectedRepeatableFields.every(selected => selected));
    const allSelected = this.selectedRepeatableFields.every(selected => selected);
    this.selectedRepeatableFields.forEach((_, index) => {
      const control = this.getRepeatableFieldControl(index);
      if (allSelected) {
      control.setValue(false);
      this.selectedRepeatableFields[index] = false;
      } else {
      control.setValue(true);
      this.selectedRepeatableFields[index] = true;
      }
    });
    if (this.selectedRepeatableFields.every(value => value)) {
      this.noneIndividuals = true;
    } else {
      this.noneIndividuals = false;
    }
    this.setItemFormFields();
  }

  getFormControl(field: string, formGroup: FormGroup): FormControl {
    return formGroup.get(field) as FormControl;
  }

  getRepeatableFieldControl(index: number): FormControl {
    const repeatableFieldsArray = this.itemForm.get('repeatableFields') as FormArray;
    return repeatableFieldsArray.at(index) as FormControl;
  }

  getItemFormArray(): FormArray {
    return this.itemForm.get('items') as FormArray;
  }

  isSelectedRepeatableField(field: string): boolean {
    const index = this.repeatableFields.indexOf(field);
    return index !== -1 ? this.selectedRepeatableFields[index] : false;
  }

  setItemFormFields() {
    const itemFormArray = this.getItemFormArray();
    if (itemFormArray && itemFormArray.controls.length > 0) {
      const firstFormGroup = itemFormArray.controls[0] as FormGroup;
      this.itemFormFields = Object.keys(firstFormGroup.controls).map(field => {
        const isRepeatable = this.repeatableFields.includes(field);
        const isSelected = this.isSelectedRepeatableField(field);
        return {
          field: field,
          showInIndividual: !isRepeatable || !isSelected
        };
      });
    } else {
      this.itemFormFields = [];
    }
  }
}
