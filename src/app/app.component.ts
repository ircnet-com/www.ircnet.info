import { Component } from '@angular/core';
import {ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ircnet.info';
  embed: boolean = false;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.embed = params["embed"] === 'true';
    });
  }
}
