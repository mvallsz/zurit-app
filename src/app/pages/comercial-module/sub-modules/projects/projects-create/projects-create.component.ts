import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog'; // Import MatDialog

import { ProjectService } from 'src/app/services/modules/comercial-module/projects/projects.service';
import { ClientsService } from 'src/app/services/modules/comercial-module/clients/clients.service';
import { ItemTypeService } from 'src/app/services/modules/inventory-module/item-types/item-type.service'; // Import ItemTypeService

import { IClient } from '../../clients/models/client.model';

import { stagger80ms } from 'src/@vex/animations/stagger.animation';
import { fadeInUp400ms } from 'src/@vex/animations/fade-in-up.animation';
import { scaleIn400ms } from 'src/@vex/animations/scale-in.animation';
import { fadeInRight400ms } from 'src/@vex/animations/fade-in-right.animation';
import { TableColumn } from '../../../../../../@vex/interfaces/table-column.interface';

import { Observable, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';

import { IItemType } from '../../../../inventory-module/sub-modules/item-types/models/itemType.model';

import icAdd from '@iconify/icons-ic/twotone-add';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icEdit from '@iconify/icons-ic/twotone-edit'; // Import edit icon
import icMoreHoriz from "@iconify/icons-ic/twotone-more-horiz";
import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icDownload from '@iconify/icons-ic/twotone-download';

import * as XLSX from 'xlsx';
import { NgxFileDropEntry } from 'ngx-file-drop';
import Swal from 'sweetalert2';

import { CATEGORIAS, UNIDADES, TIPOS_PROYECTO } from '../../../../../../static-data/constants/enums';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { Project } from '../models/project.model';


export interface ItemsReq extends IItemType {
  cantidad: number;
}

@Component({
  selector: 'vex-projects-create',
  templateUrl: './projects-create.component.html',
  styleUrls: ['./projects-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    stagger80ms,
    fadeInUp400ms,
    scaleIn400ms,
    fadeInRight400ms
  ]
})
export class ProjectsCreateComponent implements OnInit, OnDestroy {

  layoutCtrl = new FormControl('boxed');
  clients: IClient[] = [];
  estados: string[] = ['Activo', 'Inactivo', 'Pendiente'];

  editItemReqFlag = false;

  nombreCtrl = new FormControl('', [Validators.required]);
  fechaInicioCtrl = new FormControl('', [Validators.required]);
  fechaFinCtrl = new FormControl('', [Validators.required]);

  clientSearchCtrl = new FormControl('');
  filteredClients: IClient[] = [];
  private _onDestroy$ = new Subject<void>();

  // items requested
  categoriaItems: { key: string, value: any }[] = [];
  unidadItems: { key: string, value: any }[] = [];
  tiposProyecto: { key: string, value: any }[] = [];

  UNIDADES = UNIDADES;
  CATEGORIAS = CATEGORIAS;
  TIPOS_PROYECTO = TIPOS_PROYECTO;

  public nombreItemCtrl: FormControl = new FormControl('', [Validators.required]);
  public marcaCtrl: FormControl = new FormControl('');
  public descripcionCtrl: FormControl = new FormControl('');
  public modeloCtrl: FormControl = new FormControl('');
  public categoriaCtrl: FormControl = new FormControl('', [Validators.required]);
  public tipoCtrl: FormControl = new FormControl('', [Validators.required]);
  public unidadCtrl: FormControl = new FormControl('', [Validators.required]);
  public cantidadCtrl: FormControl = new FormControl(1, [Validators.required]);

  itemsReq: ItemsReq[] = [];
  columns: TableColumn<ItemsReq>[] = [
      { label: 'Nombre', property: 'nombre', type: 'text', visible: true, cssClasses: ['font-medium'] },
      { label: 'Descripción', property: 'descripcion', type: 'text', visible: true },
      { label: 'Marca', property: 'marca', type: 'text', visible: true },
      { label: 'Modelo', property: 'modelo', type: 'text', visible: true },
      { label: 'Categoria', property: 'categoria', type: 'text', visible: true },
      { label: 'Unidad', property: 'unidad', type: 'text', visible: true },
      { label: 'Cantidades', property: 'cantidad', type: 'text', visible: true },
      { label: 'Actions', property: 'actions', type: 'button', visible: true }
    ];
  itemsReqPageSize = 10;
  itemsReqPageSizeOptions: number[] = [5, 10, 20, 50];
  itemsReqTotalData = 0;
  itemsReqDataSource: MatTableDataSource<ItemsReq> | null;


  anexos: File[] = [];
  columnsAnexos: TableColumn<File>[] = [
      { label: 'Nombre', property: 'name', type: 'text', visible: true, cssClasses: ['font-medium'] },
      { label: 'Tamaño', property: 'size', type: 'text', visible: true },
      { label: 'Actions', property: 'actions', type: 'button', visible: true }
    ];
  anexosPageSize = 10;
  anexosPageSizeOptions: number[] = [5, 10, 20, 50];
  anexosTotalData = 0;
  anexosDataSource: MatTableDataSource<File> | null;


  //carga masiva
  correctItems: ItemsReq[] = [];
  incorrectItems: any[] = [];


  icAdd = icAdd;
  icDelete = icDelete;
  icEdit = icEdit; // Assign edit icon
  icMoreVert = icMoreVert;
  icMoreHoriz = icMoreHoriz;
  icDownload = icDownload;

  spinner = false;

  @ViewChild(MatExpansionPanel) expansionPanel: MatExpansionPanel;
  @ViewChild(MatPaginator, { static: true }) itemsReqPaginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) itemsReqSort: MatSort;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private cd: ChangeDetectorRef,
    private projectService: ProjectService,
    private clientService: ClientsService,
    private fileUploadService: FileUploadService, // Inject FileUploadService
    private snackBar: MatSnackBar,
    public dialog: MatDialog // Inject MatDialog

  ) {
    this.categoriaItems = Object.keys(CATEGORIAS).map(key => ({ key, value: CATEGORIAS[key] }));
    this.unidadItems = Object.keys(UNIDADES).map(key => ({ key, value: UNIDADES[key] }));
    this.tiposProyecto = Object.keys(TIPOS_PROYECTO).map(key => ({ key, value: TIPOS_PROYECTO[key] }));
  }

  ngOnInit() {
    this.anexosDataSource = new MatTableDataSource<File>();

    this.loadInitialClients();

    this.clientSearchCtrl.valueChanges
      .pipe(
        takeUntil(this._onDestroy$),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(search => this.searchClients(search))
      )
      .subscribe(clients => {
        this.filteredClients = clients;
        this.cd.detectChanges();
      });

    this.itemsReqDataSource = new MatTableDataSource<ItemsReq>(this.itemsReq);
  }

  ngOnDestroy(): void {
    this._onDestroy$.next();
    this._onDestroy$.complete();
  }

  trackByProperty<T>(index: number, column: TableColumn<T>) {
    return column.property;
  }

  get visibleColumns() {
    return this.columns
      .filter(column => column.visible)
      .map(column => column.property);
  }

  get anexoVisibleColumns() {
    return this.columnsAnexos
      .filter(column => column.visible)
      .map(column => column.property);
  }

  toggleColumnVisibility(column, event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    column.visible = !column.visible;
  }

  isEven(index: number): boolean {
    return index % 2 === 0;
  }

  previewAnexo(file: File) {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(url);
  }


  loadInitialClients() {
    const filterOptions = {
      multiple: true,
      autoComplete: true,
    };

    this.clientService.getClients('', filterOptions)
      .pipe(takeUntil(this._onDestroy$))
      .subscribe(response => {
        if (response.ok) {
          this.clients = response.data.slice(0, 20); // Load only the first 20 clients
          this.filteredClients = [...this.clients];
          this.cd.detectChanges();
        } else {
          this.snackBar.open('Error al cargar los clientes', 'Cerrar', { duration: 3000 });
        }
      });
  }

  searchClients(search: string): Observable<IClient[]> {
    if (search.length < 4) {
      return new Observable(observer => {
        observer.next(this.clients); // Return initial clients if search is less than 4 characters
        observer.complete();
      });
    }

    const filterOptions = {
      multiSame: true,
      autoComplete: true,
    };

    const filter = `nombre=${search}&email=${search}&rif=${search}`; // Apply OR filter

    return this.clientService.getClients(filter, filterOptions)
      .pipe(
        takeUntil(this._onDestroy$),
        map(response => {
          if (response.ok) {
            return response.data;
          } else {
            this.snackBar.open('Error al buscar clientes', 'Cerrar', { duration: 3000 });
            return [];
          }
        })
      );
  }

  displayClientName(client: IClient): string {
    return client ? client.nombre : '';
  }

  public dropped(files: NgxFileDropEntry[]) {
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        try {
        fileEntry.file((file: File) => {
          const reader: FileReader = new FileReader();

          reader.onload = async (e: any) => {
            const bstr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
            const wsname: string = wb.SheetNames[0];
            const ws: XLSX.WorkSheet = wb.Sheets[wsname];

            const data = XLSX.utils.sheet_to_json(ws);
            await this.processExcelData(data);
            Swal.fire({
              title: 'Carga masiva de items',
              html: `
                <p>Registros cargados con éxito: ${this.correctItems.length}</p>
                <p>Registros con errores: ${this.incorrectItems.length}</p>
                ${this.incorrectItems.length > 0 ? '<strong>Primeros 5 errores:</strong>' : ''}
                <ul>
              ${this.incorrectItems.slice(0, 5).map(item => `<li>${item.error}</li>`).join('')}
                </ul>
              `,
              icon: 'info',
              confirmButtonText: 'Cerrar'
            });
            this.correctItems = [];
            this.incorrectItems = [];

          };

          reader.readAsBinaryString(file);
        });
        } catch (err) {
          Swal.fire({
            title: 'Error al leer el archivo',
            text: err.message || 'Ocurrió un error desconocido, contacte al administrador',
            icon: 'error',
            confirmButtonText: 'Cerrar'
          });
        }
      }
    }
  }

  public anexosDropped(files: NgxFileDropEntry[]) {
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        try {
          fileEntry.file(async (file: File) => {
            await this.anexos.push(file);
            this.anexosDataSource = new MatTableDataSource(this.anexos);
            //this.anexosDataSource.data.push(file);
            this.cd.detectChanges();
          });
        } catch (err) {
          Swal.fire({
            title: 'Error al leer el archivo',
            text: err.message || 'Ocurrió un error desconocido, contacte al administrador',
            icon: 'error',
            confirmButtonText: 'Cerrar'
          });
        }

      }
    }
  }

  editItemReq(itemReq: ItemsReq) {
    // Populate the form with the itemType data
    this.editItemReqFlag = true;
    this.nombreItemCtrl.setValue(itemReq.nombre);
    this.marcaCtrl.setValue(itemReq.marca);
    this.modeloCtrl.setValue(itemReq.modelo);
    this.categoriaCtrl.setValue(itemReq.categoria);
    this.unidadCtrl.setValue(itemReq.unidad);
    this.cantidadCtrl.setValue(itemReq.cantidad);
    this.expansionPanel.open();
}

  removeItemReq(itemReq: ItemsReq) {
    this.itemsReq = this.itemsReq.filter(it => it !== itemReq);
    this.itemsReqDataSource.data = [...this.itemsReq]; // Trigger table update
    this.cd.detectChanges();
  }

  removeAnexo(file: File) {
    this.anexos = this.anexos.filter(f => f !== file);
    this.anexosDataSource = new MatTableDataSource(this.anexos);
    this.cd.detectChanges();
  }

  displayItemTypeName(itemType: IItemType): string {
    return itemType ? itemType.nombre : '';
  }

  async processExcelData(data: any[]) {

    data.forEach(item => {
      try {
        const categoria = this.categoriaItems.find(cat => cat.value === item.categoria?.toString().trim());
        const unidad = this.unidadItems.find(uni => uni.value === item.unidad?.toString().trim());

        if (!categoria) {
          this.incorrectItems.push({ item, error: `${item.nombre}: Categoría: ${item.categoria} no encontrada` });
          return; // Skip to the next item
        }else if (!unidad) {
          this.incorrectItems.push({ item, error: `${item.nombre}: Unidad: ${item.unidad} no encontrada` });
          return; // Skip to the next item
        }

        const newItemType: ItemsReq = {
          _id: null, // or generate a temporary ID
          nombre: item.nombre,
          descripcion: item.descripcion,
          marca: item.marca,
          modelo: item.modelo,
          categoria: +categoria.key,
          unidad: unidad.key,
          cantidad: item.cantidad || 1, // Default quantity of 1
          proveedor: undefined,
          costo_compra: 0,
          moneda: 0,
          exento: false,
          min_stock: 0,
          max_stock: 0
        };
        this.correctItems.push(newItemType);
      } catch (error) {
        this.incorrectItems.push({ item, error: error.message || 'Error desconocido' });
      }
    });

    this.correctItems.forEach(newItem => {
      const existingItemIndex = this.itemsReq.findIndex(item =>
      item.categoria === newItem.categoria &&
      item.nombre === newItem.nombre &&
      item.descripcion === newItem.descripcion &&
      item.modelo === newItem.modelo &&
      item.marca === newItem.marca
      );

      if (existingItemIndex > -1) {
      // If item exists, update the quantity
      this.itemsReq[existingItemIndex].cantidad += newItem.cantidad;
      } else {
      // If item doesn't exist, add it to the itemsReq array
      this.itemsReq.push(newItem);
      }
    });

    this.itemsReqDataSource.data = this.itemsReq;
    this.itemsReqDataSource.paginator = this.itemsReqPaginator;
    this.itemsReqDataSource.sort = this.itemsReqSort;
    this.itemsReqTotalData = this.itemsReq.length;
    this.cd.detectChanges();

    if (this.incorrectItems.length > 0) {
      console.warn('Algunos registros no se pudieron procesar:', this.incorrectItems);
      Swal.fire({
        title: 'Advertencia',
        text: 'Algunos registros no se pudieron procesar. Revise la consola para más detalles.',
        icon: 'warning',
        confirmButtonText: 'Cerrar'
      });
    }
  }

  submitAddItem() {
      const newItemReq: ItemsReq = {
        nombre: this.nombreItemCtrl.value,
        descripcion: this.descripcionCtrl.value,
        marca: this.marcaCtrl.value,
        modelo: this.modeloCtrl.value,
        categoria: this.categoriaCtrl.value,
        unidad: this.unidadCtrl.value,
        cantidad: this.cantidadCtrl.value,
        proveedor: undefined,
        costo_compra: 0,
        moneda: 0,
        exento: false,
        min_stock: 0,
        max_stock: 0
      };
      this.itemsReq.push(newItemReq);
      this.itemsReqDataSource.data = [...this.itemsReq];
      this.resetItemFormGroup();
      this.cd.detectChanges();
  }

  resetItemFormGroup() {
    this.editItemReqFlag = false;
    this.nombreItemCtrl.reset();
    this.marcaCtrl.reset();
    this.descripcionCtrl.reset();
    this.modeloCtrl.reset();
    this.categoriaCtrl.reset();
    this.unidadCtrl.reset();
    this.cantidadCtrl.reset(1);
  }

  validateProjectForm() {
    let isValid = true;

    if(this.nombreCtrl.value === '') {
      this.nombreCtrl.markAsTouched();
      isValid = false;
    }
    if(this.fechaInicioCtrl.value === '') {
      this.fechaInicioCtrl.markAsTouched();
      isValid = false;
    }
    if(this.fechaFinCtrl.value === '') {
      this.fechaFinCtrl.markAsTouched();
      isValid = false;
    }
    if(this.tipoCtrl.value === '') {
      this.tipoCtrl.markAsTouched();
      isValid = false;
    }
    if(this.clientSearchCtrl.value === '') {
      this.clientSearchCtrl.markAsTouched();
      isValid = false;
    }
    if(this.fechaFinCtrl.value < this.fechaInicioCtrl.value) {
      this.fechaFinCtrl.setErrors({ 'invalid': true });
      this.fechaFinCtrl.markAsTouched();
      this.snackBar.open('La fecha de fin no puede ser menor a la fecha de inicio', 'Cerrar', { duration: 3000 });
      isValid = false;
    }
    return isValid;
  }

  submit() {
    if (this.validateProjectForm() === false) {

      return;
    }

    const project = new Project({
      client: this.clientSearchCtrl.value,
      nombre: this.nombreCtrl.value,
      tipo: this.tipoCtrl.value,
      fecha_inicio: this.fechaInicioCtrl.value,
      fecha_fin: this.fechaFinCtrl.value,
      items_solicitados: this.itemsReq,
      anexos: []
    });

    this.projectService.createProject(project).subscribe(async response => {
      if (response.ok) {

        project._id = response.data._id;
        const uploadPromises: Promise<any>[] = [];

        for (const file of this.anexos) {
          uploadPromises.push(this.fileUploadService.photoUpdate(file, 'projects', project._id));
        }

        const uploadResults = await Promise.all(uploadPromises);
        const fileIds = uploadResults.map(result => result.pathToFront); // Assuming the response contains the fileId

        project.anexos = fileIds;

        this.projectService.updateProject(project._id, project).subscribe(response => {
          if (response.ok) {
            Swal.fire({
              title: 'Proyecto creado con éxito',
              icon: 'success',
              timer: 3000,
              showConfirmButton: false
            }).then(() => {
              this.router.navigate(['/app/projects']);
            });
          }else{
            this.snackBar.open('Error al crear el proyecto', 'Cerrar', { duration: 3000 });
          }
        });

      } else {
        this.snackBar.open('Error al crear el proyecto', 'Cerrar', { duration: 3000 });
      }
    });
  }

  resetForm() {
    this.nombreCtrl.reset();
    this.fechaInicioCtrl.reset();
    this.fechaFinCtrl.reset();
    this.clientSearchCtrl.reset();
    this.tipoCtrl.reset();
    this.itemsReq = [];
    this.itemsReqDataSource.data = [...this.itemsReq];
    this.anexos = [];
    this.anexosDataSource = new MatTableDataSource(this.anexos);
    this.cd.detectChanges();
  }
}
