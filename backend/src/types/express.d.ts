import type { JwtPayload } from '../Modules/auth/jwt-payload.interface';

/**
 * Extensión del módulo Express para tipar la propiedad `user` en el objeto Request.
 *
 * Passport (a través de la estrategia JWT) inyecta dinámicamente la propiedad
 * `request.user` en tiempo de ejecución cuando la autenticación es exitosa.
 *
 * TypeScript no conoce esta propiedad por defecto, por lo que se realiza
 * una "declaration merging" para extender la interfaz Request de Express.
 *
 * De esta manera:
 * - Se evita el uso de `any`
 * - Se mantiene tipado fuerte
 * - Se elimina el error: "Property 'user' does not exist on type Request"
 */
declare module 'express' {
  interface Request {
    /**
     * Usuario autenticado obtenido desde el JWT.
     * Es opcional porque puede no existir si la ruta no está protegida.
     */
    user?: JwtPayload;
  }
}
