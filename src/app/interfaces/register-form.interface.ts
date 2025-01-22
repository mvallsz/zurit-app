import { Validators } from '@angular/forms';

export interface RegisterForm {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  avatar?: any;
  google?: boolean;
  role?: string;
}


