import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from './jwt-payload.interface';

/**
 * Decorador personalizado que permite acceder al usuario autenticado
 * directamente desde los parámetros de un controller.
 *
 * Internamente obtiene el objeto Request de Express y retorna la propiedad
 * `request.user`, que fue inyectada por Passport JWT luego de una
 * autenticación exitosa.
 *
 * Uso típico:
 * ```
 * create(
 *   @CurrentUser() user: JwtPayload
 * )
 * ```
 *
 * Beneficios:
 * - Evita acceder manualmente a `req.user`
 * - Elimina el uso de `any`
 * - Centraliza el acceso al usuario autenticado
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();

    // Se realiza un type assertion porque:
    // - Sabemos que JwtAuthGuard garantiza la existencia de `request.user`
    return request.user as JwtPayload;
  },
);
