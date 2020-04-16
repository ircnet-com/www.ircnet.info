import { Component, OnInit } from '@angular/core';
import {IlineForm} from "./iline-form";
import {NgForm} from "@angular/forms";
import {IlineLookupService} from "./iline-lookup.service";
import {IlineLookupResponse} from "./iline-lookup-response";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-iline-lookup',
  templateUrl: './iline-lookup.component.html',
  styleUrls: ['./iline-lookup.component.css']
})
export class IlineLookupComponent implements OnInit {

  private ilineForm : IlineForm;
  private response: IlineLookupResponse;
  private errorMessage: any;
  private loading: boolean;

  constructor(private ilineLookupService: IlineLookupService, private http: HttpClient) {
    this.ilineForm = {
      address: ""
    };
  }

  ngOnInit() {
    this.getIpAddress();
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }

    this.errorMessage = null;
    this.loading = true;
    this.response = null;

    this.ilineLookupService.getServerList(this.ilineForm).subscribe({
      next: data => {
        this.response = data;
        this.loading = false;
      },
      error: err => {
        this.errorMessage = err;
        this.loading = false;
      }
    });
  }

  getIpAddress() {
    this.http.get('http://bot.ircnet.info/api/ipaddress')
      .subscribe((data: any) => {
        this.ilineForm.address = data.address;
      });
  }
}
