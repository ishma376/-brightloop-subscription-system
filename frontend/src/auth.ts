export type Account = { id:number; name:string; email:string; role:'ADMIN'|'STAFF'|'CUSTOMER' };
const TOKEN_KEY = 'brightloop-token';
const USER_KEY = 'brightloop-account';
export function saveSession(token:string, user:Account){ sessionStorage.setItem(TOKEN_KEY, token);sessionStorage.setItem(USER_KEY,JSON.stringify(user)); }
export function getToken(){ return sessionStorage.getItem(TOKEN_KEY); }
export function isLoggedIn(){ return !!getToken(); }
export function getAccount():Account|null{try{const value=sessionStorage.getItem(USER_KEY);return value?JSON.parse(value) as Account:null;}catch{return null;}}
export function logout(){sessionStorage.removeItem(TOKEN_KEY);sessionStorage.removeItem(USER_KEY);}
