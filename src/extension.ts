import * as vscode from 'vscode';
import commands from './commands';
import NoWorkingIssuePick from './picks/no-working-issue-pick';
import './services';
import { gitIntegration, issuesExplorer, statusBar, store, toggl } from './services';
import { CONFIG_NAME, NO_WORKING_ISSUE } from './shared/constants';

export const activate = async (context: vscode.ExtensionContext): Promise<void> => {
  const channel: vscode.OutputChannel = vscode.window.createOutputChannel(CONFIG_NAME.toUpperCase());
  context.subscriptions.push(channel);
  store.state.channel = channel;
  store.state.context = context;
  vscode.window.registerTreeDataProvider('issuesExplorer', issuesExplorer);
  context.subscriptions.push(statusBar);
  context.subscriptions.push(gitIntegration);
  context.subscriptions.push(toggl);
  context.subscriptions.push(...commands.register());
  // create Jira Instance and try to connect
  await store.connectToJira();
};

export function deactivate() {
  const workingIssue = { ...store.state.workingIssue } || new NoWorkingIssuePick().pickValue;
  if (!!workingIssue.issue.key && workingIssue.issue.key !== NO_WORKING_ISSUE.key) {
    vscode.commands.executeCommand('jira-plugin.issueAddWorklog', workingIssue.issue.key, workingIssue.trackingTime);
    if (toggl.enabled) {
      toggl.stopTimeEntry(workingIssue.togglTimeEntryId);
    }
  }
}
