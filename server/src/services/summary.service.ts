import { summaryWorkflow } from "../ai/workflows/summary.workflow";

class SummaryService {
  async generate(
    projectId: string,
    projectName: string
  ) {
    return summaryWorkflow.execute({
      projectId,
      projectName,
    });
  }
}

export default new SummaryService();