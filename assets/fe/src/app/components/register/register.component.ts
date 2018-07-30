import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StateService } from '@uirouter/angular';

import { AuthenticationService } from '../../services/auth/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  form:FormGroup = new FormGroup({
      email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      confirm_password: new FormControl('', Validators.required)
  });

  nonFieldErrors: string;
  emailFieldErrors: string;
  passwordFieldErrors: string;
  confirmPasswordFieldErrors: string;

  constructor(
    private http: HttpClient,
    private auth: AuthenticationService,
    private state: StateService

  ) { }

  ngOnInit() {
  }

  singUp(){
    const x = this.auth.signup(this.form.value);
    x.then(data => {this.state.go('login')})
      .catch(errors => {
        console.log(errors);
        this.nonFieldErrors = errors.non_field_errors;
        this.emailFieldErrors = errors.email;
        this.passwordFieldErrors = errors.password;
        console.log(errors.confirm_password)
        this.confirmPasswordFieldErrors = errors.confirm_password;

      }
    )
  }

}
