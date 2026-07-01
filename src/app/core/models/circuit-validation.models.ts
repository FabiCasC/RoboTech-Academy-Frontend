/** Respuesta flexible del backend Spring para POST /circuit/validate */
export interface ValidationFaultDto {
  layer?: string;
  message?: string;
  friendlyMessage?: string;
  friendly_message?: string;
  code?: string;
  [key: string]: unknown;
}

export interface CircuitValidateResponseDto {
  valid?: boolean;
  approved?: boolean;
  passed?: boolean;
  simulationReady?: boolean;
  approvalToken?: string;
  approval_token?: string;
  hardwareErrors?: string[];
  softwareErrors?: string[];
  errors?: string[];
  messages?: string[];
  message?: string;
  faults?: ValidationFaultDto[];
  validationFaults?: ValidationFaultDto[];
}

export type ValidationLayer = 'HARDWARE' | 'FIRMWARE' | 'UNKNOWN';

export interface ValidationFault {
  layer: ValidationLayer;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  simulationReady: boolean;
  approvalToken: string | null;
  hardwareErrors: string[];
  softwareErrors: string[];
  faults: ValidationFault[];
  raw?: CircuitValidateResponseDto;
}
