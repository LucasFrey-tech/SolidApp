/**
 * Representa la estructura del payload contenido dentro del JWT.
 *
 * Este objeto:
 * - Se genera al momento de hacer login
 * - Se firma dentro del token
 * - Se recupera automáticamente al validar el JWT
 *
 * Es utilizado para:
 * - Tipar `request.user`
 * - Tipar el decorador `@CurrentUser()`
 * - Mantener consistencia en todo el sistema de autenticación
 */
export interface JwtPayload {
  /**
   * Identificador único del usuario autenticado
   */
  id: number;

  /**
   * Email del usuario (dato común para auditoría o lógica de negocio)
   */
  email: string;

  /**
   * Rol del usuario dentro del sistema (ADMIN, USER, etc.)
   */
  rol: string;
}
/**
 * Representa la estructura del payload contenido dentro del JWT.
 *
 * Este objeto:
 * - Se genera al momento de hacer login
 * - Se firma dentro del token
 * - Se recupera automáticamente al validar el JWT
 *
 * Es utilizado para:
 * - Tipar `request.user`
 * - Tipar el decorador `@CurrentUser()`
 * - Mantener consistencia en todo el sistema de autenticación
 */
export interface JwtPayload {
  /**
   * Identificador único del usuario autenticado
   */
  id: number;

  /**
   * Email del usuario (dato común para auditoría o lógica de negocio)
   */
  email: string;

  /**
   * Rol del usuario dentro del sistema (ADMIN, USER, etc.)
   */
  rol: string;
}
