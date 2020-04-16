import { Component, OnInit } from '@angular/core';
import {ServerListService} from './server-list.service';

@Component({
  selector: 'app-server-list',
  templateUrl: './server-list.component.html',
  styleUrls: ['./server-list.component.css'],

})
export class ServerListComponent implements OnInit {
  showFlags: boolean = false;
  listFilter: string = 'cart';
  private data: any;
  private errorMessage: any;

  constructor(private serverListService: ServerListService  ) {
  }

  ngOnInit() {
    this.data = this.serverListService.getServerList().subscribe({
      next: data => this.data = data,
      error: err => this.errorMessage = err
    });
  }

  toggleShowFlags(): void {
    this.showFlags = !this.showFlags;
  }
}
