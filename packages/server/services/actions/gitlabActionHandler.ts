import { GitlabClient } from "@server/clients/gitlab.client";
import { ruleAction } from "../../decorators/ruleAction.decorator";
import { ActionTypes, EventNamespaces } from "../../events/eventTypes";

class GitlabActionHandler {
  private gitlabClient = new GitlabClient();

  @ruleAction({
    eventNamespace: EventNamespaces.GitLab,
    eventName: ActionTypes.UpdateAssignee,
    hasParams: true,
  })
  async updateAssigneeAsync(data: any, eventData: any) {
    try {
      const { id } = eventData;
      const { projectId, gitlabIid } = data.data;

      await this.gitlabClient.updateAssignee(projectId, gitlabIid, id);
    } catch (error: any) {
      throw error;
    }
  }
}

export default GitlabActionHandler;
