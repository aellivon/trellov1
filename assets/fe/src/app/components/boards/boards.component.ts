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
    // Creating Board
    this.http.post(INDEX, this.form.value)
        .subscribe(
          data => {
            this.getBoard();
            this.closeCreateModal();
          },
          errors => {
              console.log(errors);
              this.nonFieldErrors = errors.error.non_field_errors
              this.nameFieldErrors = errors.error.name
          }
        )
  }

  getBoard(){
    // Getting the list of all the board
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

  closeCreateModal(){
    // Closing the create modal
    this.modalRef.hide();
    this.modalRef = null;
  }

  openCreateModal(template: TemplateRef<any>){
     // Initializeing modal so it can be controlled here
    this.modalRef = this.modalService.show(template);
  }
}
