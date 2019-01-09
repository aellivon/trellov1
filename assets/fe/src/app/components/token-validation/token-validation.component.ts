import { StateService } from '@uirouter/angular';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { TokenValidationService } from '../../services/token-validation.service';

import { Transition } from '@uirouter/angular';

import { AuthenticationService } from '../../services/auth/authentication.service';


@Component({
  selector: 'app-token-validation',
  templateUrl: './token-validation.component.html',
  styleUrls: ['./token-validation.component.css']
})
export class TokenValidationComponent implements OnInit {

  token: string;

  nonFieldErrors: string;
  emailFieldErrors: string;
  passwordFieldErrors: string;
  confirmPasswordFieldErrors: string;
  has_account: boolean;

  form:FormGroup = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      confirm_password: new FormControl('', Validators.required)
  });

  constructor(
     private tokenService: TokenValidationService, 
     private trans: Transition,
     private http: HttpClient,
     private auth: AuthenticationService,
     private state: StateService
    ){
        this.token = trans.params().token; 
    }

  ngOnInit() {
      console.log(this.auth.getToken(), "tokenz");

      this.getValidateToken();
  }

  getValidateToken(){
      let resp = this.tokenService.validateToken(this.token);
      resp.then(
          (data: any) => {
              console.log(data);
              this.has_account = data.has_account;
              this.form.controls['email'].setValue(data.email);
          }
      )
      .catch(
          errors => {
              console.log(errors);
              if(errors.status == 404){
                this.state.go('login');
              }
          }
      )
  }

  singUp(){
    const response = this.tokenService.completeRegistrationToken(this.token,this.form.value);
    response.then(
      (data: any) => {
        console.log(data);
        this.auth.setToken(data[0].auth_token);
        this.state.go('board_state', {board_id: data[0].id})
      }
    )
    .catch(
      errors => {
        console.log(errors);
      }
    )
  }

  joinBoard(){
    const response = this.tokenService.joinBoard(this.token, "");
    response.then(
      (data: any) => {
        console.log(data);
        this.auth.setToken(data[0].auth_token);
        this.state.go('board_state', {board_id: data[0].id})
      }
    )
    .catch(
      errors => {
        console.log(errors);
      }
    )
  }
}
