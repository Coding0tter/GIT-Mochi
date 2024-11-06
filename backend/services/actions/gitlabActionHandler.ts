import { ruleAction } from "../../decorators/ruleActionDecorator";
import { EventNamespaces, ActionTypes } from "../../events/eventTypes";

class GitlabActionHandler {
  constructor() {}

  @ruleAction({
    eventNamespace: EventNamespaces.GitLab,
    eventName: ActionTypes.UpdateAssignee,
    hasParams: true,
  })
  async updateAssigneeAsync(data: any, eventData: any) {
    console.log("Updating assignee");
  }
}

export default GitlabActionHandler;
