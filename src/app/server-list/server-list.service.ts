/* tslint:disable:one-line whitespace triple-equals */
import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ServerEntry, ServerList, ServersBySidResponse} from "./server-list";
import {AppSettings} from "../app.settings";

@Injectable({
  providedIn: 'root'
})
export class ServerListService {
  private readonly url = AppSettings.INFOBOT_API_URL + '/serversByCountry';
  private readonly serversBySidUrl = AppSettings.INFOBOT_API_URL + '/servers';

  constructor(private http: HttpClient) {
  }

  getServerList(sid?: string | null): Observable<ServerList> {
    const normalizedSid = sid?.trim();

    if (normalizedSid) {
      return this.http.get<ServersBySidResponse>(`${this.serversBySidUrl}?sid=${encodeURIComponent(normalizedSid)}`).pipe(
        map((response) => this.mapServersBySidResponse(response, normalizedSid)),
        catchError(this.handleError)
      );
    }

    return this.http.get<ServerList>(this.url).pipe(
      catchError(this.handleError)
    );
  }

  private mapServersBySidResponse(response: ServersBySidResponse, sid: string): ServerList {
    const serverList = response.serverDTOList ?? [];
    const totalUsers = serverList.reduce((sum, server) => sum + (server.userCount ?? 0), 0);
    const lastMapReceived = this.getLatestLastSeen(serverList);
    const now = new Date().toISOString();

    return {
      countriesWithServers: [
        {
          countryCode: response.numericCountryCode?.toString() ?? sid,
          countryCodeAlpha2: response.countryCodeAlpha2,
          countryName: response.countryName ?? `Unknown country: ${sid}`,
          totalUsers,
          serverList
        }
      ],
      totalUsers,
      totalServers: serverList.length,
      lastMapReceived,
      now
    };
  }

  private getLatestLastSeen(serverList: ServerEntry[]): string {
    const latestServer = serverList
      .filter((server) => !!server.lastSeen && !Number.isNaN(new Date(server.lastSeen).getTime()))
      .sort((left, right) => new Date(right.lastSeen).getTime() - new Date(left.lastSeen).getTime())[0];

    return latestServer?.lastSeen ?? new Date().toISOString();
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error?.errorMessage) {
      return throwError(() => error.error.errorMessage);
    }
    else {
      return throwError(() => 'Connection error. Please try again.');
    }
  }
}
