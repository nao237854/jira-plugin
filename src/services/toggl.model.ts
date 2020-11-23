export interface IToggl {
  addWorkLog(params: IAddWorkLog): Promise<void>;
  startTimeEntry(params: IStartTimeEntry): Promise<void>;
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

export interface IStartTimeEntry {
  issueKey: string;
  projectKey: string;
  labels: Array<string>;
  summary: string;
}
