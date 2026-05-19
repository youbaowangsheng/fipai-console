export interface Agent {
  id: number;
  name: string;
  agent_type: string;
  status: string;
  is_active: boolean;
  capabilities: string[];
}

export interface Skill {
  name: string;
  description: string;
  parameters: any;
  timeout: number;
  retry: number;
}

export interface Workflow {
  workflow_id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  step_id: number;
  skill_name: string;
  description?: string;
}

export interface Channel {
  name: string;
  location: string;
  health: boolean;
}

export interface Stats {
  total_agents: number;
  total_sessions: number;
  active_users: number;
}

export interface Contact {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
  is_replied: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  is_staff: boolean;
}