import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard de autenticación JWT.
 *
 * Extiende el AuthGuard de Passport configurado con la estrategia 'jwt'.
 * Se encarga de:
 * - Validar el token JWT
 * - Verificar su firma y expiración
 * - Inyectar el payload decodificado en `request.user`
 *
 * Este guard se utiliza para proteger rutas que requieren autenticación.
 *
 * Ejemplo de uso:
 * ```
 * @UseGuards(JwtAuthGuard)
 * ```
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
