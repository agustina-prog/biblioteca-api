/**
 * Modelo para los mensajes dentro del chat.
 */
export interface MensajeChat {
  remitente: 'usuario' | 'bot';
  texto: string;
  hora: string;
  esError?: boolean;
}
