export type IntroStepKind =
  | 'mission_story'
  | 'stem_role_model'
  | 'space_context'
  | 'driving_question'
  | 'rover_explanation'
  | 'level_transition';

export interface IntroDialogueStep {
  id: string;
  kind: IntroStepKind;
  title: string;
  subtitle?: string;
  body: string;
  emphasis?: string;
}

export const INTRO_DIALOGUE_STEPS: IntroDialogueStep[] = [
  {
    id: 'intro_mission_story',
    kind: 'mission_story',
    title: 'INICIO DE MISIÓN',
    subtitle: 'Mini historia',
    body: 'La estación ApuLab recibe una misión de exploración espacial y necesita preparar sus sistemas antes de avanzar.'
  },
  {
    id: 'intro_stem_role_model',
    kind: 'stem_role_model',
    title: 'REFERENTE STEM',
    subtitle: 'Presentación breve',
    body: 'Este paso presentará a una referente femenina STEM conectada con exploración, cálculo, ingeniería o astronomía.'
  },
  {
    id: 'intro_space_context',
    kind: 'space_context',
    title: 'CONTEXTO ESPACIAL',
    subtitle: 'Explorar a distancia',
    body: 'Este paso explicará por qué las misiones espaciales necesitan herramientas para observar, medir y tomar decisiones.'
  },
  {
    id: 'intro_driving_question',
    kind: 'driving_question',
    title: 'PREGUNTA DE MISIÓN',
    subtitle: 'Pensamiento científico',
    body: 'Este paso planteará una pregunta detonante sobre cómo explorar de forma segura un lugar como Marte.'
  },
  {
    id: 'intro_rover_explanation',
    kind: 'rover_explanation',
    title: 'QUÉ ES UN ROVER',
    subtitle: 'Opportunity acompaña la misión',
    body: 'Un rover es un robot explorador con ruedas, sensores, cámaras, computadora y comunicación con la misión.',
    emphasis: 'Antes de programarlo, hay que preparar su energía, sensores y calibración.'
  },
  {
    id: 'intro_level_1_transition',
    kind: 'level_transition',
    title: 'LEVEL 1',
    subtitle: 'Prepara tu rover',
    body: 'Entrada al laboratorio del rover.'
  }
];
