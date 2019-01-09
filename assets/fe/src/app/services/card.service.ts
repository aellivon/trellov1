import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { GETPOSTCARDS, MANAGECARDMEMBER, MANAGECARDCOMMENT, SPECIFICCARD } from '../constants/endpoints';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor(private http: HttpClient) { }

  fetch_cards(board_id, column_id){
      return this.http.get(GETPOSTCARDS(board_id, column_id))
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

  add_card(board_id, column_id, value){
    return this.http.post(GETPOSTCARDS(board_id, column_id),value)
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

  patch_card(board_id, column_id, card_id ,value){
    return this.http.patch(SPECIFICCARD(board_id, column_id, card_id), value)
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

  fetch_card(board_id, column_id, card_id){
    return this.http.get(SPECIFICCARD(board_id, column_id, card_id))
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

   fetch_members(board_id, column_id, card_id, value){
    return this.http.get(MANAGECARDMEMBER(board_id, column_id, card_id), value)
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

  assign_members(board_id, column_id, card_id, value){
    return this.http.post(MANAGECARDMEMBER(board_id, column_id, card_id), value)
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

  remove_members(board_id, column_id, card_id, value){
    return this.http.patch(MANAGECARDMEMBER(board_id, column_id, card_id), value)
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

  fetch_comments(board_id, column_id, card_id){
    return this.http.get(MANAGECARDCOMMENT(board_id, column_id, card_id))
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

  add_comment(board_id, column_id, card_id, values){
    return this.http.post(MANAGECARDCOMMENT(board_id, column_id, card_id), values)
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

  remove_comment(board_id, column_id, card_id, values){
     return this.http.patch(MANAGECARDCOMMENT(board_id, column_id, card_id), values)
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
