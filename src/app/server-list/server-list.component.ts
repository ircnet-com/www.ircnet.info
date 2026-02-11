import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ServerListService} from "./server-list.service";
import {CorrectServerDescriptionEncodingPipe} from "../correct-server-description-encoding.pipe";
import {NgClass, NgForOf, NgIf, UpperCasePipe} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {ActivatedRoute, Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-server-list',
  standalone: true,
  imports: [
    CorrectServerDescriptionEncodingPipe,
    NgIf,
    NgForOf,
    FormsModule,
    NgClass,
    RouterLink,
    UpperCasePipe
  ],
  templateUrl: './server-list.component.html',
  styleUrl: './server-list.component.scss'
})
export class ServerListComponent implements OnInit, AfterViewInit {
  data: any;
  errorMessage: string = "";
  embed: boolean = false;

  flatView: boolean = false;

  mode: 'ALL' | 'OPEN' | 'SASL' = 'ALL';
  country: string | null = null;

  private updatingFromUrl: boolean = false;

  @ViewChild('modeScroll', { static: false })
  modeScroll?: ElementRef<HTMLElement>;

  get flatServers(): any[] {
    const servers: any[] = [];
    for (const country of this.filteredCountries) {
      for (const server of (country.serverList ?? [])) {
        servers.push({
          ...server,
          countryCode: country.countryCode,
          countryCodeAlpha2: country.countryCodeAlpha2,
          countryName: country.countryName
        });
      }
    }
    return servers;
  }

  get filteredCountries(): any[] {
    const countries = this.data?.countriesWithServers ?? [];
    const selectedCountry = this.country;
    return countries
      .filter((country: any) => {
        if (!selectedCountry) {
          return true;
        }
        const alpha2 = String(country?.countryCodeAlpha2 ?? '').trim().toLowerCase();
        return alpha2 === selectedCountry;
      })
      .map((country: any) => ({
        ...country,
        serverList: (country.serverList ?? []).filter((server: any) => this.matchesFilters(server))
      }))
      .filter((country: any) => (country.serverList?.length ?? 0) > 0);
  }

  getCountryAnchor(country: any): string {
    return String(country?.countryCodeAlpha2 ?? '').trim().toLowerCase();
  }

  buildCountryQueryParams(alpha2: string): any {
    const qp: any = {
      country: String(alpha2 ?? '').trim().toLowerCase()
    };

    if (this.mode === 'SASL') {
      qp.sasl = 'true';
    } else if (this.mode === 'OPEN') {
      qp.open = 'true';
    }

    if (this.flatView) {
      qp.flat = 'true';
    }

    if (this.embed) {
      qp.embed = 'true';
    }

    return qp;
  }

  private matchesFilters(server: any): boolean {
    if (this.mode === 'OPEN') {
      return !!server?.open;
    }
    if (this.mode === 'SASL') {
      return !!server?.sasl;
    }
    return true;
  }

  getDisplayedCountryUsers(country: any): number {
    return (country?.serverList ?? []).reduce((sum: number, server: any) => sum + (server?.userCount ?? 0), 0);
  }

