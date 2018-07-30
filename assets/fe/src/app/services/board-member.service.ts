import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { MANAGEMEMBERS } from '../constants/endpoints';

@Injectable({
  providedIn: 'root'
})
export class BoardMemberService {

  constructor(private http: HttpClient) { }

    invite_member(id, value){
      return this.http.post(MANAGEMEMBERS(id), value)
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

    fetch_members(id){
      return this.http.get(MANAGEMEMBERS(id))
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

    remove_members(id, value){
      return this.http.patch(MANAGEMEMBERS(id),value)
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
