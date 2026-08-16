import { BATTERY_OPTIONS, REASON_OPTIONS, SENSOR_OPTIONS, CALIBRATION_STATIONS } from '../data/roverChallenges';
import { BatteryOption, ReasonOption, SensorOption, CalibrationStationConfig } from '../types/challenges';

export class RoverLabEngine {
  // --- 2A: Battery Engine ---
  public static testBatterySelection(
    batteryId: string,
    reasonId: string,
    attemptNumber: number
  ): { success: boolean; errorCode?: string; feedback: string } {
    const battery = BATTERY_OPTIONS.find(b => b.id === batteryId);
    const reason = REASON_OPTIONS.find(r => r.id === reasonId);

    if (!battery) {
      return { success: false, errorCode: 'no_battery_selected', feedback: 'Por favor selecciona una batería para probar.' };
    }

    if (battery.voltage < 12.0) {
      return {
        success: false,
        errorCode: 'below_range',
        feedback: `El voltaje es ${battery.voltage} V. Está por debajo del rango requerido (12 V a 13 V). Revisa tu elección.`
      };
    }

    if (battery.voltage > 13.0) {
      return {
        success: false,
        errorCode: 'above_range',
        feedback: `El voltaje es ${battery.voltage} V. Está por encima del rango requerido (12 V a 13 V). Revisa tu elección.`
      };
    }

    if (!reason || !reason.isCorrect) {
      return {
        success: false,
        errorCode: 'wrong_reason',
        feedback: 'El voltaje de la batería está en el rango correcto, ¡pero revisa tu explicación!'
      };
    }

    return {
      success: true,
      feedback: 'Energía compatible. El rover puede alimentar sus instrumentos.'
    };
  }

  // --- 2B: Sensor Engine ---
  public static testSensorSelection(
    selectedSensorIds: string[]
  ): { success: boolean; errorCode?: string; feedback: string; missingPriorityNames: string[] } {
    if (selectedSensorIds.length !== 3) {
      return {
        success: false,
        errorCode: 'slot_limit',
        feedback: 'Selecciona exactamente 3 sensores para esta configuración de misión.',
        missingPriorityNames: []
      };
    }

    const prioritySensorIds = SENSOR_OPTIONS.filter(s => s.isPriority).map(s => s.id);
    const selectedPriorityCount = selectedSensorIds.filter(id => prioritySensorIds.includes(id)).length;

    const missingPriority = SENSOR_OPTIONS
      .filter(s => s.isPriority && !selectedSensorIds.includes(s.id))
      .map(s => s.name);

    if (selectedPriorityCount < 3) {
      const nonPrioritySelected = SENSOR_OPTIONS.filter(
        s => !s.isPriority && selectedSensorIds.includes(s.id)
      );
      const names = nonPrioritySelected.map(s => s.name).join(', ');

      return {
        success: false,
        errorCode: 'missing_priority',
        feedback: `El sensor (${names}) es útil, pero otro es prioritario para esta misión. Ajusta tu selección para cubrir necesidades esenciales.`,
        missingPriorityNames: missingPriority
      };
    }

    return {
      success: true,
      feedback: 'Sensores prioritarios instalados.',
      missingPriorityNames: []
    };
  }

  // --- 2C: System Calibration Engine ---
  public currentReadings: Record<string, number> = {};
  public calibrationAttempts: Record<string, number> = {};

  constructor() {
    CALIBRATION_STATIONS.forEach(st => {
      this.currentReadings[st.id] = st.initialReading;
      this.calibrationAttempts[st.id] = 0;
    });
  }

  public adjustStationReading(stationId: string, delta: number): number {
    if (this.currentReadings[stationId] !== undefined) {
      this.currentReadings[stationId] += delta;
    }
    return this.currentReadings[stationId] ?? 0;
  }

  public testCalibrationStation(
    stationId: string
  ): { success: boolean; errorCode?: string; feedback: string; signedError: number; absoluteError: number } {
    const station = CALIBRATION_STATIONS.find(s => s.id === stationId);
    if (!station) {
      return { success: false, feedback: 'Estación no encontrada.', signedError: 0, absoluteError: 0 };
    }

    this.calibrationAttempts[stationId] = (this.calibrationAttempts[stationId] || 0) + 1;
    const currentVal = this.currentReadings[stationId];
    const [minValid, maxValid] = station.validRange;
    const signedError = currentVal - station.reference;
    const absoluteError = Math.abs(signedError);

    if (currentVal < minValid) {
      return {
        success: false,
        errorCode: 'still_low',
        feedback: `La lectura de ${currentVal} ${station.unit} está por debajo del rango (${minValid} a ${maxValid}). Estás cerca; ajusta el valor otra vez.`,
        signedError,
        absoluteError
      };
    }

    if (currentVal > maxValid) {
      return {
        success: false,
        errorCode: 'overshoot',
        feedback: `La lectura de ${currentVal} ${station.unit} superó el rango objetivo (${minValid} a ${maxValid}). Estás cerca; ajusta el valor otra vez.`,
        signedError,
        absoluteError
      };
    }

    return {
      success: true,
      feedback: `¡${station.name} calibrada con éxito!`,
      signedError,
      absoluteError
    };
  }

  public isAllCalibrated(): boolean {
    return CALIBRATION_STATIONS.every(st => {
      const val = this.currentReadings[st.id];
      return val >= st.validRange[0] && val <= st.validRange[1];
    });
  }
}
