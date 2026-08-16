import { GraphChallengeConfig, GraphNode, GraphEdge } from '../types/challenges';

export interface GraphEngineState {
  currentPath: string[];
  attempts: number;
  hintUsed: boolean;
  isCompleted: boolean;
  lastError: string | null;
  logbook: string[];
}

export class GraphChallengeEngine {
  public config: GraphChallengeConfig;
  public state: GraphEngineState;

  constructor(config: GraphChallengeConfig) {
    this.config = config;
    this.state = {
      currentPath: [config.startNode],
      attempts: 0,
      hintUsed: false,
      isCompleted: false,
      lastError: null,
      logbook: [`Ruta iniciada en Nodo ${config.startNode}.`]
    };
  }

  public selectNode(nodeId: string): { success: boolean; errorCode?: string; message: string } {
    if (this.state.isCompleted) {
      return { success: false, message: 'Desafío ya completado.' };
    }

    const currentLast = this.state.currentPath[this.state.currentPath.length - 1];

    // Check if clicking last node to deselect
    if (nodeId === currentLast && this.state.currentPath.length > 1) {
      this.state.currentPath.pop();
      const newLast = this.state.currentPath[this.state.currentPath.length - 1];
      this.state.logbook.push(`Nodo ${nodeId} deseleccionado. Regreso al Nodo ${newLast}.`);
      return { success: true, message: `Regreso al Nodo ${newLast}.` };
    }

    // Check if node is already visited
    if (this.state.currentPath.includes(nodeId)) {
      this.state.lastError = 'repeated_node';
      this.state.logbook.push(`Revisa tu elección: el Nodo ${nodeId} ya fue visitado.`);
      return {
        success: false,
        errorCode: 'repeated_node',
        message: 'Revisa tu elección: este punto ya fue visitado.'
      };
    }

    // Check valid edge connection
    const hasEdge = this.config.edges.some(
      e => (e.from === currentLast && e.to === nodeId) || (e.from === nodeId && e.to === currentLast)
    );

    if (!hasEdge) {
      this.state.lastError = 'invalid_edge';
      this.state.logbook.push(`Sin conexión directa entre ${currentLast} y ${nodeId}.`);
      return {
        success: false,
        errorCode: 'invalid_edge',
        message: 'Prueba otra ruta: no hay conexión directa disponible.'
      };
    }

    this.state.currentPath.push(nodeId);
    this.state.logbook.push(`Nodo ${nodeId} conectado.`);
    return { success: true, message: `Conectado al Nodo ${nodeId}.` };
  }

  public testRoute(): { success: boolean; errorCode?: string; feedback: string } {
    this.state.attempts++;
    const visitedNodes = new Set(this.state.currentPath);
    const requiredNodes = new Set(this.config.requiredNodes);

    // Check missing required nodes
    if (visitedNodes.size < requiredNodes.size) {
      const missingCount = requiredNodes.size - visitedNodes.size;
      
      // Check if current endpoint is a dead end
      const lastNode = this.state.currentPath[this.state.currentPath.length - 1];
      const outgoingEdges = this.config.edges.filter(
        e => (e.from === lastNode || e.to === lastNode)
      );
      const unvisitedNeighbors = outgoingEdges.filter(
        e => !visitedNodes.has(e.from === lastNode ? e.to : e.from)
      );

      if (unvisitedNeighbors.length === 0) {
        this.state.lastError = 'dead_end';
        return {
          success: false,
          errorCode: 'dead_end',
          feedback: 'Esta ruta deja un punto sin conexión segura. Prueba otra opción.'
        };
      }

      this.state.lastError = 'incomplete_path';
      return {
        success: false,
        errorCode: 'incomplete_path',
        feedback: `Buena idea. Seguiste puntos conectados, pero recuerda visitar los ${requiredNodes.size} puntos antes de probar.`
      };
    }

    this.state.isCompleted = true;
    this.state.lastError = null;
    return {
      success: true,
      feedback: this.config.successMessage
    };
  }

  public requestHint(): string {
    this.state.hintUsed = true;
    return this.config.hint;
  }

  public resetPath(): void {
    this.state.currentPath = [this.config.startNode];
    this.state.logbook.push(`Ruta reiniciada en Nodo ${this.config.startNode}.`);
  }
}
