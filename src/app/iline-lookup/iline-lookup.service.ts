import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {IlineLookupResponse} from './iline-lookup-response';
import {IlineForm} from './iline-form';

@Injectable({
  providedIn: 'root'
})
export class IlineLookupService {
  private url = 'http://bot.ircnet.info/api/i-line?q=';

  constructor(private http: HttpClient) {
  }

  getServerList(ilineForm: IlineForm) : Observable<IlineLookupResponse>{
    return this.http.get<IlineLookupResponse>(this.url + ilineForm.address).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
/*    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);*/
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error.errorMessage}`);
    }
    // return an observable with a user-facing error message
    return throwError(error.error.errorMessage);
  }
}
