// Level 1: Hubble Graph Challenge Types
export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface GraphChallengeConfig {
  id: string;
  title: string;
  subtitle: string;
  instruction: string;
  successMessage: string;
  marsRevealedMsg?: string;
  hint: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  startNode: string;
  requiredNodes: string[];
}

// Level 2: Rover Lab Challenge Types
export interface BatteryOption {
  id: string;
  voltage: number;
  label: string;
}

export interface ReasonOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface SensorOption {
  id: string;
  name: string;
  description: string;
  isPriority: boolean;
  priorityReason: string;
}

export interface CalibrationStationConfig {
  id: string;
  name: string;
  reference: number;
  initialReading: number;
  validRange: [number, number];
  unit: string;
}

// Level 3: Program Mission Challenge Types
export type GridCommand = 'MOVE_FORWARD' | 'TURN_LEFT' | 'TURN_RIGHT' | 'REPEAT_2_MOVE' | 'REPEAT_3_MOVE';

export interface LandingPhaseConfig {
  id: string;
  phaseName: string;
  telemetryDisplay: Record<string, string>;
  actions: { id: string; label: string; isCorrect: boolean }[];
  reasons: { id: string; label: string; isCorrect: boolean }[];
}

export interface ProgramGridChallengeConfig {
  id: string;
  title: string;
  instruction: string;
  gridSize: { cols: number; rows: number };
  start: { x: number; y: number; orientation: 'north' | 'east' | 'south' | 'west' };
  goal: { x: number; y: number };
  obstacles: { x: number; y: number }[];
  availableCommands: GridCommand[];
  blockLimit?: number;
  hint: string;
  successMessage: string;
}
