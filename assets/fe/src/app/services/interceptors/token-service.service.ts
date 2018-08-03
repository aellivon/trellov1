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
    let req = r;
    if(this.auth.authenticated()){
       req = r.clone({ headers: r.headers.set('Authorization', this.authtoken()) });
   
    }

    return n.handle(req).pipe(
      tap(e => {
        if (e instanceof HttpResponse) return e;
      },
      err => {
        if (err instanceof HttpErrorResponse) {
          this.checkPermission(err);
          return err; };
      })
    );
  }

  // Get user token from the local storage
  authtoken () {
    let t = _.get(this.auth.getToken(), ['token'], null);
    if (t === null){
      // try getting the token directly
      // this code is a "band aid" code and should not be written if 
      //   you make this project a reference
      t = this.auth.getToken();
    }
    return `JWT ${t}`;
  }

  // flag expired token. let the user re-login to generate
  // a new authentication token.
  flagToken () {
    this.auth.rmToken();
    this.state.go('login');
  }

  checkPermission(err){
    if(err.status === 403){
      this.state.go('error_page', {error_no: err.status})
    }
  }
}
