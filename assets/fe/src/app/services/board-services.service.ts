import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { SPECIFICBOARD } from '../constants/endpoints';

@Injectable({
  providedIn: 'root'
})
export class BoardServicesService {

  constructor(private http: HttpClient) {
      
  }

    get_board_name(id){
      return this.http.get(SPECIFICBOARD(id))
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
    update_board_name(id, value){
      return this.http.post(SPECIFICBOARD(id), value)
        .toPromise()
        .then(
          data => {
            return data;
          }
        )
        .catch(
          errors => {
            return Promise.reject(errors.error);
          }
      )
    }
}
