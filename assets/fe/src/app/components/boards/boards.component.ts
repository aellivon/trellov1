import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { BsModalService, BsModalRef } from 'ngx-bootstrap';

import { StateService } from '@uirouter/angular';

import { AuthenticationService } from '../../services/auth/authentication.service';
import { INDEX } from '../../constants/endpoints';


@Component({
  selector: 'app-boards',
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.css']
})
export class BoardsComponent implements OnInit {
  
  // Initializing a modal
  modalRef: BsModalRef;

  form:FormGroup = new FormGroup({
      name: new FormControl('', Validators.required)
  });

  nonFieldErrors: string;
  nameFieldErrors: string;
  boards: object;
  modalCreateModal: boolean = false;

  constructor(
      public modalService:BsModalService,
      private http: HttpClient,
      private auth: AuthenticationService,
      private state: StateService
    ) { }

  ngOnInit() {
    this.getBoard();
  }

  createBoard(){
    this.http.post(INDEX, this.form.value)
        .subscribe(
          data => {
            this.getBoard();
          },
          errors => {
              console.log(errors);
          }
        )
    this.modalRef.hide();
    this.modalRef = null;
  }

  openCreateModal(template: TemplateRef<any>){
     // Initializeing modal so it can be userd
    this.modalRef = this.modalService.show(template);
  }

  getBoard(){
    this.http.get(INDEX, this.form.value)
    .subscribe(
          data => {
            console.log(data);
            this.boards = data;
          },
          errors => {
              console.log(errors);
          }
     )
  }
}
