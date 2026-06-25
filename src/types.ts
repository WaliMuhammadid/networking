export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  startingTemplate: string;
  expectedPattern: RegExp | ((code: string) => { success: boolean; feedback: string });
  expectedValueDescription: string;
  hint: string;
}

export type ModuleId = 'basics' | 'containers' | 'proxies' | 'dns' | 'security';

export interface LearningModule {
  id: ModuleId;
  title: string;
  subtitle: string;
  estimatedTime: string;
  description: string;
  concepts: {
    title: string;
    text: string;
    diagramType?: 'ports' | 'bridge' | 'proxy' | 'dns-trace' | 'vpc-sg';
    bulletPoints?: string[];
  }[];
  devopsRelevance: {
    scenario: string;
    whyItMatters: string;
    practicalTool: string;
    exampleCodeTitle?: string;
    exampleCode?: string;
    exampleCodeLanguage?: string;
  };
  quizzes: QuizQuestion[];
  assignment: Assignment;
}

export type SimulatorTab = 'port-forwarding' | 'load-balancing' | 'firewall';
