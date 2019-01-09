import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StateService } from '@uirouter/angular';

import { AuthenticationService } from '../../services/auth/authentication.service';
import { LOGIN } from '../../constants/endpoints';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent implements OnInit {

  form:FormGroup = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
  });

  nonFieldErrors: string;
  emailFieldErrors: string;
  passwordFieldErrors: string;

  constructor(
      private http: HttpClient,
      private auth: AuthenticationService,
      private state: StateService
    ) { }

  ngOnInit() {
  }

  doLogin(){
    const x = this.auth.login(this.form.value);
    x.then(data => {this.state.go('boards')})
      .catch(errors => {
        this.nonFieldErrors = errors.non_field_errors;
        this.emailFieldErrors = errors.email;
        this.passwordFieldErrors = errors.password;
      }
    )
  }
}
