import { Component } from '@angular/core';
import {AppSettings} from "../app.settings";
import {FormsModule, NgForm} from "@angular/forms";
import {IlineForm} from "./iline-form";
import {IlineLookupResponse} from "./iline-lookup-response";
import {IlineLookupService} from "./iline-lookup.service";
import {HttpClient} from "@angular/common/http";
import {CorrectServerDescriptionEncodingPipePipe} from "../correct-server-description-encoding-pipe.pipe";
import {OrderBySIDPipePipe} from "../order-by-sidpipe.pipe";
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-iline-lookup',
  standalone: true,
  imports: [
    CorrectServerDescriptionEncodingPipePipe,
    OrderBySIDPipePipe,
    FormsModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './iline-lookup.component.html',
  styleUrl: './iline-lookup.component.css'
})
export class IlineLookupComponent {
  ilineForm: IlineForm;
  response: IlineLookupResponse | undefined;
  errorMessage: string | undefined;
  loading: boolean = false;

  constructor(private ilineLookupService: IlineLookupService, private http: HttpClient) {
    this.ilineForm = {
      address: ''
    };
  }

  ngOnInit() {
    this.getIpAddress();
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }

    this.loading = true;

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
    this.http.get(AppSettings.INFOBOT_API_URL + '/ipaddress')
        .subscribe((data: any) => {
          this.ilineForm.address = data.address;
        });
  }
}
