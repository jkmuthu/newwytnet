// Workflow Engine for WytAI Agent
// Supports step-by-step guided creation of Modules, Apps, and Hubs

export type WorkflowStepType = 
  | 'choice'          // Multiple choice selection
  | 'input'           // Text input
  | 'analysis'        // AI analyzes and shows requirements
  | 'confirmation'    // User approves/rejects
  | 'execution'       // Auto-creation happens
  | 'report';         // Final report with recommendations

export interface WorkflowStep {
  id: string;
  title: string;
  type: WorkflowStepType;
  prompt: string;
  icon?: string;
  options?: Array<{ value: string; label: string; icon?: string }>;
  nextStep?: string | ((response: string, context: any) => string);
  validate?: (value: string) => boolean | string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  icon: string;
  steps: Record<string, WorkflowStep>;
  initialStep: string;
}

export interface WorkflowState {
  workflowId: string;
  currentStepId: string;
  responses: Record<string, string>;
  context: any;
  isActive: boolean;
}

// Workflow Definitions
export const workflows: Record<string, Workflow> = {
  'create-module-app-hub': {
    id: 'create-module-app-hub',
    name: 'Module/App/Hub உருவாக்கல்',
    description: 'Step-by-step வாக Module, App, அல்லது Hub உருவாக்கவும்',
    icon: '🚀',
    initialStep: 'action-choice',
    steps: {
      'action-choice': {
        id: 'action-choice',
        title: 'செயல் தேர்வு',
        type: 'choice',
        prompt: 'நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?',
        icon: '🎯',
        options: [
          { value: 'new', label: 'புதிதாக தயாரிக்க', icon: '✨' },
          { value: 'modify', label: 'பழையதை மாற்ற', icon: '🔄' }
        ],
        nextStep: 'type-selection'
      },
      'type-selection': {
        id: 'type-selection',
        title: 'வகை தேர்வு',
        type: 'choice',
        prompt: 'எதை உருவாக்க/மாற்ற விரும்புகிறீர்கள்?',
        icon: '📦',
        options: [
          { value: 'module', label: 'Module', icon: '📦' },
          { value: 'app', label: 'App', icon: '📱' },
          { value: 'hub', label: 'Hub', icon: '🌐' }
        ],
        nextStep: 'name-input'
      },
      'name-input': {
        id: 'name-input',
        title: 'பெயர்',
        type: 'input',
        prompt: 'பெயர் என்ன?',
        icon: '✏️',
        nextStep: 'description-input',
        validate: (value) => {
          if (!value || value.trim().length < 3) {
            return 'பெயர் குறைந்தது 3 எழுத்துக்கள் இருக்க வேண்டும்';
          }
          return true;
        }
      },
      'description-input': {
        id: 'description-input',
        title: 'விவரம்',
        type: 'input',
        prompt: 'என்ன வசதிக்காக? (விவரம்)',
        icon: '📝',
        nextStep: 'ai-analysis',
        validate: (value) => {
          if (!value || value.trim().length < 10) {
            return 'விவரம் குறைந்தது 10 எழுத்துக்கள் இருக்க வேண்டும்';
          }
          return true;
        }
      },
      'ai-analysis': {
        id: 'ai-analysis',
        title: 'AI பகுப்பாய்வு',
        type: 'analysis',
        prompt: 'இதற்கு தேவையான அனைத்தையும் AI பகுப்பாய்வு செய்கிறது...',
        icon: '🤖',
        nextStep: 'approval-confirmation'
      },
      'approval-confirmation': {
        id: 'approval-confirmation',
        title: 'Approval',
        type: 'confirmation',
        prompt: 'இவை எல்லாம் தயாரிக்கவா?',
        icon: '✅',
        options: [
          { value: 'approve', label: 'ஆம், தயாரிக்கவும்', icon: '✅' },
          { value: 'modify', label: 'இல்லை, மாற்றவும்', icon: '✏️' }
        ],
        nextStep: (response) => response === 'approve' ? 'execution' : 'description-input'
      },
      'execution': {
        id: 'execution',
        title: 'உருவாக்குதல்',
        type: 'execution',
        prompt: 'உருவாக்கிக் கொண்டிருக்கிறது... தயவுசெய்து காத்திருக்கவும்',
        icon: '⏳',
        nextStep: 'final-report'
      },
      'final-report': {
        id: 'final-report',
        title: 'இறுதி அறிக்கை',
        type: 'report',
        prompt: 'வெற்றிகரமாக உருவாக்கப்பட்டது! 🎉',
        icon: '📊',
        nextStep: undefined  // End of workflow
      }
    }
  }
};

// Workflow Engine Class
export class WorkflowEngine {
  private state: WorkflowState | null = null;

  startWorkflow(workflowId: string): WorkflowState {
    const workflow = workflows[workflowId];
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    this.state = {
      workflowId,
      currentStepId: workflow.initialStep,
      responses: {},
      context: { action: null, type: null, name: null, description: null, requirements: null },
      isActive: true
    };

    return this.state;
  }

  getCurrentStep(): WorkflowStep | null {
    if (!this.state) return null;
    
    const workflow = workflows[this.state.workflowId];
    return workflow.steps[this.state.currentStepId] || null;
  }

  processResponse(response: string): { nextStep: WorkflowStep | null; isComplete: boolean; error?: string } {
    if (!this.state) {
      return { nextStep: null, isComplete: false, error: 'No active workflow' };
    }

    const workflow = workflows[this.state.workflowId];
    const currentStep = workflow.steps[this.state.currentStepId];

    // Validate input
    if (currentStep.validate) {
      const validation = currentStep.validate(response);
      if (validation !== true) {
        return { nextStep: currentStep, isComplete: false, error: validation as string };
      }
    }

    // Store response
    this.state.responses[currentStep.id] = response;

    // Update context based on step
    switch (currentStep.id) {
      case 'action-choice':
        this.state.context.action = response;
        break;
      case 'type-selection':
        this.state.context.type = response;
        break;
      case 'name-input':
        this.state.context.name = response;
        break;
      case 'description-input':
        this.state.context.description = response;
        break;
    }

    // Determine next step
    let nextStepId: string | undefined;
    if (typeof currentStep.nextStep === 'function') {
      nextStepId = currentStep.nextStep(response, this.state.context);
    } else {
      nextStepId = currentStep.nextStep;
    }

    if (!nextStepId) {
      // Workflow complete
      this.state.isActive = false;
      return { nextStep: null, isComplete: true };
    }

    // Move to next step
    this.state.currentStepId = nextStepId;
    const nextStep = workflow.steps[nextStepId];

    return { nextStep, isComplete: false };
  }

  getState(): WorkflowState | null {
    return this.state;
  }

  resetWorkflow(): void {
    this.state = null;
  }

  getProgress(): { current: number; total: number; percentage: number } {
    if (!this.state) return { current: 0, total: 0, percentage: 0 };
    
    const workflow = workflows[this.state.workflowId];
    const totalSteps = Object.keys(workflow.steps).length;
    const currentIndex = Object.keys(workflow.steps).indexOf(this.state.currentStepId) + 1;
    const percentage = Math.round((currentIndex / totalSteps) * 100);

    return { current: currentIndex, total: totalSteps, percentage };
  }
}
