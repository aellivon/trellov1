import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { 
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { StateService } from '@uirouter/angular';


import { AuthenticationService } from '../../services/auth/authentication.service';



@Injectable({
  providedIn: 'root'
})
export class TokenServiceService {

  constructor(
    private auth  : AuthenticationService,
    private state : StateService
  ) { }

  intercept (r: HttpRequest<any>, n: HttpHandler) : Observable <HttpEvent <any>> {
    let req = r.clone({ headers: r.headers.set('Authorization', this.authtoken()) });
    return n.handle(req).pipe(
      tap(e => {
        if (e instanceof HttpResponse) return e;
      },
      err => {
        if (err instanceof HttpErrorResponse) { this.flagToken(); };
      })
    );
  }

  // Get user token from the local storage
  authtoken () {
    const t = _.get(this.auth.getToken(), ['token'], null);
    return `JWT ${t}`;
  }

  // fl  ag expired token. let the user re-login to generate
  // a new authentication token.
  flagToken () {
    this.auth.rmToken();
    this.state.go('login');
  }
}
