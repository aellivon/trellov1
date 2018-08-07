import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { GETBOARDACTIVITIES, GETUSERACTIVITIES } from '../constants/endpoints';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  constructor(private http: HttpClient) { }

  fetch_board_side_bar(board_id){
       return this.http.get(GETBOARDACTIVITIES(board_id))
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
  
  fetch_user_activity(){
       return this.http.get(GETUSERACTIVITIES())
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