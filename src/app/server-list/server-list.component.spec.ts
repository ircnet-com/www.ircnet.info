import { ComponentFixture, TestBed } from '@angular/core/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {of} from 'rxjs';

import { ServerListComponent } from './server-list.component';
import {ServerListService} from './server-list.service';

describe('ServerListComponent', () => {
  let component: ServerListComponent;
  let fixture: ComponentFixture<ServerListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerListComponent],
      providers: [
        {
          provide: ServerListService,
          useValue: {
            getServerList: () => of({
              countriesWithServers: [],
              totalUsers: 0,
              totalServers: 0,
              lastMapReceived: new Date().toISOString(),
              now: new Date().toISOString()
            })
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({})
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate')
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
