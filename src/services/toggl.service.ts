import * as vscode from 'vscode';
import { configuration, logger } from '.';
import { CONFIG } from '../shared/constants';
import { IAddWorkLog, IStartTimeEntry, IToggl } from './toggl.model';

const togglClient = require('toggl-client');

export default class Toggl implements IToggl {
  togglInstance: any;
  private configWatcher: vscode.Disposable | undefined;

  enabled = false;
  get togglApiKey(): string {
    return configuration.get(CONFIG.TOGGL_API_KEY);
  }

  constructor() {
    if (!!this.togglApiKey) {
      this.configWatcher = vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('jira-plugin.togglApiKey')) {
          this.apiKeyWatcher();
        }
      });
      this.apiKeyWatcher();
    }
  }

  private apiKeyWatcher(togglApiKey = this.togglApiKey): void {
    if (!!togglApiKey) {
      try {
        this.togglInstance = new togglClient({
          apiToken: togglApiKey,
        });
      } catch (e) {
        logger.printErrorMessageInOutputAndShowAlert(e);
      }
    }
    this.enabled = !!this.togglApiKey;
  }

  private mapProjectKeyIfNeeed(value: string): string {
    const projectKeyToMap = configuration.get(CONFIG.TOGGL_PROJECT_KEY_MAPPING);
    projectKeyToMap.forEach((k: string) => {
      if (k.indexOf('=') > 0) {
        const keys = k.split('=');
        value = value.replace(keys[1], keys[0]);
      }
    });
    return value;
  }

  async addWorkLog(params: IAddWorkLog): Promise<any> {
    return await this.togglInstance.timeEntries.create({
      description: `${params.issueKey} ${params.summary}`,
      tags: params.labels,
      duration: params.timeSpentSeconds,
      start: params.started,
      billable: true,
      pid: this.mapProjectKeyIfNeeed(params.projectKey),
      created_with: 'curl',
    });
  }

  async startTimeEntry(params: IStartTimeEntry): Promise<any> {
    return await this.togglInstance.timeEntries.start({
      description: `${params.issueKey} ${params.summary}`,
      tags: params.labels,
      billable: true,
      pid: this.mapProjectKeyIfNeeed(params.projectKey),
      created_with: 'curl',
    });
  }

  async stopTimeEntry(id: number): Promise<any> {
    return await this.togglInstance.timeEntries.stop(id);
  }

  async openWebsite(): Promise<void> {
    // open the issue in the browser
    const url = `https://track.toggl.com/timer`;
    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url));
  }

  public dispose(): any {
    if (!!this.configWatcher) {
      this.configWatcher.dispose();
    }
  }
}
