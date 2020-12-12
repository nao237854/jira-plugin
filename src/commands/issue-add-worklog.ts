import { logger, store, utilities } from '../services';
import { NO_WORKING_ISSUE } from '../shared/constants';

export default async function issueAddWorklog(issueKey: string, timeSpentSeconds: number): Promise<void> {
  try {
    if (issueKey !== NO_WORKING_ISSUE.key) {
      if (store.canExecuteJiraAPI()) {
        // call Jira API
        const actualTimeSpentSeconds = Math.ceil(timeSpentSeconds / 60) * 60;
        const startedTime = new Date(Date.now());
        store.state.jira.addWorkLog({
          issueKey,
          timeSpentSeconds: actualTimeSpentSeconds,
          started: utilities.dateToLocalISO(startedTime),
        });
      }
    }
  } catch (err) {
    logger.printErrorMessageInOutputAndShowAlert(err);
  }
}
