import {Component, OnInit} from '@angular/core';
import {ServerListService} from "./server-list.service";
import {CorrectServerDescriptionEncodingPipe} from "../correct-server-description-encoding.pipe";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-server-list',
  standalone: true,
    imports: [
        CorrectServerDescriptionEncodingPipe,
        NgIf,
        NgForOf,
        FormsModule,
        NgClass
    ],
  templateUrl: './server-list.component.html',
  styleUrl: './server-list.component.scss'
})
export class ServerListComponent implements OnInit {
  data: any;
  errorMessage: string = "";
  embed: boolean = false;

  // If enabled (via query param), do not render country headings and show one single table.
  flatView: boolean = false;

  /**
   * Filter mode (mutually exclusive):
   * - ALL  : show all servers
   * - OPEN : show only "open" servers
   * - SASL : show only servers that support SASL
   */
  mode: 'ALL' | 'OPEN' | 'SASL' = 'ALL';

  private updatingFromUrl: boolean = false;

  get flatServers(): any[] {
    const servers: any[] = [];
    for (const country of this.filteredCountries) {
      for (const server of (country.serverList ?? [])) {
        servers.push({
          ...server,
          countryCode: country.countryCode,
          countryName: country.countryName
        });
      }
    }
    return servers;
  }

  get filteredCountries(): any[] {
    const countries = this.data?.countriesWithServers ?? [];
    return countries
      .map((country: any) => ({
        ...country,
        serverList: (country.serverList ?? []).filter((server: any) => this.matchesFilters(server))
      }))
      .filter((country: any) => (country.serverList?.length ?? 0) > 0);
  }

  private matchesFilters(server: any): boolean {
    if (this.mode === 'OPEN') {
      return !!server?.open;
    }
    if (this.mode === 'SASL') {
      return !!server?.sasl;
    }
    return true; // ALL
  }

  getDisplayedCountryUsers(country: any): number {
    return (country?.serverList ?? []).reduce((sum: number, server: any) => sum + (server?.userCount ?? 0), 0);
  }


  constructor(
    private serverListService: ServerListService,
    private route: ActivatedRoute,
    private router: Router
  ) {
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
      const saslRaw = saslPresent ? params['sasl'] : undefined;
      const saslRawNormalized = (saslRaw === undefined || saslRaw === null) ? '' : String(saslRaw).trim().toLowerCase();
      const shouldCanonicalizeSasl =
        (saslEnabled && saslRawNormalized !== 'true') ||
        (!saslEnabled && saslPresent && ["false", "0", "no", "n", "off"].includes(saslRawNormalized));

      const openPresent = Object.prototype.hasOwnProperty.call(params, 'open');
      const openRaw = openPresent ? params['open'] : undefined;
      const openRawNormalized = (openRaw === undefined || openRaw === null) ? '' : String(openRaw).trim().toLowerCase();
      const shouldCanonicalizeOpen =
        (openEnabled && openRawNormalized !== 'true') ||
        (!openEnabled && openPresent && ["false", "0", "no", "n", "off"].includes(openRawNormalized));

      const flatPresent = Object.prototype.hasOwnProperty.call(params, 'flat');
      const flatEnabled = this.isTruthyQueryParam(params, 'flat');

      const flatRaw = flatPresent ? params['flat'] : undefined;
      const flatRawNormalized = (flatRaw === undefined || flatRaw === null) ? '' : String(flatRaw).trim().toLowerCase();
      const shouldCanonicalizeFlat =
        (flatEnabled && flatRawNormalized !== 'true') ||
        (!flatEnabled && flatPresent && ["false", "0"].includes(flatRawNormalized));

      this.updatingFromUrl = true;
      // Mutually exclusive modes: SASL wins over OPEN if both are present.
      if (saslEnabled) {
        this.mode = 'SASL';
      } else if (openEnabled) {
        this.mode = 'OPEN';
      } else {
        this.mode = 'ALL';
      }
      this.flatView = flatEnabled;
      this.updatingFromUrl = false;

      // If both open and sasl are present, canonicalize to only one (SASL).
      const bothPresent = saslEnabled && openEnabled;

      if (shouldCanonicalizeSasl || shouldCanonicalizeOpen || shouldCanonicalizeFlat || bothPresent) {
        this.syncUrlWithFilters();
      }
    });
  }

  onModeChanged(_: any) {
    this.syncUrlWithFilters();
  }

  resetFilters() {
    this.mode = 'ALL';
    this.syncUrlWithFilters();
  }

  private syncUrlWithFilters() {
    if (this.updatingFromUrl) {
      return;
    }

    // Always write sasl=true when enabled (but still accept bare ?sasl on inbound).
    const queryParams: any = {
      // canonical query params
      sasl: this.mode === 'SASL' ? 'true' : null,
      open: this.mode === 'OPEN' ? 'true' : null,
      flat: this.flatView ? 'true' : null,

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
      // ?sasl or ?sasl=
      return true;
    }

    const value = String(raw).trim().toLowerCase();
    if (["true", "1"].includes(value)) {
      return true;
    }
    if (["false", "0"].includes(value)) {
      return false;
    }

    // Unknown value: treat as enabled if the key is present.
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

    if (days !== 0) {
      return days + ' days';
    }

    if (hours !== 0) {
      if (hours < 3 && minutes !== 0) {
        return hours + ' h ' + minutes + ' min';
      }
      else {
        return hours + (hours === 1 ? ' hour' : ' hours');
      }
    }

    if (minutes !== 0) {
      return minutes + (minutes === 1 ? ' minute' : ' minutes');
    }

    if (seconds !== 0) {
      return seconds + ' seconds';
    }

    return "";
  }
}
