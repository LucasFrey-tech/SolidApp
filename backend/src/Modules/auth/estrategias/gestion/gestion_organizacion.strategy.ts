import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizacionUsuario } from '../../../../Entities/organizacion_usuario.entity';
import { GestionTipo } from '../../dto/gestion.enum';
import { GestionInfo } from '../../interfaces/gestion_info';

@Injectable()
export class OrganizacionGestionStrategy {
  constructor(
    @InjectRepository(OrganizacionUsuario)
    private readonly orgUsuarioRepo: Repository<OrganizacionUsuario>,
  ) {}

  async detectar(usuarioId: number): Promise<GestionInfo | null> {
    const relacion = await this.orgUsuarioRepo.findOne({
      where: { usuario: { id: usuarioId } },
      relations: ['organizacion'],
    });

    if (!relacion) return null;

    return {
      tipo: GestionTipo.ORGANIZACION,
      entidadId: relacion.organizacion.id,
    };
  }
}
