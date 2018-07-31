import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientXsrfModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { CookieService } from 'ngx-cookie-service';
import { BsModalService, ModalModule } from 'ngx-bootstrap';

import { UIRouterModule } from '@uirouter/angular';

import { APP_STATES } from './app.states';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { BoardsComponent } from './components/boards/boards.component';
import { RegisterComponent } from './components/register/register.component';
import { NavigationBarComponent } from './components/navigation-bar/navigation-bar.component';
import { TokenServiceService } from './services/interceptors/token-service.service';
import { SpecificBoardComponent } from './components/specific-board/specific-board.component';
import { BoardContentComponent } from './components/board-content/board-content.component';
import { CardsComponent } from './components/cards/cards.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    BoardsComponent,
    RegisterComponent,
    NavigationBarComponent,
    SpecificBoardComponent,
    BoardContentComponent,
    CardsComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    ModalModule.forRoot(),
    HttpClientXsrfModule.withOptions({
      cookieName: 'csrftoken',
      headerName: 'X-CSRFToken',
    }),
    UIRouterModule.forRoot(APP_STATES),
  ],
  providers: [
    BsModalService,
    CookieService,
    { provide: HTTP_INTERCEPTORS, useClass: TokenServiceService, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
