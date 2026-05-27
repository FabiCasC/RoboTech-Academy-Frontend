/** Respuesta flexible del backend Spring para POST /circuit/validate */
export interface CircuitValidateResponseDto {
  valid?: boolean;
  approved?: boolean;
  simulationReady?: boolean;
  hardwareErrors?: string[];
  softwareErrors?: string[];
  errors?: string[];
  messages?: string[];
  message?: string;
}

export interface ValidationResult {
  valid: boolean;
  simulationReady: boolean;
  hardwareErrors: string[];
  softwareErrors: string[];
  raw?: CircuitValidateResponseDto;
}