  constructor(
    private serverListService: ServerListService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngAfterViewInit() {
    this.queueScrollCheckedModeIntoView();
  }

  private queueScrollCheckedModeIntoView() {
    requestAnimationFrame(() => this.scrollCheckedModeIntoView());
  }

  private scrollCheckedModeIntoView() {
    const host = this.modeScroll?.nativeElement;
    if (!host) return;

    const checkedLabel = host.querySelector('input.btn-check:checked + label') as HTMLElement | null;
    if (!checkedLabel) return;

    checkedLabel.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  ngOnInit() {
    this.data = this.serverListService.getServerList().subscribe({
      next: data => {
        this.data = data;
      },
      error: err => this.errorMessage = err
    });

    this.route.queryParams.subscribe(params => {
      this.embed = params["embed"] === 'true';

      const openEnabled = this.isTruthyQueryParam(params, 'open');

      const saslPresent = Object.prototype.hasOwnProperty.call(params, 'sasl');
      const saslEnabled = this.isTruthyQueryParam(params, 'sasl');

      const flatPresent = Object.prototype.hasOwnProperty.call(params, 'flat');
      const flatEnabled = this.isTruthyQueryParam(params, 'flat');

      const countryPresent = Object.prototype.hasOwnProperty.call(params, 'country');
      const countryRaw = countryPresent ? params['country'] : undefined;
      const countryRawString = countryPresent ? String(countryRaw ?? '').trim() : '';
      const countryNormalized = countryRawString.toLowerCase();
      const countryValue = /^[a-z]{2}$/.test(countryNormalized) ? countryNormalized : null;

      this.updatingFromUrl = true;
      if (saslEnabled) {
        this.mode = 'SASL';
      } else if (openEnabled) {
        this.mode = 'OPEN';
      } else {
        this.mode = 'ALL';
      }
      this.flatView = flatEnabled;
      this.country = countryValue;
      this.updatingFromUrl = false;

      // make sure active segment is visible on narrow screens
      this.queueScrollCheckedModeIntoView();

      // Canonicalization (keep your old behavior; shortened here)
      const bothPresent = saslEnabled && openEnabled;
      if (bothPresent) {
        this.syncUrlWithFilters();
      }
    });
  }

  onModeChanged(_: any) {
    this.syncUrlWithFilters();
    this.queueScrollCheckedModeIntoView();
  }

  resetFilters() {
    this.mode = 'ALL';
    this.syncUrlWithFilters();
    this.queueScrollCheckedModeIntoView();
  }

  clearCountry() {
    this.country = null;
    this.syncUrlWithFilters();
  }

  syncUrlWithFilters() {
    if (this.updatingFromUrl) {
      return;
    }

    const queryParams: any = {
      sasl: this.mode === 'SASL' ? 'true' : null,
      open: this.mode === 'OPEN' ? 'true' : null,
      flat: this.flatView ? 'true' : null,
      country: this.country ? this.country : null,

      nocountry: null,
      hideCountry: null,
      hidecountry: null
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private isTruthyQueryParam(params: any, key: string): boolean {
    if (!Object.prototype.hasOwnProperty.call(params, key)) {
      return false;
    }

    const raw = params[key];
    if (raw === undefined || raw === null || raw === '') {
      return true;
    }

    const value = String(raw).trim().toLowerCase();
    if (["true", "1"].includes(value)) return true;
    if (["false", "0"].includes(value)) return false;

    return true;
  }

  getFormattedDateDifference(date1String: string): string {
    const date1 = new Date(date1String);
    date1.setMilliseconds(0);
    const now = new Date(this.data.now);
    now.setMilliseconds(0);

    const diffSeconds = (now.getTime() - date1.getTime()) / 1000;

    const days = Math.floor(diffSeconds / 86400);
    const hours = Math.floor(diffSeconds / 3600) % 24;
    const minutes = Math.floor(diffSeconds / 60) % 60;
    const seconds = Math.floor(diffSeconds % 60);

    const result: Array<string> = [];
    result.push(days + ' days');
    result.push(hours + ' hours');
    result.push(minutes + ' minutes');
    result.push(seconds + ' seconds');

    while (result[0].startsWith('0') && result.length > 1) {
      result.shift();
    }

    return result.join(', ');
  }

  getFormattedLastSeenTime(date1String: string): string {
    const date1 = new Date(date1String);
    date1.setMilliseconds(0);
    const now = new Date(this.data.now);
    now.setMilliseconds(0);

    const diffSeconds = (now.getTime() - date1.getTime()) / 1000;
    const days = Math.floor(diffSeconds / 86400);
    const hours = Math.floor(diffSeconds / 3600) % 24;
    const minutes = Math.floor(diffSeconds / 60) % 60;
    const seconds = Math.floor(diffSeconds % 60);

    if (days !== 0) return days + ' days';

    if (hours !== 0) {
      if (hours < 3 && minutes !== 0) return hours + ' h ' + minutes + ' min';
      return hours + (hours === 1 ? ' hour' : ' hours');
    }

    if (minutes !== 0) return minutes + (minutes === 1 ? ' minute' : ' minutes');
    if (seconds !== 0) return seconds + ' seconds';

    return "";
  }
}
