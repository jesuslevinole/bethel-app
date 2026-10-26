// Error con un mensaje pensado para mostrarse tal cual al usuario (p. ej. "está en uso en…").
export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserFacingError';
  }
}
