export interface LogQueryInterface {
  since?: string;
  until?: string;
  cursor?: string;
  users?: Array<string>;
  limit?: number;
}
