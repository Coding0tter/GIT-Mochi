import { GitlabApiClient } from "../../clients/gitlabApiClient";
import { ruleAction } from "../../decorators/ruleActionDecorator";
import { EventNamespaces, ActionTypes } from "../../events/eventTypes";

class GitlabActionHandler {
  private gitlabApiClient: GitlabApiClient;

  constructor() {
    this.gitlabApiClient = new GitlabApiClient();
  }

  @ruleAction({
    eventNamespace: EventNamespaces.GitLab,
    eventName: ActionTypes.UpdateAssignee,
    hasParams: true,
  })
  async updateAssigneeAsync(data: any, eventData: any) {
    try {
      const { id } = eventData;
      const { projectId, gitlabIid } = data.data;


      await this.gitlabApiClient.request(
        `/projects/${projectId}/merge_requests/${gitlabIid}`,
        "PUT",
        { assignee_id: id }
      );

      console.log("Assignee updated");
    } catch (error: any) {
      throw error;
    }
  }
}

export default GitlabActionHandler;
