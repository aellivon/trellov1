export const LOGIN = 'api/login/';
export const SIGNUP = 'api/signup/';
export const INDEX = 'api/boards/';
export const SPECIFICBOARD = (id) => {return 'api/boards/' + id + '/'};
export const MANAGEMEMBERS = (id) =>{return 'api/boards/' + id + '/members/'}
export const MANAGECOLUMNS = (id) => {return 'api/boards/' + id + '/columns/'}
