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

  describe('linked totals', () => {
    const lastMapReceived = '2026-09-12T10:15:03.409+00:00';

    beforeEach(() => {
      component.data = {
        countriesWithServers: [
          {
            countryCode: '840',
            countryCodeAlpha2: 'US',
            countryName: 'United States',
            totalUsers: 120,
            serverList: [
              {
                serverName: 'open.example.net',
                sid: '001A',
                serverInfo: 'Open server',
                lastSeen: lastMapReceived,
                userCount: 50,
                version: 'test',
                open: true,
                sasl: false
              },
              {
                serverName: 'sasl.example.net',
                sid: '001B',
                serverInfo: 'SASL server',
                lastSeen: lastMapReceived,
                userCount: 70,
                version: 'test',
                open: false,
                sasl: true
              },
              {
                serverName: 'split.example.net',
                sid: '001C',
                serverInfo: 'Netsplit server',
                lastSeen: '2026-09-10T21:08:08.945+00:00',
                userCount: 187,
                version: 'test',
                open: true,
                sasl: true
              }
            ]
          }
        ],
        totalUsers: 120,
        totalServers: 2,
        lastMapReceived,
        now: '2026-09-12T10:15:05.427+00:00'
      };
    });

    it('excludes stale servers from ALL totals', () => {
      component.mode = 'ALL';

      expect(component.flatServers.length).toBe(3);
      expect(component.displayedTotalServers).toBe(2);
      expect(component.displayedTotalUsers).toBe(120);
      expect(component.getDisplayedCountryUsers(component.filteredCountries[0])).toBe(120);
    });

    it('excludes stale servers from OPEN totals', () => {
      component.mode = 'OPEN';

      expect(component.flatServers.length).toBe(2);
      expect(component.displayedTotalServers).toBe(1);
      expect(component.displayedTotalUsers).toBe(50);
      expect(component.getDisplayedCountryUsers(component.filteredCountries[0])).toBe(50);
    });

    it('excludes stale servers from SASL totals', () => {
      component.mode = 'SASL';

      expect(component.flatServers.length).toBe(2);
      expect(component.displayedTotalServers).toBe(1);
      expect(component.displayedTotalUsers).toBe(70);
      expect(component.getDisplayedCountryUsers(component.filteredCountries[0])).toBe(70);
    });
  });

});
