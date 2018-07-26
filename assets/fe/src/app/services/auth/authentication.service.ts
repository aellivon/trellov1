import * as _ from "lodash";

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { LOGIN, SIGNUP } from '../../constants/endpoints';
import { AUTH_KEY } from '../../constants/conf.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private http: HttpClient) { }

    login(cred){
      return this.http.post(LOGIN, cred)
        .toPromise()
        .then(
          data => {
            this.setToken(data)
            return data;
          }
        )
        .catch(
          errors => {
            return Promise.reject(errors.error);
          }
        )
    }


    signup(cred){
      return this.http.post(SIGNUP, cred)
      .toPromise()
      .then(
        data => {
          this.setToken(data);
          return data;
        }
       )
      .catch(
        errors => {
          return Promise.reject(errors.error)
        }
      )
    }

    setToken (d) {
      (<any>window).localStorage[AUTH_KEY] = JSON.stringify(d);
      return d;
    }

    getToken () {
      let d = (<any>window).localStorage[AUTH_KEY];
      if (!d) { return null; };

      return JSON.parse(d);
    }

    rmToken () {
      (<any>window).localStorage.removeItem(AUTH_KEY);
    }

    authenticated () {
      return this.getToken() ? true : false;
    }
}
