export class CustomerExport {
  tlCargoName: string;
  name: string;
  phoneNumber: string;
  email: string;
  notes: string;
  creditBalance: string;

  constructor(customer) {
    this.tlCargoName = customer.tlCargoName;
    this.name = customer.name;
    this.phoneNumber = customer.phoneNumber;
    this.email = customer.email;
    this.notes = customer.notes;
    this.creditBalance = customer.creditBalance[0].balance.toLocaleString('en', {
      style: 'currency',
      currency: 'USD'
    });
  }

}
