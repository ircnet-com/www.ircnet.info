import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {DataTableDirective} from 'angular-datatables';
import {throwError} from 'rxjs/index';
import {catchError} from 'rxjs/internal/operators';

class Channel {
  name: string;
  userCount: number;
  topic: string;
}

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Component({
  selector: 'app-channel-list',
  templateUrl: './channel-list.component.html',
  styleUrls: ['./channel-list.component.css']
})
export class ChannelListComponent implements OnInit {
  @ViewChild(DataTableDirective, {static: false})
  datatableElement: DataTableDirective;
  min: string;
  max: string;

  dtOptions: DataTables.Settings = {};
  channels: Channel[];
  filterTypes = ['Channel or topic', 'Channel', 'Topic'];
  filterType = this.filterTypes[0];
  pageSizes = [25, 50, 100];
  pageSize = this.pageSizes[0];
  filter: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const that = this;

    this.dtOptions = {
      dom: 'tipr',
      pagingType: 'full_numbers',
      pageLength: this.pageSize,
      serverSide: true,
      processing: true,
      order: [[ 1, 'desc' ]],
      columns: [{ data: 'name', orderable: true }, { data: 'userCount', orderable: true }, { data: 'topic', orderable: false }],
      ajax: (dataTablesParameters: any, callback) => {
        if(this.filterType == this.filterTypes[0]) {
          dataTablesParameters.search.value = this.filter;
        }
        else if(this.filterType == this.filterTypes[1]) {
          dataTablesParameters.columns[0].search.value = this.filter;
        }
        else if(this.filterType == this.filterTypes[2]) {
          dataTablesParameters.columns[2].search.value = this.filter;
        }

        that.http
          .post<DataTablesResponse>(
            'https://clis.vague.ovh/',
            dataTablesParameters, {}
          )
          .pipe(catchError(this.handleError))
          .subscribe(response => {
          that.channels = response.data;

          callback({
            recordsTotal: response.recordsTotal,
            recordsFiltered: response.recordsFiltered,
            data: []
          });
        });
      },
    };
  }

  filterTypeChanged(): void {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  filterById(): void {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  pageSizeChanged(): void {
    this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.draw();
    });
  }

  private handleError(error: HttpErrorResponse) {
    alert('Could not retrieve any data. Please reload the page');
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
