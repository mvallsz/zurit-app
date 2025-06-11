import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { InventoryService } from './inventory.service';
import { Item } from '../../../../pages/inventory-module/sub-modules/items/models/item.model';

describe('InventoryService', () => {
  let service: InventoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [InventoryService]
    });
    service = TestBed.inject(InventoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch items', () => {
    const dummyItems: Item[] = [
      { nombre: 'Item 1', descripcion: 'Description 1', codigo_uuid: 'uuid1', costo_compra: 100, moneda: 1, marca: 'Brand 1', categoria: 1, proveedor: { _id: '1', nombre: 'Supplier 1', direccion: 'Address 1', telefono: '1234567890', email: 'supplier1@example.com' }, cantidad: 10, unidad: 1, min_stock: 1, max_stock: 100, estado: 1, createdBy: { _id: '1', name: 'User 1', email: 'user1@example.com' } },
      { nombre: 'Item 2', descripcion: 'Description 2', codigo_uuid: 'uuid2', costo_compra: 200, moneda: 2, marca: 'Brand 2', categoria: 2, proveedor: { _id: '2', nombre: 'Supplier 2', direccion: 'Address 2', telefono: '0987654321', email: 'supplier2@example.com' }, cantidad: 20, unidad: 2, min_stock: 2, max_stock: 200, estado: 2, createdBy: { _id: '2', name: 'User 2', email: 'user2@example.com' } }
    ];

    service.getItems().subscribe(items => {
      expect(items.length).toBe(2);
      expect(items).toEqual(dummyItems);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyItems);
  });

  it('should fetch item by id', () => {
    const dummyItem: Item = { nombre: 'Item 1', descripcion: 'Description 1', codigo_uuid: 'uuid1', costo_compra: 100, moneda: 1, marca: 'Brand 1', categoria: 1, proveedor: { _id: '1', nombre: 'Supplier 1', direccion: 'Address 1', telefono: '1234567890', email: 'supplier1@example.com' }, cantidad: 10, unidad: 1, min_stock: 1, max_stock: 100, estado: 1, createdBy: { _id: '1', name: 'User 1', email: 'user1@example.com' } };

    service.getItemById('1').subscribe(item => {
      expect(item).toEqual(dummyItem);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(dummyItem);
  });

  it('should create an item', () => {
    const newItem: Item = { nombre: 'New Item', descripcion: 'New Description', codigo_uuid: 'newuuid', costo_compra: 300, moneda: 3, marca: 'New Brand', categoria: 3, proveedor: { _id: '3', nombre: 'New Supplier', direccion: 'New Address', telefono: '1122334455', email: 'newsupplier@example.com' }, cantidad: 30, unidad: 3, min_stock: 3, max_stock: 300, estado: 3, createdBy: { _id: '3', name: 'New User', email: 'newuser@example.com' } };

    service.createItem(newItem).subscribe(item => {
      expect(item).toEqual(newItem);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}`);
    expect(req.request.method).toBe('POST');
    req.flush(newItem);
  });

  it('should update an item', () => {
    const updatedItem: Item = { nombre: 'Updated Item', descripcion: 'Updated Description', codigo_uuid: 'updateduuid', costo_compra: 400, moneda: 4, marca: 'Updated Brand', categoria: 4, proveedor: { _id: '4', nombre: 'Updated Supplier', direccion: 'Updated Address', telefono: '5566778899', email: 'updatedsupplier@example.com' }, cantidad: 40, unidad: 4, min_stock: 4, max_stock: 400, estado: 4, createdBy: { _id: '4', name: 'Updated User', email: 'updateduser@example.com' } };

    service.updateItem('1', updatedItem).subscribe(item => {
      expect(item).toEqual(updatedItem);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(updatedItem);
  });

  it('should update stock of an item', () => {
    const updatedItem: Item = { nombre: 'Updated Item', descripcion: 'Updated Description', codigo_uuid: 'updateduuid', costo_compra: 400, moneda: 4, marca: 'Updated Brand', categoria: 4, proveedor: { _id: '4', nombre: 'Updated Supplier', direccion: 'Updated Address', telefono: '5566778899', email: 'updatedsupplier@example.com' }, cantidad: 50, unidad: 4, min_stock: 4, max_stock: 400, estado: 4, createdBy: { _id: '4', name: 'Updated User', email: 'updateduser@example.com' } };

    service.updateStock('1', 'increase', 10).subscribe(item => {
      expect(item).toEqual(updatedItem);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/1/stock`);
    expect(req.request.method).toBe('PUT');
    req.flush(updatedItem);
  });

  it('should disable an item', () => {
    const disabledItem: Item = { nombre: 'Disabled Item', descripcion: 'Disabled Description', codigo_uuid: 'disableduuid', costo_compra: 500, moneda: 5, marca: 'Disabled Brand', categoria: 5, proveedor: { _id: '5', nombre: 'Disabled Supplier', direccion: 'Disabled Address', telefono: '6677889900', email: 'disabledsupplier@example.com' }, cantidad: 0, unidad: 5, min_stock: 5, max_stock: 500, estado: 2, createdBy: { _id: '5', name: 'Disabled User', email: 'disableduser@example.com' } };

    service.disableItem('1').subscribe(item => {
      expect(item).toEqual(disabledItem);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/1/disable`);
    expect(req.request.method).toBe('PUT');
    req.flush(disabledItem);
  });

  it('should delete an item', () => {
    service.deleteItem('1').subscribe(response => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
