import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { MANAGECOLUMNS } from '../constants/endpoints';

@Injectable({
  providedIn: 'root'
})
export class ColumnService {

  constructor(private http: HttpClient) { }

  fetch_columns(id){
      return this.http.get(MANAGECOLUMNS(id))
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

  addColumn(id, values){
    return this.http.post(MANAGECOLUMNS(id), values)
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

  patchValues(board_id, data){
    return this.http.patch(MANAGECOLUMNS(board_id),data)
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
