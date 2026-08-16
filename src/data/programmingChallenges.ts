import { ProgramGridChallengeConfig, LandingPhaseConfig } from '../types/challenges';

export const PROGRAMMING_CHALLENGES: ProgramGridChallengeConfig[] = [
  {
    id: '3A_SEQUENCE',
    title: 'Nivel 3A: Secuencia',
    instruction: 'Programa la ruta paso a paso para llegar al sitio de investigación (Meta: X=3, Y=2).',
    gridSize: { cols: 5, rows: 5 },
    start: { x: 0, y: 4, orientation: 'east' },
    goal: { x: 3, y: 2 },
    obstacles: [{ x: 1, y: 4 }],
    availableCommands: ['MOVE_FORWARD', 'TURN_LEFT', 'TURN_RIGHT'],
    hint: 'Avanza rodeando los obstáculos, gira cuando sea necesario y conduce hasta la bandera verde.',
    successMessage: '¡Secuencia completada! Opportunity llegó al sitio.'
  },
  {
    id: '3B_LOOP',
    title: 'Nivel 3B: Optimización con Bucles',
    instruction: 'Usa bloques de repetición para moverte eficientemente dentro del límite de 5 comandos.',
    gridSize: { cols: 6, rows: 6 },
    start: { x: 0, y: 5, orientation: 'north' },
    goal: { x: 3, y: 2 },
    obstacles: [{ x: 0, y: 1 }],
    availableCommands: ['MOVE_FORWARD', 'TURN_LEFT', 'TURN_RIGHT', 'REPEAT_2_MOVE', 'REPEAT_3_MOVE'],
    blockLimit: 5,
    hint: '¡Utiliza REPETIR x3 AVANZAR para ahorrar bloques de código!',
    successMessage: '¡Optimización por bucles verificada! El programa es rápido y compacto.'
  }
];

export const LANDING_PHASES: LandingPhaseConfig[] = [
  {
    id: 'phase_1_entry',
    phaseName: 'Fase 1: Entrada Atmosférica',
    telemetryDisplay: {
      altura: 'Muy Alta (120 km)',
      velocidad: 'Muy Rápida (20,000 km/h)',
      temperatura: 'Elevada (1,500°C)'
    },
    actions: [
      { id: 'act_heat_shield', label: 'Mantener activo el escudo térmico', isCorrect: true },
      { id: 'act_deploy_rover', label: 'Abrir módulo y desplegar rover', isCorrect: false },
      { id: 'act_parachute_early', label: 'Desplegar paracaídas inmediatamente', isCorrect: false }
    ],
    reasons: [
      { id: 'rsn_heat_prot', label: 'El rover necesita protección contra el calor durante la entrada.', isCorrect: true },
      { id: 'rsn_cool_down', label: 'El rover tiene frío y necesita luz solar.', isCorrect: false },
      { id: 'rsn_speed_up', label: 'Ayuda a que la nave se mueva más rápido.', isCorrect: false }
    ]
  },
  {
    id: 'phase_2_parachute',
    phaseName: 'Fase 2: Descenso con Paracaídas',
    telemetryDisplay: {
      altura: 'Alta (10 km)',
      velocidad: 'En Rango de Paracaídas (1,400 km/h)',
      temperatura: 'Estable (-20°C)'
    },
    actions: [
      { id: 'act_open_parachute', label: 'Abrir el paracaídas', isCorrect: true },
      { id: 'act_cut_shield', label: 'Apagar sensores térmicos', isCorrect: false },
      { id: 'act_land_direct', label: 'Caer sin frenar', isCorrect: false }
    ],
    reasons: [
      { id: 'rsn_safe_braking', label: 'El paracaídas reduce la velocidad en condiciones seguras.', isCorrect: true },
      { id: 'rsn_fly_away', label: 'Permite que el rover vuele como cometa.', isCorrect: false },
      { id: 'rsn_photo', label: 'Toma mejores fotos de las nubes.', isCorrect: false }
    ]
  },
  {
    id: 'phase_3_contact',
    phaseName: 'Fase 3: Contacto con la Superficie',
    telemetryDisplay: {
      altura: 'Baja (150 metros)',
      velocidad: 'Peligrosa (200 km/h)',
      superficie: 'Cercana y en aproximación'
    },
    actions: [
      { id: 'act_retro_airbags', label: 'Activar retrocohetes y bolsas de aire', isCorrect: true },
      { id: 'act_wait_impact', label: 'Esperar impacto sin cohetes', isCorrect: false },
      { id: 'act_turn_around', label: 'Girar la nave de cabeza', isCorrect: false }
    ],
    reasons: [
      { id: 'rsn_cushion_impact', label: 'El rover debe desacelerar y amortiguar el impacto.', isCorrect: true },
      { id: 'rsn_make_noise', label: 'Hace ruido fuerte para los científicos.', isCorrect: false },
      { id: 'rsn_spin', label: 'Hace girar la nave con estilo.', isCorrect: false }
    ]
  },
  {
    id: 'phase_4_deployment',
    phaseName: 'Fase 4: Despliegue del Rover',
    telemetryDisplay: {
      movimiento: '0 m/s (Detenido)',
      contacto: 'Confirmado en superficie de Marte',
      sistema: 'Estable'
    },
    actions: [
      { id: 'act_open_deploy', label: 'Abrir módulo y desplegar rover', isCorrect: true },
      { id: 'act_close_hatch', label: 'Bloquear módulo para siempre', isCorrect: false },
      { id: 'act_launch_back', label: 'Lanzar de regreso a la Tierra', isCorrect: false }
    ],
    reasons: [
      { id: 'rsn_stable_start', label: 'El rover se despliega solo cuando el módulo está estable.', isCorrect: true },
      { id: 'rsn_sleep', label: 'El rover necesita dormir adentro.', isCorrect: false },
      { id: 'rsn_dust', label: 'Para evitar tocar suelo marciano.', isCorrect: false }
    ]
  }
];
