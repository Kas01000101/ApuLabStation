import { AssessmentQuestion } from '../types/assessment';

export const PRETEST_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'pre_q1_logic',
    category: 'logic',
    question: '1. Si la antena debe conectar los puntos de señal A, B y C sin repetirse, ¿qué ruta funciona mejor?',
    options: [
      { id: 'opt_a', text: 'Ruta: A ➔ B ➔ C' },
      { id: 'opt_b', text: 'Ruta: A ➔ C ➔ A' },
      { id: 'opt_c', text: 'Ruta: B ➔ B ➔ C' },
      { id: 'opt_d', text: 'Ruta: C ➔ A ➔ A' }
    ]
  },
  {
    id: 'pre_q2_data',
    category: 'data',
    question: '2. La batería del rover debe mantenerse entre 12 V y 13 V para alimentar los instrumentos. ¿Qué valor es seguro?',
    options: [
      { id: 'opt_a', text: '8.6 V' },
      { id: 'opt_b', text: '12.4 V' },
      { id: 'opt_c', text: '15.7 V' },
      { id: 'opt_d', text: '5.0 V' }
    ]
  },
  {
    id: 'pre_q3_prog',
    category: 'programming',
    question: '3. ¿Qué orden de pasos hace que el rover avance 3 pasos hacia la muestra de roca?',
    options: [
      { id: 'opt_a', text: 'AVANZAR ➔ AVANZAR ➔ AVANZAR' },
      { id: 'opt_b', text: 'GIRAR IZQUIERDA ➔ GIRAR DERECHA ➔ DETENER' },
      { id: 'opt_c', text: 'AVANZAR ➔ GIRAR DERECHA' },
      { id: 'opt_d', text: 'GIRAR IZQUIERDA ➔ AVANZAR' }
    ]
  },
  {
    id: 'pre_q4_stem',
    category: 'perception',
    question: '4. ¿Cómo te sientes al resolver desafíos de programación y misiones espaciales?',
    options: [
      { id: 'opt_a', text: '🌟 ¡Muy entusiasta y con confianza!' },
      { id: 'opt_b', text: '👍 Con curiosidad por aprender más' },
      { id: 'opt_c', text: '🤔 Con algunas dudas, pero con ganas de probar' },
      { id: 'opt_d', text: '🚀 Listo/a para explorar con Opportunity' }
    ]
  }
];
