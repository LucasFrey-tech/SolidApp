import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { UsuarioBeneficioService } from '../../src/Modules/user/usuario-beneficio/usuario-beneficio.service';
import { UsuarioBeneficio } from '../../src/Entities/usuario-beneficio.entity';
import { BeneficiosUsuarioEstado } from '../../src/Modules/benefit/dto/enum/enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PerfilUsuario } from '../../src/Entities/perfil_Usuario.entity';
import { Beneficios } from '../../src/Entities/beneficio.entity';

describe('UsuarioBeneficioService', () => {
  let service: UsuarioBeneficioService;
  let repo: DeepMockProxy<Repository<UsuarioBeneficio>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioBeneficioService,
        {
          provide: getRepositoryToken(UsuarioBeneficio),
          useValue: mockDeep<Repository<UsuarioBeneficio>>(),
        },
      ],
    }).compile();

    service = module.get<UsuarioBeneficioService>(UsuarioBeneficioService);
    repo = module.get(getRepositoryToken(UsuarioBeneficio));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getByUsuario', () => {
    it('debe retornar beneficios del usuario', async () => {
      repo.find.mockResolvedValue([]);

      const result = await service.getByUsuario(1);

      expect(repo.find).toHaveBeenCalledWith({
        where: { usuario: { id: 1 } },
        relations: ['beneficio'],
        order: { fecha_reclamo: 'DESC' },
      });

      expect(result).toEqual([]);
    });
  });

  describe('reclamarBeneficio', () => {
    it('debe acumular beneficio si ya existe activo', async () => {
      const existing: UsuarioBeneficio = {
        id: 1,
        cantidad: 1,
        usados: 0,
        estado: BeneficiosUsuarioEstado.ACTIVO,
        fecha_reclamo: new Date(),
        usuario: { id: 1 } as PerfilUsuario,
        beneficio: { id: 2 } as Beneficios,
      } as UsuarioBeneficio;

      repo.findOne.mockResolvedValue(existing);
      repo.save.mockResolvedValue({
        ...existing,
        cantidad: 2,
      });

      const result = await service.reclamarBeneficio(1, 2);

      expect(repo.findOne).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
      expect(result.cantidad).toBe(2);
    });

    it('debe crear nuevo beneficio si no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      const nuevo: UsuarioBeneficio = {
        id: 2,
        cantidad: 1,
        usados: 0,
        estado: BeneficiosUsuarioEstado.ACTIVO,
        fecha_reclamo: new Date(),
        usuario: { id: 1 } as PerfilUsuario,
        beneficio: { id: 2 } as Beneficios,
      } as UsuarioBeneficio;

      repo.create.mockReturnValue(nuevo);
      repo.save.mockResolvedValue(nuevo);

      const result = await service.reclamarBeneficio(1, 2);

      expect(repo.create).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
      expect(result.cantidad).toBe(1);
    });
  });

  describe('usarBeneficio', () => {
    it('debe lanzar NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.usarBeneficio(1)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequest si no está activo', async () => {
      const registro: UsuarioBeneficio = {
        id: 1,
        cantidad: 1,
        usados: 0,
        estado: BeneficiosUsuarioEstado.USADO,
        fecha_reclamo: new Date(),
        usuario: { id: 1 } as PerfilUsuario,
        beneficio: { id: 2 } as Beneficios,
      } as UsuarioBeneficio;

      repo.findOne.mockResolvedValue(registro);

      await expect(service.usarBeneficio(1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequest si no hay disponibles', async () => {
      const registro: UsuarioBeneficio = {
        id: 1,
        cantidad: 1,
        usados: 1,
        estado: BeneficiosUsuarioEstado.ACTIVO,
        fecha_reclamo: new Date(),
        usuario: { id: 1 } as PerfilUsuario,
        beneficio: { id: 2 } as Beneficios,
      } as UsuarioBeneficio;

      repo.findOne.mockResolvedValue(registro);

      await expect(service.usarBeneficio(1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe usar beneficio parcialmente', async () => {
      const registro: UsuarioBeneficio = {
        id: 1,
        cantidad: 2,
        usados: 0,
        estado: BeneficiosUsuarioEstado.ACTIVO,
        fecha_reclamo: new Date(),
        usuario: { id: 1 } as PerfilUsuario,
        beneficio: { id: 2 } as Beneficios,
      } as UsuarioBeneficio;

      repo.findOne.mockResolvedValue(registro);
      repo.save.mockResolvedValue({
        ...registro,
        usados: 1,
      });

      const result = await service.usarBeneficio(1);

      expect(repo.save).toHaveBeenCalled();
      expect(result.usados).toBe(1);
    });

    it('debe marcar como USADO cuando se consume el último', async () => {
      const registro: UsuarioBeneficio = {
        id: 1,
        cantidad: 1,
        usados: 0,
        estado: BeneficiosUsuarioEstado.ACTIVO,
        fecha_reclamo: new Date(),
        usuario: { id: 1 } as PerfilUsuario,
        beneficio: { id: 2 } as Beneficios,
      } as UsuarioBeneficio;

      repo.findOne.mockResolvedValue(registro);

      repo.save.mockImplementation(async (r) => r);

      const result = await service.usarBeneficio(1);

      expect(result.estado).toBe(BeneficiosUsuarioEstado.USADO);
      expect(result.usados).toBe(1);
      expect(result.fecha_uso).toBeDefined();
    });
  });
});
