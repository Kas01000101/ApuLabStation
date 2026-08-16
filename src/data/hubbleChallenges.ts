import { GraphChallengeConfig } from '../types/challenges';

export const HUBBLE_CHALLENGES: GraphChallengeConfig[] = [
  {
    id: '1A_HUBBLE_ROUTE',
    title: 'Nivel 1A: Aprende la Ruta',
    subtitle: 'Recuperación de Señal Hubble - Básico',
    instruction: 'Conecta todos los puntos de señal comenzando desde A para recuperar la transmisión satelital.',
    successMessage: '¡La primera parte de la señal ha sido recuperada!',
    hint: 'Haz clic en los nodos conectados en secuencia. Asegúrate de visitar los puntos A, B, C y D.',
    nodes: [
      { id: 'A', label: 'Punto A', x: 300, y: 220 },
      { id: 'B', label: 'Punto B', x: 550, y: 220 },
      { id: 'C', label: 'Punto C', x: 300, y: 460 },
      { id: 'D', label: 'Punto D', x: 550, y: 460 }
    ],
    edges: [
      { from: 'A', to: 'B' },
      { from: 'A', to: 'C' },
      { from: 'B', to: 'D' },
      { from: 'C', to: 'D' }
    ],
    startNode: 'A',
    requiredNodes: ['A', 'B', 'C', 'D']
  },
  {
    id: '1B_HUBBLE_DEAD_END',
    title: 'Nivel 1B: Evita un Callejón sin Salida',
    subtitle: 'Anticipación y Corrección de Ruta',
    instruction: 'Selecciona una ruta que visite los 5 nodos sin atrapar la señal en un callejón sin salida.',
    successMessage: 'La imagen se vuelve más clara. Parece un planeta rojo.',
    hint: '¡Planifica con anticipación! Revisa a dónde lleva cada camino para no dejar ningún nodo atrás.',
    nodes: [
      { id: 'A', label: 'Punto A', x: 240, y: 340 },
      { id: 'B', label: 'Punto B', x: 440, y: 200 },
      { id: 'C', label: 'Punto C', x: 440, y: 480 },
      { id: 'D', label: 'Punto D', x: 640, y: 200 },
      { id: 'E', label: 'Punto E', x: 640, y: 480 }
    ],
    edges: [
      { from: 'A', to: 'B' },
      { from: 'A', to: 'C' },
      { from: 'B', to: 'D' },
      { from: 'D', to: 'E' },
      { from: 'C', to: 'E' }
    ],
    startNode: 'A',
    requiredNodes: ['A', 'B', 'C', 'D', 'E']
  },
  {
    id: '1C_HUBBLE_TRANSFER',
    title: 'Nivel 1C: Transfiere la Lógica',
    subtitle: 'Alineación Final de Señal',
    instruction: 'Aplica la lógica para recorrer las 5 estaciones en la matriz compleja de comunicación.',
    successMessage: '¡Bloqueo de señal completado!',
    marsRevealedMsg: 'Destino identificado: Marte.',
    hint: 'Busca múltiples rutas válidas que conecten B, D y E.',
    nodes: [
      { id: 'A', label: 'Punto A', x: 220, y: 340 },
      { id: 'B', label: 'Punto B', x: 400, y: 200 },
      { id: 'C', label: 'Punto C', x: 400, y: 480 },
      { id: 'D', label: 'Punto D', x: 580, y: 340 },
      { id: 'E', label: 'Punto E', x: 740, y: 340 }
    ],
    edges: [
      { from: 'A', to: 'B' },
      { from: 'A', to: 'C' },
      { from: 'B', to: 'D' },
      { from: 'C', to: 'D' },
      { from: 'D', to: 'E' },
      { from: 'B', to: 'E' }
    ],
    startNode: 'A',
    requiredNodes: ['A', 'B', 'C', 'D', 'E']
  }
];
