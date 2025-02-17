import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';

import { stagger80ms } from '../../../../../../@vex/animations/stagger.animation';
import { fadeInUp400ms } from '../../../../../../@vex/animations/fade-in-up.animation';
import { scaleIn400ms } from '../../../../../../@vex/animations/scale-in.animation';
import { fadeInRight400ms } from '../../../../../../@vex/animations/fade-in-right.animation';

import icMoreVert from '@iconify/icons-ic/twotone-more-vert';
import icClose from '@iconify/icons-ic/twotone-close';
import icAdd from '@iconify/icons-ic/twotone-add';
import icDelete from '@iconify/icons-ic/twotone-delete';
import icEdit from '@iconify/icons-ic/twotone-edit';

import { ServiceResponse } from '../../../../../interfaces/service-response.interface';
import { Address, IAddress } from '../models/address.model';
import { Contact, IContact } from '../models/contact.model';
import { ClientsService } from '../../../../../services/modules/comercial-module/clients/clients.service';
import { CATEGORIAS_EMPRESA, TIPOS_CONTABILIDAD, TIPOS_EMPRESA, TIPOS_DIRECCION } from '../../../../../../static-data/constants/enums';
import { ESTADOS_VE, CIUDADES_VE } from '../../../../../../static-data/constants/addresses/addresses';
import Swal from 'sweetalert2';
import { MatTableDataSource } from '@angular/material/table';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IClient } from '../models/client.model';

@Component({
  selector: 'zurit-clients-update',
  templateUrl: './clients-update.component.html',
  styleUrls: ['./clients-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    stagger80ms,
    fadeInUp400ms,
    scaleIn400ms,
    fadeInRight400ms
  ]
})

export class ClientsUpdateComponent implements OnInit {

  layoutCtrl = new FormControl("boxed");

  icMoreVert = icMoreVert;
  icClose = icClose;
  icAdd = icAdd;
  icDelete = icDelete;
  icEdit = icEdit;

  public spinner = false;
  public invalidMsg = '';
  public clientId: string;

  // Enums
  public tiposContabilidad = TIPOS_CONTABILIDAD;
  public tiposEmpresa = TIPOS_EMPRESA;
  public categoriasEmpresa = CATEGORIAS_EMPRESA;
  public tiposDireccion = TIPOS_DIRECCION;
  public estados = ESTADOS_VE.sort((a, b) => {
    const nameA = a.name ? a.name.trim() : '';
    const nameB = b.name ? b.name.trim() : '';
    return nameA.localeCompare(nameB);
  });
  public ciudades = CIUDADES_VE.sort((a, b) => a.name.localeCompare(b.name));


  // Client Form Controls
  public descripcionCtrl: FormControl = new FormControl('', [Validators.required]);
  public rifCtrl: FormControl = new FormControl('', [Validators.required]);
  public nombreCtrl: FormControl = new FormControl('', [Validators.required]);
  public codigoCtrl: FormControl = new FormControl('', [Validators.required]);
  public puntajeCtrl: FormControl = new FormControl(0);
  public telefonoCtrl: FormControl = new FormControl('', [Validators.required]);
  public whatsappCtrl: FormControl = new FormControl('', [Validators.required]);
  public emailCtrl: FormControl = new FormControl('', [Validators.required, Validators.email]);
  public tipoContabilidadCtrl: FormControl = new FormControl('', [Validators.required]);
  public tipoClienteCtrl: FormControl = new FormControl('', [Validators.required]);
  public categoriaCtrl: FormControl = new FormControl('', [Validators.required]);

  // Address Form Controls
  public calleCtrl: FormControl = new FormControl('', [Validators.required]);
  public ciudadCtrl: FormControl = new FormControl('', [Validators.required]);
  public estadoCtrl: FormControl = new FormControl('', [Validators.required]);
  public codigoPostalCtrl: FormControl = new FormControl('', [Validators.required]);
  public referenciaCtrl: FormControl = new FormControl('', [Validators.required]);
  public tipoDireccionCtrl: FormControl = new FormControl('', [Validators.required]);

