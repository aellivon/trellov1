import { ContentOnly, ContentAndHeader, ContentSubheaderAndHeader } from './utils/layouts.utils'

import { LoginComponent } from './components/login/login.component'
import { BoardsComponent } from './components/boards/boards.component'
import { RegisterComponent } from './components/register/register.component'
import { NavigationBarComponent } from './components/navigation-bar/navigation-bar.component'
import { SpecificBoardComponent } from './components/specific-board/specific-board.component'
import { BoardContentComponent } from './components/board-content/board-content.component'

import { AuthenticationService } from './services/auth/authentication.service';


let LOG_IN_STATE: Object[] = [
    {
        name: 'login',
        url: '/login/',
        views: ContentOnly(LoginComponent),
        onEnter: function(trans, state){
            const auth = trans.injector().get(AuthenticationService);
            if(auth.authenticated()){
               return trans.router.stateService.target('boards');
            }
        }
    }

]

let BOARD_STATE: Object[] = [
    {
        name: 'boards',
        url: '/boards/',
        views: ContentAndHeader(NavigationBarComponent, BoardsComponent),
        onEnter: function(trans, state){
            const auth = trans.injector().get(AuthenticationService);
            if(!(auth.authenticated())){
               return trans.router.stateService.target('login');
            }
        }
    }
]

let LOG_OUT_STATE: Object[] = [
        {
            name: 'logout',
            url: '/logout/',
            onEnter: function(trans, state){
                const auth = trans.injector().get(AuthenticationService);
                auth.rmToken();
                // Returns the router wihout using state service
                return trans.router.stateService.target('login');
            }
           
        }
]

let REGISTER_STATE: Object[] = [
        {
            name: 'register',
            url: '/register/',
            views: ContentOnly(RegisterComponent),
            onEnter: function(trans, state){
                const auth = trans.injector().get(AuthenticationService);
                if(auth.authenticated()){
                   return trans.router.stateService.target('boards');
                }
            }
        }
]

let SPECIFIC_BOARD_STATE: Object[] = [
    {
        name: 'board_state',
        url: '/board_state/:board_id/',
        views: ContentSubheaderAndHeader(NavigationBarComponent, SpecificBoardComponent, BoardContentComponent),
        params: {board_id : null},
        onEnter: function(trans, state){
            const auth = trans.injector().get(AuthenticationService);
            if(!(auth.authenticated())){
               return trans.router.stateService.target('login');
            }
        }
    }
] 


export const APP_STATES = {

    otherwise: '/login/',
    states: [].concat(
        LOG_IN_STATE,
        BOARD_STATE,
        LOG_OUT_STATE,
        REGISTER_STATE,
        SPECIFIC_BOARD_STATE
    )
}
