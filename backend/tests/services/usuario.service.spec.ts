import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { mock, MockProxy } from 'jest-mock-extended';

import { PerfilUsuarioService } from '../../src/Modules/user/usuario.service';
import { PerfilUsuario } from '../../src/Entities/perfil_Usuario.entity';
import { Cuenta } from '../../src/Entities/cuenta.entity';
import { CuentaService } from '../../src/Modules/cuenta/cuenta.service';
import { DonacionService } from '../../src/Modules/donation/donacion.service';
import { BeneficioService } from '../../src/Modules/benefit/beneficio.service';
import { UsuarioBeneficioService } from '../../src/Modules/user/usuario-beneficio/usuario-beneficio.service';

import { CreateUsuarioDto } from '../../src/Modules/user/dto/create_usuario.dto';
import { UpdateCredencialesDto } from '../../src/Modules/user/dto/panelUsuario.dto';
import { UpdateUsuarioDto } from '../../src/Modules/user/dto/update_usuario.dto';

import { CreateDonationDto } from '../../src/Modules/donation/dto/create_donation.dto';
import { ResponseDonationDto } from '../../src/Modules/donation/dto/response_donation.dto';
import { PaginatedUserDonationsResponseDto } from '../../src/Modules/donation/dto/response_donation_paginatedByUser.dto';

import { UsuarioBeneficio } from '../../src/Entities/usuario-beneficio.entity';

