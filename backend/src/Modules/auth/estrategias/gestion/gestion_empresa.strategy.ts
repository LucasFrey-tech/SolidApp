import { Injectable } from '@nestjs/common';
import { GestionTipo } from '../../dto/gestion.enum';
import { GestionInfo } from '../../interfaces/gestion_info';
import { InjectRepository } from '@nestjs/typeorm';
import { EmpresaUsuario } from '../../../../Entities/empresa_usuario.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmpresaGestionStrategy {
  constructor(
    @InjectRepository(EmpresaUsuario)
    private readonly empresaUsuarioRepository: Repository<EmpresaUsuario>,
  ) {}

  async detectar(usuarioId: number): Promise<GestionInfo | null> {
    const relacion = await this.empresaUsuarioRepository.findOne({
      where: { usuario: { id: usuarioId } },
      relations: ['empresa'],
    });

    if (!relacion) return null;

    return {
      tipo: GestionTipo.EMPRESA,
      entidadId: relacion.empresa.id,
    };
  }
}
