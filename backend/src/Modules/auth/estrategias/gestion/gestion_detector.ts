import { GestionInfo } from '../../interfaces/gestion_info';
import { EmpresaGestionStrategy } from './gestion_empresa.strategy';
import { OrganizacionGestionStrategy } from './gestion_organizacion.strategy';

export class GestionDetector {
  constructor(
    private readonly empresaStrategy: EmpresaGestionStrategy,
    private readonly organizacionStrategy: OrganizacionGestionStrategy,
  ) {}

  async detectar(usuarioId: number): Promise<GestionInfo | null> {
    const strategies = [this.empresaStrategy, this.organizacionStrategy];

    for (const strategy of strategies) {
      const gestion = await strategy.detectar(usuarioId);

      if (gestion) return gestion;
    }

    return null;
  }
}