describe('PerfilUsuarioService', () => {
  let service: PerfilUsuarioService;

  let repository: MockProxy<Repository<PerfilUsuario>>;
  let cuentaService: MockProxy<CuentaService>;
  let donacionService: MockProxy<DonacionService>;
  let beneficioService: MockProxy<BeneficioService>;
  let usuarioBeneficioService: MockProxy<UsuarioBeneficioService>;

  beforeEach(async () => {
    repository = mock<Repository<PerfilUsuario>>();
    cuentaService = mock<CuentaService>();
    donacionService = mock<DonacionService>();
    beneficioService = mock<BeneficioService>();
    usuarioBeneficioService = mock<UsuarioBeneficioService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerfilUsuarioService,
        {
          provide: getRepositoryToken(PerfilUsuario),
          useValue: repository,
        },
        { provide: CuentaService, useValue: cuentaService },
        { provide: DonacionService, useValue: donacionService },
        { provide: BeneficioService, useValue: beneficioService },
        {
          provide: UsuarioBeneficioService,
          useValue: usuarioBeneficioService,
        },
      ],
    }).compile();

    service = module.get(PerfilUsuarioService);
  });

  const mockUsuario = (): PerfilUsuario =>
    ({
      id: 1,
      documento: '123',
      nombre: 'Juan',
      apellido: 'Perez',
      departamento: '2B',
      puntos: 10,
      cuenta: {
        id: 5,
        correo: 'test@mail.com',
        clave: 'hashed',
        role: 'USUARIO',
        calle: 'Calle',
        numero: '123',
        codigo_postal: '1000',
        ciudad: 'Ciudad',
        provincia: 'Provincia',
        prefijo: '+54',
        telefono: '123',
        deshabilitado: false,
        verificada: true,
        fecha_registro: new Date(),
        ultimo_cambio: new Date(),
        ultima_conexion: new Date(),
      } as Cuenta,
    }) as PerfilUsuario;

  describe('create', () => {
    it('debe crear usuario', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.create.mockReturnValue(mockUsuario());
      repository.save.mockResolvedValue(mockUsuario());

      const result = await service.create(
        {
          nombre: 'Juan',
          apellido: 'Perez',
          documento: '123',
        } as CreateUsuarioDto,
        5,
      );

      expect(repository.save).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });

    it('debe lanzar Conflict si ya existe', async () => {
      repository.findOne.mockResolvedValue(mockUsuario());

      await expect(service.create({} as CreateUsuarioDto, 5)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findByCuentaId', () => {
    it('debe devolver el perfil', async () => {
      repository.findOne.mockResolvedValue(mockUsuario());

      const result = await service.findByCuentaId(5);

      expect(result.id).toBe(1);
    });

    it('debe lanzar NotFound', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findByCuentaId(5)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getDonaciones', () => {
    it('debe delegar correctamente', async () => {
      donacionService.findAllPaginatedByUser.mockResolvedValue(
        {} as PaginatedUserDonationsResponseDto,
      );

      await service.getDonaciones(1, 1, 10);

      expect(donacionService.findAllPaginatedByUser).toHaveBeenCalledWith(
        1,
        1,
        10,
      );
    });
  });

  describe('donar', () => {
    it('debe delegar correctamente', async () => {
      donacionService.create.mockResolvedValue({} as ResponseDonationDto);

      await service.donar(1, {} as CreateDonationDto);

      expect(donacionService.create).toHaveBeenCalled();
    });
  });

  describe('getMisCuponesCanjeados', () => {
    it('debe delegar correctamente', async () => {
      usuarioBeneficioService.getByUsuario.mockResolvedValue(
        [] as UsuarioBeneficio[],
      );

      await service.getMisCuponesCanjeados(1);

      expect(usuarioBeneficioService.getByUsuario).toHaveBeenCalledWith(1);
    });
  });

  describe('usarCupon', () => {
    it('debe delegar correctamente', async () => {
      usuarioBeneficioService.usarBeneficio.mockResolvedValue(
        {} as UsuarioBeneficio,
      );

      await service.usarCupon(10);

      expect(usuarioBeneficioService.usarBeneficio).toHaveBeenCalledWith(10);
    });
  });

  describe('canjearCupon', () => {
    it('debe delegar correctamente', async () => {
      beneficioService.canjear.mockResolvedValue({
        success: true,
        cantidadCanjeada: 1,
        puntosGastados: 10,
        puntosRestantes: 90,
        stockRestante: 5,
      });

      await service.canjearCupon(1, 2, 3);

      expect(beneficioService.canjear).toHaveBeenCalledWith(1, 2, 3);
    });
  });

  describe('updateCredenciales', () => {
    it('debe delegar correctamente', async () => {
      cuentaService.updateCredenciales.mockResolvedValue();

      await service.updateCredenciales(5, {} as UpdateCredencialesDto);

      expect(cuentaService.updateCredenciales).toHaveBeenCalledWith(
        5,
        {} as UpdateCredencialesDto,
      );
    });
  });

  describe('updateUsuario', () => {
    it('actualiza usuario con departamento', async () => {
      const user = mockUsuario();

      repository.findOne.mockResolvedValue(user);
      repository.save.mockResolvedValue(user);

      const dto = {
        nombre: 'Nuevo',
        departamento: '3A',
      } as UpdateUsuarioDto;

      const result = await service.updateUsuario(1, dto);

      expect(repository.save).toHaveBeenCalled();
      expect(result.nombre).toBe('Juan');
    });

    it('actualiza usuario sin departamento', async () => {
      const user = mockUsuario();

      repository.findOne.mockResolvedValue(user);

      const dto = {
        nombre: 'Nuevo',
      } as UpdateUsuarioDto;

      const result = await service.updateUsuario(1, dto);

      expect(result.id).toBe(1);
    });

    it('lanza NotFound si no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.updateUsuario(1, {} as UpdateUsuarioDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePuntos', () => {
    it('debe actualizar puntos', async () => {
      const user = mockUsuario();

      repository.findOne.mockResolvedValue(user);

      const updatedUser = { ...user, puntos: 50 };

      repository.save.mockResolvedValue(updatedUser);

      const result = await service.updatePuntos(1, {
        puntos: 50,
      });

      expect(repository.save).toHaveBeenCalled();
      expect(result.puntos).toBe(50);
    });

    it('debe lanzar NotFound', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.updatePuntos(1, { puntos: 10 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getPoints', () => {
    it('debe devolver puntos', async () => {
      repository.findOne.mockResolvedValue(mockUsuario());

      const result = await service.getPoints(1);

      expect(result.puntos).toBe(10);
    });

    it('debe lanzar NotFound', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.getPoints(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('debe devolver usuario', async () => {
      repository.findOne.mockResolvedValue(mockUsuario());

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
    });

    it('debe lanzar NotFound', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('debe deshabilitar usuario', async () => {
      repository.findOne.mockResolvedValue(mockUsuario());

      await service.delete(1);

      expect(cuentaService.deshabilitar).toHaveBeenCalled();
    });

    it('lanza NotFound si no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('restore', () => {
    it('debe habilitar usuario', async () => {
      repository.findOne.mockResolvedValue(mockUsuario());

      await service.restore(1);

      expect(cuentaService.habilitar).toHaveBeenCalled();
    });

    it('lanza NotFound si no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.restore(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findPaginated', () => {
    it('debe devolver usuarios paginados', async () => {
      const qb: any = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockUsuario()], 1]),
      };

      repository.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findPaginated(1, 10, '');

      expect(result.total).toBe(1);
      expect(result.items.length).toBe(1);
    });
  });
});
