export interface RequestLoggerInterface {
  username: string;
  originalUrl: string;
  method: string;
  params: any;
  query: any;
  body: any;
}
