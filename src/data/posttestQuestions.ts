import { AssessmentQuestion } from '../types/assessment';

export const POSTTEST_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'post_q1_logic',
    category: 'logic',
    question: '1. Para enrutar una señal satelital por los puntos A, C, D y E de forma segura, ¿qué ruta los visita todos sin quedar atrapada?',
    options: [
      { id: 'opt_a', text: 'Ruta: A ➔ C ➔ E ➔ D' },
      { id: 'opt_b', text: 'Ruta: A ➔ A ➔ D ➔ E' },
      { id: 'opt_c', text: 'Ruta: C ➔ C ➔ E' },
      { id: 'opt_d', text: 'Ruta: D ➔ A ➔ A' }
    ]
  },
  {
    id: 'post_q2_data',
    category: 'data',
    question: '2. El sensor térmico necesita una lectura entre -62°C y -58°C. ¿Cuál lectura está correctamente calibrada?',
    options: [
      { id: 'opt_a', text: '-34°C' },
      { id: 'opt_b', text: '-60°C' },
      { id: 'opt_c', text: '-80°C' },
      { id: 'opt_d', text: '0°C' }
    ]
  },
  {
    id: 'post_q3_prog',
    category: 'programming',
    question: '3. Al avanzar 3 veces seguidas, ¿qué comando hace que el código sea más corto y limpio?',
    options: [
      { id: 'opt_a', text: 'REPETIR x3 AVANZAR' },
      { id: 'opt_b', text: 'AVANZAR + GIRAR IZQUIERDA + GIRAR IZQUIERDA' },
      { id: 'opt_c', text: 'DETENER + AVANZAR' },
      { id: 'opt_d', text: 'GIRAR DERECHA x3' }
    ]
  },
  {
    id: 'post_q4_stem',
    category: 'perception',
    question: '4. Tras completar la misión espacial de APULAB Station, ¿cómo te sientes respecto a la ingeniería y las ciencias?',
    options: [
      { id: 'opt_a', text: '🎓 ¡Me siento como un/a verdadero/a científico/a espacial!' },
      { id: 'opt_b', text: '🚀 Listo/a para enfrentar desafíos más grandes' },
      { id: 'opt_c', text: '💡 Disfruté mucho experimentando y probando' },
      { id: 'opt_d', text: '✨ Con confianza para resolver problemas STEM' }
    ]
  }
];
