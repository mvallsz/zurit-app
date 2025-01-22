import { Address } from '../pages/warehousingModules/customers-registry/interfaces/address.model';

export interface MailInterface {
  from: string;
  to: string;
  subject: string;
  html: any;
}
