import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { VALIDATE } from '../constants/endpoints';

@Injectable({
  providedIn: 'root'
})
export class TokenValidationService {

  constructor(private http: HttpClient) { }

  validateToken(token){
      return this.http.get(VALIDATE(token))
      .toPromise()
      .then(
          data => {
              return data;
          }
      )
      .catch(
          errors => {
              return Promise.reject(errors);
          }
      )
  }

  completeRegistrationToken(token, values){
    return this.http.post(VALIDATE(token), values)
    .toPromise()
    .then(
      data => {
        return data;
      }
    )
    .catch(
      errors => {
        return Promise.reject(errors);
      }
    )
  }

  joinBoard(token, values){
    return this.http.patch(VALIDATE(token), values)
    .toPromise()
    .then(
      data => {
        return data;
      }
    )
    .catch(
      errors => {
        return Promise.reject(errors);
      }
    )
  }

}
