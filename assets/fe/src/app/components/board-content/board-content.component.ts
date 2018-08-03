import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, FormControl, Validators, FormGroup } from '@angular/forms';

import { DragulaModule } from 'ng2-dragula'

import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap';

import { Transition, StateService } from '@uirouter/angular';

import { ColumnService } from '../../services/column.service';

import { AuthenticationService } from '../../services/auth/authentication.service';

@Component({
  selector: 'app-board-content',
  templateUrl: './board-content.component.html',
  styleUrls: ['./board-content.component.css']
})    
export class BoardContentComponent implements OnInit {

  refModal: BsModalRef;
  columns: any[];
  board_id: number;
  remember_index:number;
  columnNameFieldErrors: string;


  columnGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    position: new FormControl('', Validators.required),
    board: new FormControl('', Validators.required),
    id: new FormControl('', Validators.required),
    action: new FormControl('', Validators.required),
    is_active: new FormControl('', Validators.required)
  })

  constructor(
      private ColService: ColumnService,
      private trans: Transition,
      private modalService:BsModalService,
      private auth: AuthenticationService)
    {
      this.board_id = trans.params().board_id; 
    }

  ngOnInit() {
    
     var response = this.ColService.fetch_columns(this.board_id);
     response.then(
         data => {
             (<any>this.columns) = data;
             console.log(data);
         }
     )
     .catch(
         errors => {
             console.log(errors);
         }
     )
  }

  setPatchValues(index, template: TemplateRef<any>, update_type){
      this.remember_index = index;
      this.columnGroup.controls['position'].setValue(this.columns[index].position);
      this.columnGroup.controls['board'].setValue(this.board_id);
      this.columnGroup.controls['id'].setValue(this.columns[index].id);
      this.columnGroup.controls['action'].setValue(update_type);
      this.openModal(template);
  }

  updateColumnName(){
    var response = this.ColService.patchValues(this.board_id, this.columnGroup.value);
    response.then(
        data => {
            (<any>this.columns[this.remember_index]).name = (<any>data).name;
            this.columnGroup.reset();
            this.remember_index = -1;
            this.closeModal();
        }
    )
    .catch(
        errors => {
            this.columnNameFieldErrors = errors.error.name;
        }
    )
  }

  archiveColumn(){
    this.columnGroup.controls['is_active'].setValue(false);
    var response = this.ColService.patchValues(this.board_id, this.columnGroup.value);
    response.then(
        data => {
            console.log(data);
            this.columns.splice(this.remember_index,1);
            
            this.columnGroup.reset();
            this.remember_index = -1;
            this.closeModal();
            
        }
    )
    .catch(
        errors => {

            console.log(errors);
        }
    )
  }

  addColumn(){
    this.columnGroup.controls['board'].setValue(this.board_id);
    this.columnGroup.controls['position'].setValue(0);
    var response = this.ColService.addColumn(this.board_id, this.columnGroup.value);
    response.then(
        (data: any) => {
            console.log(data);
            console.log(this.columns);
            let to_push : object = {
                "name": data.name,
                "position": data.position,
                "id": data.id
            };
            this.columns.push(to_push);
            this.columnGroup.reset();
            this.remember_index = -1;
            this.closeModal();
            this.columnNameFieldErrors = "";
        }
    )
    .catch(
        errors => {
            this.columnNameFieldErrors = errors.error.name;
            console.log(errors);
        }
    )
  }

  print(){
      (<any>this.columns[0]).name = "mehe";
  }

  closeModal(){
    // Closing the modal
    this.refModal.hide();
    this.refModal = null;
  }

  openModal(template: TemplateRef<any>){
     // Initializeing modal so it can be controlled here
    this.refModal = this.modalService.show(template);
  }
}
