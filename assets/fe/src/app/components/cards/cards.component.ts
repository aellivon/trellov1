import { Component, Input, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { FormsModule, FormControl, Validators, FormGroup } from '@angular/forms';


import { DragulaService } from 'ng2-dragula';

import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap';

import { CardService } from '../../services/card.service';

import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit {

  @Input() column_id:number;
  @Input() board_id:number;
  refModal: BsModalRef;
  remember_card: any[];
  members: any[];
  remember_template: TemplateRef<any>;
  cards: any[] = [];
  index: number;
  updateName: boolean = false;
  updateDescription: boolean = false;
  addComment: boolean = false;
  updateCard: boolean = false;
  comments: any[] = [];
  ongoing_process: boolean = false;

  nameError: string;
  commentError: string;
  descriptionError: string;
  dateTimeError: string;

  subs = new Subscription();

  cardGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    column: new FormControl('', Validators.required)
  })

  updatedCardGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    action: new FormControl('', Validators.required),
    column: new FormControl('', Validators.required),
    due_date: new FormControl('', Validators.required),
    is_active: new FormControl(false,Validators.required),
    position: new FormControl(null, Validators.required),
    id: new FormControl(null)
  })

  commentGroup: FormGroup = new FormGroup({
    comment: new FormControl('', Validators.required),
    card: new FormControl('', Validators.required),
    id: new FormControl('', Validators.required),
    is_active: new FormControl(false)
  })

  constructor(
      private cardServe: CardService,
      private modalService:BsModalService,
      private dragula: DragulaService
  ) { 
    this.subs.add(this.dragula.drag("CARDS")
      .subscribe(({ name, el, source }) => {
        // ...
      })
    );
    this.subs.add(this.dragula.drop("CARDS")
      .subscribe(({ name, el, target, source, sibling }) => {
        this.updatedCardGroup.controls['id'].setValue((<any>el).dataset.id);
        this.updatedCardGroup.controls['column'].setValue((<any>target).dataset.column_id);
        this.updatedCardGroup.controls['position'].setValue(0);
        this.transferCard((<any>el).dataset.id);
      })

    );
  }


  // ngOnDestroy() {
  //   // destroy all the subscriptions at once
  //   this.subs.unsubscribe();
  // }

  transferCard(to_pass_id_url){
    this.updatedCardGroup.controls['action'].setValue('transfer');
    if(this.ongoing_process === false){
      this.ongoing_process = true;
      const resp = this.cardServe.patch_card(
        this.board_id, this.column_id, to_pass_id_url, this.updatedCardGroup.value);
      resp.then(
        data => {

          this.ongoing_process = false;
        }
      )
      .catch(
        errors => {
          console.log(errors);
          this.ongoing_process = false;
        }
      )
    }
  }

  ngOnInit() {
      this.loadCards();  
  }



  loadCards(){
    const res = this.cardServe.fetch_cards(this.board_id, this.column_id);
    res.then(
        data => {
            (<any>this.cards) = data;

        }
    )
    .catch(
       errors => {

           console.log(errors);
       }
    )
  }

  doAddComment(){
    this.commentGroup.controls['card'].setValue(this.updatedCardGroup.controls['id'].value);
    let res = this.cardServe.add_comment(
      this.board_id, this.column_id, this.updatedCardGroup.controls['id'].value,
      this.commentGroup.value)

    res.then(
      (data: any) =>{
        this.comments.unshift(data);
         this.commentGroup.controls['comment'].setValue('');
        console.log(data);
      }
    )
    .catch(
      errors => {
        this.commentError = errors.error.comment
        console.log(errors);
      }
    )
  }

  doRemoveComment(comment_id, index){
    this.commentGroup.controls['card'].setValue(this.updatedCardGroup.controls['id'].value);
    this.commentGroup.controls['id'].setValue(comment_id);
    let res = this.cardServe.remove_comment(
      this.board_id, this.column_id, this.updatedCardGroup.controls['id'].value,
      this.commentGroup.value)
    res.then(
      (data: any) =>{
        console.log(data);
        this.comments.splice(index,1);
      }
    )
    .catch(
      errors => {
        console.log(errors);
      }
    )
  }

  shiftUpdateDescription(to_state:boolean){
    this.updateDescription = to_state;
  }

  shiftUpdateName(to_state: boolean){
    this.updateName = to_state;
    if(!to_state){
      this.nameError = "";
    }
  }

  shiftAddComment(to_state:boolean){
    this.addComment = to_state;
    if(!to_state){
      this.commentError = "";
    }
  }

 

  addCard(){
    this.cardGroup.controls['column'].setValue(this.column_id);
    const res = this.cardServe.add_card(this.board_id, this.column_id, this.cardGroup.value);
    res.then(
      (data: any) => {
        let to_push :object = {
          'id': data.id,
          'name': data.name
        }
        this.cards.push(to_push);
        this.closeModal();
      }
    )
    .catch(
      errors => {
        console.log(errors);
      }
    )
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

  setUpValues(template: TemplateRef<any>, remember_id: number, remember_index: number){
    this.updatedCardGroup.controls['id'].setValue(remember_id);
    const res = this.cardServe.fetch_card(this.board_id, this.column_id, remember_id);
    res.then(
      (data: any) => {
        (<any>this.remember_card) = data;
        (<any>this.remember_card).index = remember_index;
        this.updatedCardGroup.controls['name'].setValue(data.name);
        this.updatedCardGroup.controls['description'].setValue(data.description);

        console.log("hi");
        this.loadComments();
        this.openLgModal(template);
        console.log(data);
      }
    )
    .catch(
      errors=> {
        console.log(errors);

      }
    )
  }

  refreshNameValues(data){
    (<any>this.remember_card).name = data.name;
    (<any>this.cards)[(<any>this.remember_card).index].name = data.name;
    this.updateName = false;
    this.nameError = "";
  }

  refreshDescriptionValues(data){
    (<any>this.remember_card).description = data.description;
    (<any>this.cards)[(<any>this.remember_card).index].description = data.description;
    this.updateDescription = false;
    this.descriptionError = "";
  }

  refreshDueDate(data){
    (<any>this.remember_card).due_date = data.due_date;
    (<any>this.cards)[(<any>this.remember_card).index].due_date = data.due_date;
    (<any>this.cards)[(<any>this.remember_card).index].is_overdue = data.is_overdue;
    this.closeNestedModal('lg');
    this.dateTimeError = "";
  }

  refreshArchiveCard(data){
    this.cards.splice((<any>this.remember_card).index,1);
    this.closeModal();
  }

  updateDescriciptionFunc(action: string, updated_value: string){
    this.updatedCardGroup.controls['description'].setValue(updated_value)
    console.log(this.updatedCardGroup.controls['description'].value);
    this.setUpPatchValues(action);
  }

  setUpCardMemberModal(template: TemplateRef<any>, previous_template: TemplateRef<any>){
    const res = this.cardServe.fetch_members(
      this.board_id, this.column_id, ((<any>this.remember_card).id), this.updatedCardGroup.value);
    res.then(
      (data: any) => {
        console.log(data);
        this.members = data;
        this.openNestedModal(template, previous_template);
      }
    )
    .catch(
      errors => {
        console.log(errors)
      } 
     
    )
  }

  loadComments(){
    const res = this.cardServe.fetch_comments(this.board_id, this.column_id, this.updatedCardGroup.controls['id'].value);
    res.then(
      (data: any) => {
        console.log(data);
        this.comments = data;
      }
    )
    .catch(
      errors => {
        console.log(errors);
      }
    )
  }

  Assignment(){
    let to_assign: object = {
      bulk_board_member:[],
      card: this.updatedCardGroup.controls['id'].value
    }
    let to_archive: object = {
      bulk_id:[],
      is_active: false
    }

    for(var key in this.members){
      if((<any>this.members[key]).Checked != (<any>this.members[key]).already_member){
        if((<any>this.members[key]).Checked){
          (<any>to_assign).bulk_board_member.push(this.members[key].id);
        }else{
          (<any>to_archive).bulk_id.push(this.members[key].card_member_id);
        }
      }
    }
    console.log((<any>to_assign).bulk_board_member);

    // To refactor
    if((<any>to_assign).bulk_board_member && (<any>to_archive).bulk_id){
       console.log(to_assign, "CONSECUTIVE");
      this.consecutivePromises(to_assign, to_archive);
    }else if((<any>to_assign).bulk_board_member){
      console.log(to_assign, "TO ASSIGN");
      this.assignCardMember(to_assign);
    }else if((<any>to_archive).bulk_id){
      console.log(to_assign, "TO REMOVE");
      this.removeCardMember(to_archive);
    }
    this.closeNestedModal('lg');
  }


  consecutivePromises(to_assign, to_archive){
    let res = this.cardServe.assign_members(
        this.board_id, this.column_id, this.updatedCardGroup.controls['id'].value, to_assign);
    res.then(
      data => {
        console.log(data, "SUCESS ASSIGNING");
        this.removeCardMember(to_archive);
      }
    )
    .catch(
      errors => {
        console.log(errors);
        this.removeCardMember(to_archive);
      }
    )
  }

  assignCardMember(to_assign){
    let res = this.cardServe.assign_members(
        this.board_id, this.column_id, this.updatedCardGroup.controls['id'].value, to_assign);
    res.then(
      data => {
        console.log(data, "SUCESS ASSIGNING");
      }
    )
    .catch(
      errors => {
        console.log(errors);
      }
    )
  }

  removeCardMember(to_archive){
    let res = this.cardServe.remove_members(
        this.board_id, this.column_id, this.updatedCardGroup.controls['id'].value, to_archive);
    res.then(
      data => {
        console.log(data, "SUCESS REMOVING");
      }
    )
    .catch(
      errors => {
        console.log(errors);
      }
    )
  }

  setUpPatchValues(action: string){
    this.updatedCardGroup.controls['action'].setValue(action);
    const res = this.cardServe.patch_card(
      this.board_id, this.column_id, ((<any>this.remember_card).id), this.updatedCardGroup.value);
    res.then(
      (data: any) => {
        console.log(data);
        if(action=="name"){
          this.refreshNameValues(data);
        }else if(action=="description"){
          this.refreshDescriptionValues(data);
        }else if(action=="due date"){
          this.refreshDueDate(data);
        }else if(action == "archive"){
          this.refreshArchiveCard(data);
        }
      }
    )
    .catch(
      errors => {
        if(action=="name"){
           this.nameError = errors.error.name;
           console.log("trapped");
        }else if(action=="description"){
          this.descriptionError = errors.error.description;
        }else if(action == "due date"){
          this.dateTimeError = "That is not a valid date!";
        }
        console.log(errors);
      }
    )
  }

  openLgModal(template: TemplateRef<any>) {
    this.refModal = this.modalService.show(template, {class: 'modal-lg'});
  }

  setUpDueDate(template: TemplateRef<any>, remember_template: TemplateRef<any>){
    let due_date_exists = (<any>this.remember_card).due_date;
    if(due_date_exists){
      due_date_exists = new Date(due_date_exists);
      this.updatedCardGroup.controls['due_date'].setValue(this.format_date_for_input(due_date_exists));
    }
    this.openNestedModal(template, remember_template)
  }



  openNestedModal(template: TemplateRef<any>, remember_template: TemplateRef<any>){
    this.remember_template = remember_template;
    this.closeModal();
    this.openModal(template);
  }

  closeNestedModal(size: string){
    this.closeModal();
    if(size === "lg"){
      this.openLgModal(this.remember_template);
    }else{
      this.openModal(this.remember_template);
    }
    
    this.remember_template = null;
  }

  formatDate(date) {
    // From html to django
    var year = date.getFullYear(),
    month = date.getMonth() + 1, 
    day = date.getDate(),
    hour = date.getHours(),
    minute = date.getMinutes(),
    second = date.getSeconds(),
    hourFormatted = hour % 12 || 12, 
    minuteFormatted = minute < 10 ? "0" + minute : minute,
    morning = hour < 12 ? "am" : "pm";

    return month + "/" + day + "/" + year + ", " + hourFormatted + ":" +
      minuteFormatted + morning;
  }

  zero_padding(val) {
    // padding for date month
    // date time local doesn't accept '7' -> must be '07'
    if (val >= 10){
      return val;
    }
    else{
      return '0' + val;
    }
  }

  format_date_for_input(date) {
    // From django to html local time
    let year = date.getFullYear(),
    month = date.getMonth() + 1, 
    day = date.getDate(),
    hour = date.getHours(),
    minute = date.getMinutes(),
    second = date.getSeconds(),
    hourFormatted = hour % 12 || 12, 
    minuteFormatted = minute < 10 ? "0" + minute : minute,
    morning = hour < 12 ? "am" : "pm";

    month = this.zero_padding(month);
    hour = this.zero_padding(hour);


    return year + "-" + month + "-" + day + "T" + hour + ":" + minuteFormatted;
  }

}
