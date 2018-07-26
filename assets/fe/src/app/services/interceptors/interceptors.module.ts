import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TokenServiceService } from './token-service.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers:[TokenServiceService]
})
export class InterceptorsModule { }
