// Document type definitions for downloadable resources

export type DocumentType = 'family_agreement' | '30_day_plan';

export interface FamilyAgreementData {
  type: 'family_agreement';
  familyName?: string;
  dateCreated: string;
  sections: {
    familyValues: string[];
    screenTimeRules: Array<{
      rule: string;
      details?: string;
    }>;
    deviceRules: Array<{
      device: string;
      rules: string[];
    }>;
    aiUsageGuidelines: string[];
    consequences: string[];
    rewards: string[];
    exceptions: string[];
    reviewSchedule?: string;
  };
  signatures?: {
    parents: string[];
    children: string[];
  };
}

export interface ThirtyDayPlanData {
  type: '30_day_plan';
  familyName?: string;
  dateCreated: string;
  childAge?: string;
  mainGoal: string;
  overview: string;
  weeks: Array<{
    weekNumber: number;
    theme: string;
    goals: string[];
    dailyActions: Array<{
      day: string;
      action: string;
    }>;
    tips: string[];
  }>;
  successMetrics: string[];
  troubleshooting: Array<{
    challenge: string;
    solution: string;
  }>;
}

export type DocumentData = FamilyAgreementData | ThirtyDayPlanData;

// Configuration for which modules support document generation
export interface DocumentConfig {
  moduleId: string;
  documentType: DocumentType;
  label: string;
  description: string;
  starterPromptLabel: string;
}

// Module IDs that support document generation
// These will be matched against the actual module IDs in the database
export const DOCUMENT_ENABLED_MODULES: Record<string, DocumentConfig> = {
  // Module 16: The Family Technology Agreement
  // Module 21: Your 30-Day Quick Start
  // Note: These will be configured by module order number since UUIDs vary
};

// Helper to check if a module supports document generation based on order number
export const getDocumentConfigByOrderNumber = (orderNumber: number): DocumentConfig | null => {
  switch (orderNumber) {
    case 16:
      return {
        moduleId: '', // Will be filled dynamically
        documentType: 'family_agreement',
        label: 'Generate Family Technology Agreement',
        description: 'Create a personalized agreement for your family',
        starterPromptLabel: 'Create my Family Technology Agreement',
      };
    case 21:
      return {
        moduleId: '',
        documentType: '30_day_plan',
        label: 'Generate 30-Day Action Plan',
        description: 'Create a personalized week-by-week plan',
        starterPromptLabel: 'Create my 30-Day Plan',
      };
    default:
      return null;
  }
};

// Document generation prompts for the AI
export const DOCUMENT_GENERATION_PROMPTS: Record<DocumentType, string> = {
  family_agreement: `You are helping a parent create a Family Technology Agreement. Your job is to gather information about their family's needs and then generate a complete, personalized agreement.

First, ask the parent a few questions to understand their situation:
1. What are the ages of your children?
2. What devices does your family currently use?
3. What are your biggest concerns or challenges with technology use right now?
4. What values are most important to your family around technology?

After gathering this information, generate a comprehensive Family Technology Agreement in the following JSON format:

\`\`\`json
{
  "type": "family_agreement",
  "sections": {
    "familyValues": ["value1", "value2", ...],
    "screenTimeRules": [{"rule": "rule text", "details": "optional details"}],
    "deviceRules": [{"device": "device name", "rules": ["rule1", "rule2"]}],
    "aiUsageGuidelines": ["guideline1", "guideline2"],
    "consequences": ["consequence1", "consequence2"],
    "rewards": ["reward1", "reward2"],
    "exceptions": ["exception1", "exception2"],
    "reviewSchedule": "When to review this agreement"
  }
}
\`\`\`

When you're ready to generate the document, output ONLY the JSON block above with no additional text before or after it. The parent will see a download button appear.`,

  '30_day_plan': `You are helping a parent create a personalized 30-Day Action Plan to improve their family's relationship with technology. Your job is to understand their situation and create a realistic, achievable week-by-week plan.

First, ask the parent:
1. What's your child's age and what devices do they use most?
2. What's the ONE biggest change you want to see in 30 days?
3. What's currently working well that you want to maintain?
4. What time of day is most challenging for screen time?

After gathering this information, generate a complete 30-Day Plan in the following JSON format:

\`\`\`json
{
  "type": "30_day_plan",
  "mainGoal": "The primary goal for this plan",
  "overview": "Brief overview of the approach",
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "Week theme",
      "goals": ["goal1", "goal2"],
      "dailyActions": [
        {"day": "Monday", "action": "Specific action"},
        {"day": "Tuesday", "action": "Specific action"}
      ],
      "tips": ["tip1", "tip2"]
    }
  ],
  "successMetrics": ["How to measure success"],
  "troubleshooting": [
    {"challenge": "Common challenge", "solution": "How to handle it"}
  ]
}
\`\`\`

When you're ready to generate the document, output ONLY the JSON block above with no additional text before or after it. The parent will see a download button appear.`,
};
