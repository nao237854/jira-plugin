import { QuickPickItem } from 'vscode';
import { IAssignee } from '../services/http.model';
import { UNASSIGNED } from '../shared/constants';

export default class UnassignedAssigneePick implements QuickPickItem {
  get label(): string {
    return UNASSIGNED;
  }

  get description(): string {
    return UNASSIGNED;
  }

  get pickValue(): IAssignee {
    const emptyAssignee: IAssignee = {
      accountId: null,
      name: '',
      displayName: '',
      active: false,
    };
    return emptyAssignee;
  }
}