  // Contact Form Controls
  public nombreContactoCtrl: FormControl = new FormControl('', [Validators.required]);
  public telefonoContactoCtrl: FormControl = new FormControl('', [Validators.required]);
  public emailContactoCtrl: FormControl = new FormControl('', [Validators.required, Validators.email]);
  public tipoContactoCtrl: FormControl = new FormControl('', [Validators.required]);

  clientFormGroup: FormGroup;
  addressFormGroup: FormGroup;
  contactFormGroup: FormGroup;

  addresses: IAddress[] = [];
  contacts: IContact[] = [];

  displayedAddressColumns: string[] = ['tipo', 'calle', 'ciudad', 'estado', 'codigo_postal', 'actions'];
  addressDataSource: MatTableDataSource<Address> | null;
  displayedContactColumns: string[] = ['nombre', 'telefono', 'email', 'tipo', 'actions'];
  contactDataSource: MatTableDataSource<Contact> | null;

  protected _onDestroy = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private clientService: ClientsService,
    private snackBar: MatSnackBar) {
  }

  ngOnInit() {
    // Get the client ID from the URL parameters
    this.clientId = this.route.snapshot.paramMap.get('id');

    this.clientFormGroup = this.fb.group({
      descripcion: this.descripcionCtrl,
      rif: this.rifCtrl,
      nombre: this.nombreCtrl,
      puntaje: this.puntajeCtrl,
      telefono: this.telefonoCtrl,
      whatsapp: this.whatsappCtrl,
      email: this.emailCtrl,
      tipo_contabilidad: this.tipoContabilidadCtrl,
      tipo_cliente: this.tipoClienteCtrl
    });

    this.addressFormGroup = this.fb.group({
      calle: this.calleCtrl,
      ciudad: this.ciudadCtrl,
      estado: this.estadoCtrl,
      codigo_postal: this.codigoPostalCtrl,
      referencia: this.referenciaCtrl,
      tipo: this.tipoDireccionCtrl
    });

    this.contactFormGroup = this.fb.group({
      nombre: this.nombreContactoCtrl,
      telefono: this.telefonoContactoCtrl,
      email: this.emailContactoCtrl,
      tipo_contacto: this.tipoContactoCtrl
    });

    this.loadClientData();

    this.cd.detectChanges();
  }

  filterCitiesByState(event: any) {
    const estado = event.value;
    this.ciudades = CIUDADES_VE.filter(ciudad => ciudad.idState === estado).sort((a, b) => a.name.localeCompare(b.name));
    this.ciudadCtrl.setValue('');
    this.cd.detectChanges();
  }
  loadClientData() {
    if (this.clientId) {
      this.clientService.getClient(this.clientId)
        .pipe(
          catchError(error => {
            this.spinner = false;
            this.openSnackbar('Error al cargar los datos del cliente.');
            this.cd.detectChanges();
            return throwError(error);
          })
        )
        .subscribe((resp: ServiceResponse) => {
          if (resp.ok) {
            const client: IClient = resp.data;
            this.descripcionCtrl.setValue(client.descripcion);
            this.rifCtrl.setValue(client.rif);
            this.nombreCtrl.setValue(client.nombre);
            this.puntajeCtrl.setValue(client.puntaje);
            this.telefonoCtrl.setValue(client.telefono);
            this.whatsappCtrl.setValue(client.whatsapp);
            this.emailCtrl.setValue(client.email);
            this.tipoContabilidadCtrl.setValue(client.tipo_contabilidad.toString());
            this.tipoClienteCtrl.setValue(client.tipo_cliente.toString());
            this.categoriaCtrl.setValue(client.categoria.toString());
            this.addresses = client.direcciones as IAddress[];
            this.contacts = client.contactos as IContact[];

            this.addressDataSource = new MatTableDataSource(this.addresses as Address[]);
            this.contactDataSource = new MatTableDataSource(this.contacts as Contact[]);
            this.cd.detectChanges();
          } else {
            this.openSnackbar('Error al cargar los datos del cliente.');
          }
        });
    }
  }

  // FORM FUNCTIONS

  resetClientFormGroup() {
    this.clientFormGroup.reset();
  }

  resetAddressFormGroup() {
    this.addressFormGroup.reset();
  }

  resetContactFormGroup() {
    this.contactFormGroup.reset();
  }

  validatePhoneNumber(phoneNumber: string): void {
    const phoneRegex = /^0\d{3}-\d{7}$/;
    if (!phoneRegex.test(phoneNumber)) {
      this.snackBar.open('Número de teléfono inválido. Debe ser 0XXX-XXXXXXX', 'Cerrar', { duration: 3000 });
    }
  }

  validateWhatsAppNumber(phoneNumber: string): void {
    const whatsAppRegex = /^\+58\s4\d{2}-\d{7}$/;
    if (!whatsAppRegex.test(phoneNumber)) {
      this.snackBar.open('Formato de WhatsApp inválido. Debe ser +58 4XX-XXX-XXXX', 'Cerrar', { duration: 3000 });
    }
  }

  validateRif(rif: string): boolean {
    const rifRegex = /^[V|E|J|G]-\d{8}-\d$/;
    if(!rifRegex.test(rif)){
      this.snackBar.open('RIF no válido', 'Cerrar', { duration: 3000 });
      this.rifCtrl.setErrors({ 'invalid': true });
      return false;
    }else{
      this.rifCtrl.setErrors(null);
      return true;
    }
  }

  createClientValidation() {
    let formOk = true;
    if (
      'INVALID' === this.descripcionCtrl.status ||
      'INVALID' === this.rifCtrl.status ||
      'INVALID' === this.nombreCtrl.status ||
      'INVALID' === this.telefonoCtrl.status ||
      'INVALID' === this.whatsappCtrl.status ||
      'INVALID' === this.emailCtrl.status ||
      'INVALID' === this.tipoContabilidadCtrl.status ||
      'INVALID' === this.tipoClienteCtrl.status
    ) {
      if (this.descripcionCtrl.invalid) {
        this.descripcionCtrl.setErrors({ 'invalid': true });
      }
      if (this.rifCtrl.invalid) {
        this.rifCtrl.setErrors({ 'invalid': true });
      }
      if (this.nombreCtrl.invalid) {
        this.nombreCtrl.setErrors({ 'invalid': true });
      }
      if (this.telefonoCtrl.invalid) {
        this.telefonoCtrl.setErrors({ 'invalid': true });
      }
      if (this.whatsappCtrl.invalid) {
        this.whatsappCtrl.setErrors({ 'invalid': true });
      }
      if (this.emailCtrl.invalid) {
        this.emailCtrl.setErrors({ 'invalid': true });
      }
      if (this.tipoContabilidadCtrl.invalid) {
        this.tipoContabilidadCtrl.setErrors({ 'invalid': true });
      }
      if (this.tipoClienteCtrl.invalid) {
        this.tipoClienteCtrl.setErrors({ 'invalid': true });
      }
      this.invalidMsg = 'Por favor complete los campos requeridos.';
      formOk = false;
    }
    return formOk;
  }

  createAddressValidation() {
    let formOk = true;
    if (
      'INVALID' === this.calleCtrl.status ||
      'INVALID' === this.ciudadCtrl.status ||
      'INVALID' === this.estadoCtrl.status ||
      'INVALID' === this.codigoPostalCtrl.status ||
      'INVALID' === this.referenciaCtrl.status
    ) {
      if (this.calleCtrl.invalid) {
        this.calleCtrl.setErrors({ 'invalid': true });
      }
      if (this.ciudadCtrl.invalid) {
        this.ciudadCtrl.setErrors({ 'invalid': true });
      }
      if (this.estadoCtrl.invalid) {
        this.estadoCtrl.setErrors({ 'invalid': true });
      }
      if (this.codigoPostalCtrl.invalid) {
        this.codigoPostalCtrl.setErrors({ 'invalid': true });
      }
      if (this.referenciaCtrl.invalid) {
        this.referenciaCtrl.setErrors({ 'invalid': true });
      }
      this.invalidMsg = 'Por favor complete los campos requeridos.';
      formOk = false;
    }
    return formOk;
  }


  createContactValidation() {
    let formOk = true;
    if (
      'INVALID' === this.nombreContactoCtrl.status ||
      'INVALID' === this.telefonoContactoCtrl.status ||
      'INVALID' === this.emailContactoCtrl.status ||
      'INVALID' === this.tipoContactoCtrl.status
    ) {
      if (this.nombreContactoCtrl.invalid) {
        this.nombreContactoCtrl.setErrors({ 'invalid': true });
      }
      if (this.telefonoContactoCtrl.invalid) {
        this.telefonoContactoCtrl.setErrors({ 'invalid': true });
      }
      if (this.emailContactoCtrl.invalid) {
        this.emailContactoCtrl.setErrors({ 'invalid': true });
      }
      if (this.tipoContactoCtrl.invalid) {
        this.tipoContactoCtrl.setErrors({ 'invalid': true });
      }
      this.invalidMsg = 'Por favor complete los campos requeridos.';
      formOk = false;
    }
    return formOk;
  }

  addAddress() {
    let isValidForm = this.createAddressValidation();
    if (isValidForm) {
      const address: IAddress = {
        calle: this.calleCtrl.value,
        ciudad: this.ciudadCtrl.value,
        estado: this.estadoCtrl.value,
        codigo_postal: this.codigoPostalCtrl.value,
        referencia: this.referenciaCtrl.value,
        tipo: this.tipoDireccionCtrl.value
      };
      this.addresses.push(address);
      if(this.addresses.length === 1){
        this.addressDataSource = new MatTableDataSource(this.addresses);
      }else{
        this.addressDataSource.data = this.addresses;
      }
      this.resetAddressFormGroup();
      this.cd.detectChanges();
    } else {
      this.openSnackbar(this.invalidMsg);
    }
  }

  removeAddress(index: number) {
    this.addresses.splice(index, 1);
    this.addressDataSource.data = this.addresses;
    this.cd.detectChanges();
  }

  addContact() {
    let isValidForm = this.createContactValidation();
    if (isValidForm) {
      const contact: IContact = {
        nombre: this.nombreContactoCtrl.value,
        telefono: this.telefonoContactoCtrl.value,
        email: this.emailContactoCtrl.value,
        tipo: this.tipoContactoCtrl.value
      };
      this.contacts.push(contact);
      if(this.contacts.length === 1){
        this.contactDataSource = new MatTableDataSource(this.contacts);
      }else{
        this.contactDataSource.data = this.contacts;
      }

      this.resetContactFormGroup();
      this.cd.detectChanges();
    } else {
      this.openSnackbar(this.invalidMsg);
    }
  }

  removeContact(index: number) {
    this.contacts.splice(index, 1);
    this.contactDataSource.data = this.contacts;
    this.cd.detectChanges();
  }

  async submit() {
    this.spinner = true;
    let isValidForm = this.createClientValidation();

    if (isValidForm) {
      const client: IClient = {
        descripcion: this.descripcionCtrl.value,
        rif: this.rifCtrl.value,
        nombre: this.nombreCtrl.value,
        puntaje: this.puntajeCtrl.value,
        telefono: this.telefonoCtrl.value,
        whatsapp: this.whatsappCtrl.value,
        email: this.emailCtrl.value,
        categoria: +this.categoriaCtrl.value,
        tipo_contabilidad: +this.tipoContabilidadCtrl.value,
        tipo_cliente: +this.tipoClienteCtrl.value,
        direcciones: this.addresses,
        contactos: this.contacts
      };

      this.clientService.updateClient(this.clientId, client).pipe(
        catchError(error => {
          this.spinner = false;
          if (error.status === 400) {
            // Handle 400 error
            this.openSnackbar('Error: Datos inválidos. '+error.error.msg);
          } else {
            // Handle other errors
            this.openSnackbar('Error registrando el cliente, por favor notifique al administrador del sistema e intente de nuevo más tarde.');
          }
          this.cd.detectChanges();
          return throwError(error); // Re-throw the error to be caught by the global error handler if needed
        })
      ).subscribe((resp: ServiceResponse) => {
        if (resp.ok) {
          Swal.fire({
            title: 'Cliente actualizado con exito en el sistema!!',
            icon: 'success',
            timer: 5000,
            showConfirmButton: true
          }).then(() => {
            this.router.navigate(['/app/clientes/']);
          });
        }
      });
    } else {
      this.spinner = false;
      this.openSnackbar(this.invalidMsg);
    }
  }

  openSnackbar(message: string) {
    this.snackBar.open(message, 'CERRAR', {
      duration: 5000,
      horizontalPosition: 'right'
    });
  }
}
