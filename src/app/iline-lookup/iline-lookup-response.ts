export interface IlineLookupResponse {
  request: ({
    address: string;
    hostname: string;
  });

  response: ({
    serverName: string;
    serverInfo: string;
  })[];

}
