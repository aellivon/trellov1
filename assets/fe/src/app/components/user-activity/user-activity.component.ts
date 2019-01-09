import { Component, OnInit } from '@angular/core';

import { ActivityService } from '../../services/activity.service';

@Component({
  selector: 'app-user-activity',
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.css']
})
export class UserActivityComponent implements OnInit {

  activities: any[] = [];

  constructor(private sidebarService: ActivityService) { }

  ngOnInit() {
    const res = this.sidebarService.fetch_user_activity();
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

}
