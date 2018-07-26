import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule, FormControl, Validators, FormGroup } from '@angular/forms';
import { Transition, StateService } from '@uirouter/angular';

import { SPECIFICBOARD } from '../../constants/endpoints';
import { BoardServicesService } from '../../services/board-services.service';

@Component({
  selector: 'app-specific-board',
  templateUrl: './specific-board.component.html',
  styleUrls: ['./specific-board.component.css']
})
export class SpecificBoardComponent implements OnInit {

  board_id: number;
  board_details: object;
  current_name = new FormControl('', Validators.required)

  form:FormGroup = new FormGroup({
      name: new FormControl('', Validators.required)
  });
  constructor(
      private trans: Transition,
      private http: HttpClient,
      private state: StateService,
      private boardService: BoardServicesService
  ) { this.board_id = trans.params().board_id; }

  ngOnInit() {
    const x = this.boardService.get_board_name(this.board_id);
    x.then(data => {this.current_name = (<any>data).name;})
      .catch(errors => {
          console.log(errors);
       
      }
    )
  }

  updateBoardName(){
      const x = this.boardService.update_board_name(this.board_id, this.form.value);
      x.then(data => {this.current_name = (<any>data).name;})
      .catch(errors => {
           console.log(errors);
      }
    )
  }

}
