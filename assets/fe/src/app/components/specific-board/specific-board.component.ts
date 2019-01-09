import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, FormControl, Validators, FormGroup } from '@angular/forms';

import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap';

import { Transition, StateService } from '@uirouter/angular';

import { BoardServicesService } from '../../services/board-services.service';
import { BoardMemberService } from '../../services/board-member.service';


@Component({
  selector: 'app-specific-board',
  templateUrl: './specific-board.component.html',
  styleUrls: ['./specific-board.component.css']
})
export class SpecificBoardComponent implements OnInit {

  refModal: BsModalRef;
  board_id: number;
  board_details: object;
  members: object;
  open_sidebar: boolean = false;
  boardNameFieldErrors: string;
  emailInviteFieldErrors: string;
  to_pass: object = {
      bulk_email:[],
      board: null
  }
  clicked: boolean = false;
  show_owner_buttons: boolean = false;


  removalError: string = "";
  successfulMessage: string = "";


  // This is for the dynamically shown modal
  @ViewChild('successfulMessageModal') successfulMessageModal: ModalDirective;
  show_successful_message: boolean = false;

  @ViewChild('confirmationModalMessage') confirmationModalMessage: ModalDirective;
  confirmation_message: boolean = false;


  // Forms
  current_name = new FormControl('', Validators.required)

  boardGroup:FormGroup = new FormGroup({
      name: new FormControl('', Validators.required),
      // The api needs to have an id passed so the serializer
      //   can read the id.
      id: new FormControl(null),
      is_active: new FormControl(null)
  });

  boardMemberGroup: FormGroup = new FormGroup({
    // Tha api needs to have board_id passed to the serializer
    email: new FormControl('', Validators.required),
    board_id: new FormControl(null)
  })
  
  constructor(
      public modalService:BsModalService,
      private trans: Transition,
      private http: HttpClient,
      private state: StateService,
      private boardService: BoardServicesService,
      private memberService: BoardMemberService,
  ) { this.board_id = trans.params().board_id; }

  ngOnInit() {
    // Setting the id of the forms
    this.boardGroup.controls['id'].setValue(this.board_id);
    this.boardMemberGroup.controls['board_id'].setValue(this.board_id);
    this.getBoardDetails();
    this.loadMembers();
  }

  openSidebar(){
    this.open_sidebar = true;
    console.log(this.open_sidebar);
  }

  update_sidebar(state: boolean){
    this.open_sidebar = false;
  }

  getBoardDetails(){
    const x = this.boardService.get_board_name(this.board_id);
    x.then(
      data => {
        this.current_name = (<any>data).name;
        this.show_owner_buttons = (<any>data).show_owner_buttons
      }
    )
      .catch(errors => {
          console.log(errors);
      }
    )
  }

  updateBoardName(){
      // Updating value of the id
      const x = this.boardService.update_board_name(this.board_id, this.boardGroup.value);
      x.then(data => {
          this.closeModal(); this.current_name = (<any>data).name;}
        )
        .catch(errors => {
          console.log(errors);
          // The errors are still not uniformed here
          //  Some errors might need errors.error or 'errors'
          this.boardNameFieldErrors = errors.name
        }
      )

  }


  archiveBoard(){
    // Archiving a Board
      this.boardGroup.controls['is_active'].setValue(false);
      this.boardGroup.controls['name'].setValue(this.current_name);
      const x = this.boardService.archive_board(this.board_id, this.boardGroup.value);
      x.then(data => {this.current_name = (<any>data).name;})
        .catch(errors => {
             console.log(errors);
        }
      )
      this.boardGroup.controls['is_active'].setValue(null);
      this.closeModal();
      this.state.go('boards')
  }

  inviteMember(){
    if(this.clicked === false){
      this.clicked = true;
      console.log(this.boardMemberGroup.controls['email'].value);
      const response = this.memberService.invite_member(this.board_id, this.boardMemberGroup.value);
      response.then(data => {
                  this.emailInviteFieldErrors = "";
                  this.successfulMessage = "Email is successfuly sent!";
                  console.log(data);

                  this.closeModal();
                  this.clicked = false;
                  this.loadMembers();
                  this.showSuccessModal();
               })
              .catch(errors => {
                console.log(errors);
                this.emailInviteFieldErrors = errors.error.email;
                this.clicked = false;
              })
    }
    
  }

  getMembers(template: TemplateRef<any>){
    this.loadMembers();
    this.openModal(template);
  }

  loadMembers(){
    const response = this.memberService.fetch_members(this.board_id);
    response.then(
        data => {
          
          if((<any>data).length){
            this.members = data;
          }else{
            this.members = undefined;
          }
          console.log(this.members);
          
        })
      .catch(
          errors =>{
            console.log(errors);
    })
  }

  removeMember(){

    const response = this.memberService.remove_members(this.board_id, this.to_pass);
    response
    .then(
      data => {
        this.hideConfirmationRemovalModal();
        this.successfulMessage = "Successfully removed members";
        this.loadMembers();
        this.showSuccessModal();
        
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


  // This section is for the successful invation modal
  showSuccessModal(): void {
    this.show_successful_message = true;
  }
 
  hideSuccessModal(): void {
    this.successfulMessageModal.hide();
  }
 
  onSuccessHidden(): void {
    this.show_successful_message = false;
  }

  removalConfirmationDenied(template: TemplateRef<any>){
    this.hideConfirmationRemovalModal();
    this.openModal(template);
  }

  leaveGroup(){
    (<any>this.to_pass).board = this.board_id
    const response = this.memberService.leave_group(this.board_id, this.to_pass);
    response.then(
      data => {
        console.log(data);
        this.state.go('boards');
      }
    )
    .catch(
      errors => {
        console.log(errors);
      }
    )
  }

    // This section is for the confirmation removal modal
  showConfirmationRemovalModal(): void {
    let got_one: boolean = false
    // resetting to pass
    this.to_pass = {
      bulk_email:[],
      board: null
    }
    console.log(this.members);
    for(var key in this.members){
      if (this.members[key].hasOwnProperty("Checked") && (<any>this.members[key]).Checked === true){
        (<any>this.to_pass).bulk_email.push((<any>this.members[key]).member.split(" ")[0])
        got_one = true;
      }
    }

    (<any>this.to_pass).board = this.board_id
    if(got_one){
      this.confirmation_message = true;
      this.closeModal();
    }else{
      this.removalError = "Please check one member!";
    }

  }
 
  hideConfirmationRemovalModal(): void {
    this.confirmationModalMessage.hide();
  }
 
  onConfirmationRemovalModal(): void {
    this.confirmation_message = false;
  }
}
