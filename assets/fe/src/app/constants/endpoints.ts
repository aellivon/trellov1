export const LOGIN = 'api/login/';
export const SIGNUP = 'api/signup/';
export const INDEX = 'api/boards/';
export const SPECIFICBOARD = (id) => {return 'api/boards/' + id + '/'};
export const MANAGEMEMBERS = (id) =>{return 'api/boards/' + id + '/members/'}
export const MANAGECOLUMNS = (id) => {return 'api/boards/' + id + '/columns/'}
export const GETPOSTCARDS = (board_id, column_id) => {
    return 'api/boards/' +board_id + '/columns/' + column_id + '/cards/'}
export const SPECIFICCARD = (board_id, column_id, card_id) => {
    return "api/boards/" + board_id + "/columns/"+ column_id +"/cards/"+ card_id +"/"
}
export const MANAGECARDMEMBER = (board_id, column_id, card_id) => {
    return "api/boards/" + board_id + "/columns/"+ column_id +"/cards/"+ card_id +"/members/"
}
export const MANAGECARDCOMMENT = (board_id, column_id, card_id) => {
    return "api/boards/" + board_id + "/columns/"+ column_id +"/cards/"+ card_id +"/comments/"
}
