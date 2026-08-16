import { BatteryOption, ReasonOption, SensorOption, CalibrationStationConfig } from '../types/challenges';

export const BATTERY_OPTIONS: BatteryOption[] = [
  { id: 'bat_a', voltage: 8.6, label: 'Batería A (8.6 V)' },
  { id: 'bat_b', voltage: 12.4, label: 'Batería B (12.4 V)' },
  { id: 'bat_c', voltage: 15.7, label: 'Batería C (15.7 V)' }
];

export const REASON_OPTIONS: ReasonOption[] = [
  { id: 'reason_in_range', label: 'Está dentro del rango requerido.', isCorrect: true },
  { id: 'reason_below_range', label: 'Está por debajo del rango requerido.', isCorrect: false },
  { id: 'reason_above_range', label: 'Está por encima del rango requerido.', isCorrect: false },
  { id: 'reason_random', label: 'La elegí al azar.', isCorrect: false }
];

export const SENSOR_OPTIONS: SensorOption[] = [
  {
    id: 'sensor_nav_cam',
    name: 'Cámara de Navegación',
    description: 'Captura imágenes del terreno para guiar el avance seguro sobre rocas.',
    isPriority: true,
    priorityReason: 'Esencial para desplazarse de forma segura en terreno desconocido.'
  },
  {
    id: 'sensor_temp',
    name: 'Sensor de Temperatura',
    description: 'Monitorea cambios térmicos extremos para proteger los componentes electrónicos.',
    isPriority: true,
    priorityReason: 'Esencial para vigilar los límites térmicos de los instrumentos.'
  },
  {
    id: 'sensor_mineral',
    name: 'Analizador de Minerales',
    description: 'Espectrómetro para inspeccionar la composición del suelo buscando evidencias de agua antigua.',
    isPriority: true,
    priorityReason: 'Objetivo científico clave: investigar señales minerales relacionadas con agua.'
  },
  {
    id: 'sensor_mic',
    name: 'Micrófono Acústico',
    description: 'Graba el sonido del viento atmosférico y el zumbido de los motores.',
    isPriority: false,
    priorityReason: 'Útil para estudio acústico, pero no es la prioridad principal para esta misión inicial.'
  },
  {
    id: 'sensor_wind',
    name: 'Anemómetro de Viento',
    description: 'Mide la velocidad del viento atmosférico y ráfagas de aire.',
    isPriority: false,
    priorityReason: 'Útil para modelos meteorológicos, pero secundario frente a los objetivos geológicos.'
  },
  {
    id: 'sensor_dust',
    name: 'Sensor de Polvo y Radiación',
    description: 'Detecta conteo de partículas en suspensión y niveles de radiación cósmica.',
    isPriority: false,
    priorityReason: 'Útil para estudios de clima a largo plazo, pero no es de primera prioridad.'
  }
];

export const CALIBRATION_STATIONS: CalibrationStationConfig[] = [
  {
    id: 'station_camera',
    name: 'Estación 1: Cámara Óptica',
    reference: 100,
    initialReading: 72,
    validRange: [95, 105],
    unit: 'lux'
  },
  {
    id: 'station_temp',
    name: 'Estación 2: Sensor Térmico',
    reference: -60,
    initialReading: -34,
    validRange: [-62, -58],
    unit: '°C'
  },
  {
    id: 'station_mineral',
    name: 'Estación 3: Espectrómetro Mineral',
    reference: 90,
    initialReading: 32,
    validRange: [90, 100],
    unit: 'nm'
  }
];
