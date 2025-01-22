import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { LoadingService } from './services/loading.service';
import { catchError, finalize, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
@Injectable()
export class NetworkInterceptor implements HttpInterceptor {

  constructor(private loader: LoadingService,
    private router: Router
  ) {
  }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 500) {
          if (error.error.msg.message === 'jwt expired') {
            Swal.fire('Session expired', 'Please login again', 'error');
            localStorage.removeItem('token');
            this.router.navigate(['/']);

          }

        }
        return throwError(error);
      })
    );
  }
}
