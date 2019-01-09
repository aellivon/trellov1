import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, SimpleChange } from '@angular/core';

import { ActivityService } from '../../services/activity.service';
import { GETBOARDACTIVITIES } from '../../constants/endpoints';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {


   @Input() board_id:number;
   @Input() open_sidebar:boolean;
   @Output() update_sidebar = new EventEmitter<boolean>();
   activities: any[];

  constructor(private sidebarService: ActivityService) { }

  ngOnInit() {
    console.log(GETBOARDACTIVITIES(this.board_id));
    console.log(this.board_id.toString());
    const res = this.sidebarService.fetch_board_side_bar(this.board_id.toString());
    res.then(
        data => {
            (<any>this.activities) = data;
            console.log(this.activities, "activities");

        }
    )
    .catch(
       errors => {

           console.log(errors);
       }
    )

  }

  closeSidebar() {
    this.open_sidebar = false;
    // Emitting so the boolean can be two-way data bined
    this.update_sidebar.emit(false);
  }
  
  change_state(state){
      
      this.open_sidebar = state;
  }

}
