
export interface BantData {
  projectName: string;
  customerName: string;
  dealSize: string;
  budget: string;
  authority: string;
  need: string;
  timeline: string;
  competition: string;
}

export interface BantWeights {
  budget: number;
  authority: number;
  need: number;
  timeline: number;
  competition: number;
}

export interface DetailedScore {
  item: string;      
  criteria: string;  
  inputSummary: string; 
  score: number;     
  progress: string;  
  reasoning: string; 
  analysis: string;  
}

export interface BantEvaluation {
  overallScore: number;
  verdict: 'GO' | 'NURTURE' | 'NO-GO';
  detailedScores: DetailedScore[];
  summaryEvaluation: string;    
  futureActions: string[];      
  milestoneTip: string;         
  strategy: string;             
  riskFactors: string[];        
}

export interface EvaluationRecord {
  timestamp: number;
  input: BantData;
  result: BantEvaluation;
}

export interface SalesProject {
  id: string;
  name: string;
  customerName: string; 
  createdAt: number;
  records: EvaluationRecord[];
}
