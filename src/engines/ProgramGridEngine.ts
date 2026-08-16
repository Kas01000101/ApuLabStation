import { ProgramGridChallengeConfig, GridCommand, LandingPhaseConfig } from '../types/challenges';
import { LANDING_PHASES } from '../data/programmingChallenges';

export type Orientation = 'north' | 'east' | 'south' | 'west';

export interface GridSimulationState {
  x: number;
  y: number;
  orientation: Orientation;
  pathHistory: { x: number; y: number }[];
}

export class ProgramGridEngine {
  // --- Grid Simulation Logic ---
  public static expandCommands(commands: GridCommand[]): GridCommand[] {
    const expanded: GridCommand[] = [];
    for (const cmd of commands) {
      if (cmd === 'REPEAT_2_MOVE') {
        expanded.push('MOVE_FORWARD', 'MOVE_FORWARD');
      } else if (cmd === 'REPEAT_3_MOVE') {
        expanded.push('MOVE_FORWARD', 'MOVE_FORWARD', 'MOVE_FORWARD');
      } else {
        expanded.push(cmd);
      }
    }
    return expanded;
  }

  public static simulateProgram(
    config: ProgramGridChallengeConfig,
    commands: GridCommand[]
  ): {
    success: boolean;
    errorCode?: string;
    feedback: string;
    states: GridSimulationState[];
    loopUsed: boolean;
    repeatCount: number;
    blocksSaved: number;
  } {
    const expanded = ProgramGridEngine.expandCommands(commands);
    const loopUsed = commands.some(c => c === 'REPEAT_2_MOVE' || c === 'REPEAT_3_MOVE');
    const repeatCount = commands.filter(c => c === 'REPEAT_2_MOVE' || c === 'REPEAT_3_MOVE').length;
    const blocksSaved = expanded.length - commands.length;

    // Check block limit if configured
    if (config.blockLimit && commands.length > config.blockLimit) {
      // Simulate trajectory to see if it reaches goal
      const traj = ProgramGridEngine.runTrajectory(config, expanded);
      if (traj.reachedGoal) {
        return {
          success: false,
          errorCode: 'block_limit',
          feedback: 'La ruta funciona, pero el rover necesita un programa más corto. Busca una acción repetida.',
          states: traj.states,
          loopUsed,
          repeatCount,
          blocksSaved
        };
      }
    }

    const traj = ProgramGridEngine.runTrajectory(config, expanded);
    if (!traj.reachedGoal) {
      return {
        success: false,
        errorCode: traj.errorCode || 'incomplete_route',
        feedback: traj.feedback,
        states: traj.states,
        loopUsed,
        repeatCount,
        blocksSaved
      };
    }

    return {
      success: true,
      feedback: config.successMessage,
      states: traj.states,
      loopUsed,
      repeatCount,
      blocksSaved
    };
  }

  private static runTrajectory(
    config: ProgramGridChallengeConfig,
    expanded: GridCommand[]
  ): { reachedGoal: boolean; errorCode?: string; feedback: string; states: GridSimulationState[] } {
    let currX = config.start.x;
    let currY = config.start.y;
    let currOrient = config.start.orientation;

    const states: GridSimulationState[] = [
      { x: currX, y: currY, orientation: currOrient, pathHistory: [{ x: currX, y: currY }] }
    ];

    const orientOrder: Orientation[] = ['north', 'east', 'south', 'west'];

    for (let i = 0; i < expanded.length; i++) {
      const cmd = expanded[i];

      if (cmd === 'TURN_LEFT') {
        const idx = (orientOrder.indexOf(currOrient) + 3) % 4;
        currOrient = orientOrder[idx];
      } else if (cmd === 'TURN_RIGHT') {
        const idx = (orientOrder.indexOf(currOrient) + 1) % 4;
        currOrient = orientOrder[idx];
      } else if (cmd === 'MOVE_FORWARD') {
        let nextX = currX;
        let nextY = currY;

        if (currOrient === 'north') nextY -= 1;
        else if (currOrient === 'east') nextX += 1;
        else if (currOrient === 'south') nextY += 1;
        else if (currOrient === 'west') nextX -= 1;

        // Check grid boundary
        if (nextX < 0 || nextX >= config.gridSize.cols || nextY < 0 || nextY >= config.gridSize.rows) {
          states.push({ x: nextX, y: nextY, orientation: currOrient, pathHistory: [...states[states.length - 1].pathHistory] });
          return {
            reachedGoal: false,
            errorCode: 'out_of_bounds',
            feedback: 'El rover detectó un límite no seguro de la cuadrícula. Revisa tu elección y ajusta la orientación.',
            states
          };
        }

        // Check obstacles
        const hitObstacle = config.obstacles.some(obs => obs.x === nextX && obs.y === nextY);
        if (hitObstacle) {
          states.push({ x: nextX, y: nextY, orientation: currOrient, pathHistory: [...states[states.length - 1].pathHistory] });
          return {
            reachedGoal: false,
            errorCode: 'collision',
            feedback: 'El rover encontró un obstáculo rocoso. Prueba otra ruta a su alrededor.',
            states
          };
        }

        currX = nextX;
        currY = nextY;
      }

      states.push({
        x: currX,
        y: currY,
        orientation: currOrient,
        pathHistory: [...states[states.length - 1].pathHistory, { x: currX, y: currY }]
      });
    }

    const reached = currX === config.goal.x && currY === config.goal.y;
    if (!reached) {
      return {
        reachedGoal: false,
        errorCode: 'wrong_orientation',
        feedback: 'La simulación finalizó antes de llegar a la bandera verde. Revisa tu elección.',
        states
      };
    }

    return {
      reachedGoal: true,
      feedback: config.successMessage,
      states
    };
  }

  // --- 3C Landing Case Engine ---
  public static testLandingPhase(
    phaseIndex: number,
    actionId: string,
    reasonId: string
  ): { success: boolean; errorCode?: string; feedback: string } {
    const phase = LANDING_PHASES[phaseIndex];
    if (!phase) {
      return { success: false, feedback: 'Fase de aterrizaje no válida.' };
    }

    const action = phase.actions.find(a => a.id === actionId);
    const reason = phase.reasons.find(r => r.id === reasonId);

    if (!action || !action.isCorrect) {
      let errCode = 'wrong_condition';
      if (phaseIndex === 0) errCode = 'shield_early';
      else if (phaseIndex === 1) errCode = 'parachute_early';
      else if (phaseIndex === 2) errCode = 'airbags_missing';
      else if (phaseIndex === 3) errCode = 'deploy_while_moving';

      return {
        success: false,
        errorCode: errCode,
        feedback: 'El rover necesita otra condición para esta fase de aterrizaje. Revisa tu elección de acción.'
      };
    }

    if (!reason || !reason.isCorrect) {
      return {
        success: false,
        errorCode: 'wrong_condition',
        feedback: 'La acción seleccionada es segura, ¡pero revisa tu explicación científica!'
      };
    }

    return {
      success: true,
      feedback: phaseIndex === 3
        ? 'Secuencia de aterrizaje validada. El rover envía sus primeros datos científicos.'
        : `¡Fase ${phaseIndex + 1} validada con éxito!`
    };
  }
}
