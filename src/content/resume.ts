import { RESUME_TEXT } from "./resume.generated";

// The resume text sent to the chat model as part of its system prompt. Most of it is generated from the resume
// source (npm run resume:sync). What follows is not on the resume, so it is kept here by hand.
export const RESUME = `${RESUME_TEXT}
Roles Caleb is looking for:
Applied AI Engineer, AI Engineer, AI Developer, SDET, AI SDET, Agentic Workflows, AI Agents, Automated Workflows, Automated Processes, Developer Experience (DX), AI Integrations, API Integrations, AI Applications.`;
