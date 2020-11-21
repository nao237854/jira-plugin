export interface IToggl {
  addWorkLog(params: IAddWorkLog): Promise<void>;
  openWebsite(): Promise<void>;
}
export interface IAddWorkLog {
  issueKey: string;
  projectKey: string;
  timeSpentSeconds: number;
  started: string;
  labels: Array<string>;
  summary: string;
}
