import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, MockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { PerfilOrganizacionService } from '../../src/Modules/organizacion/organizacion.service';
import { Organizacion } from '../../src/Entities/organizacion.entity';
import { OrganizacionUsuario } from '../../src/Entities/organizacion_usuario.entity';
import { Usuario } from '../../src/Entities/usuario.entity';
import { CampaignsService } from '../../src/Modules/campaign/campaign.service';
import { DonacionService } from '../../src/Modules/donation/donacion.service';
import { UsuarioService } from '../../src/Modules/user/usuario.service';
import { HashService } from '../../src/common/bcryptService/hashService';
import { InvitacionesService } from '../../src/Modules/invitaciones/invitacion.service';
import { DataSource } from 'typeorm';

import { CreateCampaignsDto } from '../../src/Modules/campaign/dto/create_campaigns.dto';
import { UpdateCampaignsDto } from '../../src/Modules/campaign/dto/update_campaigns.dto';
import { UpdateDonacionEstadoDto } from '../../src/Modules/donation/dto/update_donation_estado.dto';
import { CreateOrganizacionDto } from '../../src/Modules/organizacion/dto/create_organizacion.dto';
import { UpdateOrganizacionDto } from '../../src/Modules/organizacion/dto/update_organizacion.dto';
import { ResponseCampaignsDetailPaginatedDto } from '../../src/Modules/campaign/dto/response_campaign_paginated.dto';
import { PaginatedOrganizationDonationsResponseDto } from '../../src/Modules/donation/dto/response_donation_paginatedByOrganizacion.dto';
import { ResponseCampaignsDto } from '../../src/Modules/campaign/dto/response_campaigns.dto';
import { ResponseDonationDto } from '../../src/Modules/donation/dto/response_donation.dto';
import { DonacionEstado } from '../../src/Modules/donation/enum';
import { ResponseOrganizacionDto } from '../../src/Modules/organizacion/dto/response_organizacion.dto';

describe('PerfilOrganizacionService', () => {
  let service: PerfilOrganizacionService;
  let organizacionRepository: MockProxy<Repository<Organizacion>>;
  let organizacionUsuarioRepository: MockProxy<Repository<OrganizacionUsuario>>;
  let campaignService: MockProxy<CampaignsService>;
  let donacionService: MockProxy<DonacionService>;
  let usuarioService: MockProxy<UsuarioService>;
  let hashService: MockProxy<HashService>;
  let invitacionesService: MockProxy<InvitacionesService>;
  let dataSource: MockProxy<DataSource>;

  const USUARIO_ID = 10;
  const ORG_ID = 1;
  const GESTOR_ID = 99;

  let mockOrganizacion: Organizacion;
  let mockOrgUsuario: OrganizacionUsuario;

  beforeEach(async () => {
    organizacionRepository = mock<Repository<Organizacion>>();
    organizacionUsuarioRepository = mock<Repository<OrganizacionUsuario>>();
    campaignService = mock<CampaignsService>();
    donacionService = mock<DonacionService>();
    usuarioService = mock<UsuarioService>();
    hashService = mock<HashService>();
    invitacionesService = mock<InvitacionesService>();
    dataSource = mock<DataSource>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerfilOrganizacionService,
        {
          provide: getRepositoryToken(Organizacion),
          useValue: organizacionRepository,
        },
        {
          provide: getRepositoryToken(OrganizacionUsuario),
          useValue: organizacionUsuarioRepository,
        },
        {
          provide: CampaignsService,
          useValue: campaignService,
        },
        {
          provide: DonacionService,
          useValue: donacionService,
        },
        {
          provide: UsuarioService,
          useValue: usuarioService,
        },
        {
          provide: HashService,
          useValue: hashService,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
        {
          provide: InvitacionesService,
          useValue: invitacionesService,
        },
      ],
    }).compile();

    service = module.get<PerfilOrganizacionService>(PerfilOrganizacionService);

    // ========== Entidades base ==========
    mockOrganizacion = {
      id: ORG_ID,
      cuit: '30123456789',
      razon_social: 'Fundación Legal S.A.',
      nombre_organizacion: 'Fundación Esperanza',
      descripcion: 'Descripción de prueba',
      verificada: false,
      habilitada: true,
      web: 'https://org.com',
      fecha_registro: new Date(),
      ultimo_cambio: new Date(),
      contacto: {
        id: 1,
        correo: 'org@mail.com',
        prefijo: '+54',
        telefono: '1123456789',
      } as any,
      direccion: {
        id: 1,
        calle: 'Av. Siempreviva',
        numero: '742',
        provincia: 'Buenos Aires',
        ciudad: 'CABA',
        codigo_postal: '1234',
      } as any,
      campaign: [],
    } as unknown as Organizacion;

    mockOrgUsuario = {
      id: 1,
      organizacion: mockOrganizacion,
      usuario: { id: USUARIO_ID } as Usuario,
      activo: true,
    } as unknown as OrganizacionUsuario;
  });

  afterEach(() => jest.clearAllMocks());

  // ========== TESTS DE FIND PAGINATED ==========
  describe('findPaginated', () => {
    it('debe retornar organizaciones paginadas', async () => {
      const queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockOrganizacion], 1]),
      };
      organizacionRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as any,
      );

      const result = await service.findPaginated(1, 10, '');

      expect(result.total).toBe(1);
      expect(result.items[0].id).toBe(ORG_ID);
      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('debe aplicar filtro de búsqueda cuando se proporciona', async () => {
      const queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockOrganizacion], 1]),
      };
      organizacionRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as any,
      );

      await service.findPaginated(1, 10, 'Fun');

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(organizacion.razon_social LIKE :search OR organizacion.nombre_organizacion LIKE :search)',
        { search: '%Fun%' },
      );
    });

    it('debe respetar la paginación', async () => {
      const queryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };
      organizacionRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as any,
      );

      await service.findPaginated(3, 5, '');

      expect(queryBuilder.skip).toHaveBeenCalledWith(10);
      expect(queryBuilder.take).toHaveBeenCalledWith(5);
    });
  });

  // ========== TESTS DE GET ORGANIZACION BY USUARIO ==========
  describe('getOrganizacionByUsuario', () => {
    it('debe retornar la organización del usuario', async () => {
      organizacionUsuarioRepository.findOne.mockResolvedValue(mockOrgUsuario);

      const result = await service.getOrganizacionByUsuario(USUARIO_ID);

      expect(result.id).toBe(ORG_ID);
      expect(organizacionUsuarioRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id_usuario: USUARIO_ID, activo: true },
        }),
      );
    });

    it('debe lanzar ForbiddenException si el usuario no gestiona ninguna organización', async () => {
      organizacionUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getOrganizacionByUsuario(USUARIO_ID),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ========== TESTS DE FIND BY ID ==========
  describe('findById', () => {
    it('debe retornar la organización por ID', async () => {
      organizacionRepository.findOne.mockResolvedValue(mockOrganizacion);

      const result = await service.findById(ORG_ID);

      expect(result.id).toBe(ORG_ID);
      expect(organizacionRepository.findOne).toHaveBeenCalledWith({
        where: { id: ORG_ID },
      });
    });

    it('debe lanzar NotFoundException si la organización no existe', async () => {
      organizacionRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ========== TESTS DE GET CAMPAIGNS ==========
  describe('getCampaigns', () => {
    it('debe delegar correctamente a campaignService', async () => {
      const response: ResponseCampaignsDetailPaginatedDto = {
        items: [],
        total: 0,
      };
      campaignService.findCampaignsPaginated.mockResolvedValue(response);

      const result = await service.getCampaigns(ORG_ID, 1, 10);

      expect(result).toBe(response);
      expect(campaignService.findCampaignsPaginated).toHaveBeenCalledWith(
        ORG_ID,
        1,
        10,
      );
    });
  });

  // ========== TESTS DE GET DONACIONES ==========
  describe('getDonaciones', () => {
    it('debe delegar correctamente a donacionService sin search', async () => {
      const response: PaginatedOrganizationDonationsResponseDto = {
        items: [],
        total: 0,
      };
      donacionService.findAllPaginatedByOrganizacion.mockResolvedValue(response);

      const result = await service.getDonaciones(ORG_ID, 1, 10);

      expect(result).toBe(response);
      expect(donacionService.findAllPaginatedByOrganizacion).toHaveBeenCalledWith(
        ORG_ID,
        1,
        10,
        undefined,
      );
    });

    it('debe pasar el parámetro search cuando se proporciona', async () => {
      const response: PaginatedOrganizationDonationsResponseDto = {
        items: [],
        total: 0,
      };
      donacionService.findAllPaginatedByOrganizacion.mockResolvedValue(response);

      await service.getDonaciones(ORG_ID, 1, 10, 'juan@mail.com');

      expect(donacionService.findAllPaginatedByOrganizacion).toHaveBeenCalledWith(
        ORG_ID,
        1,
        10,
        'juan@mail.com',
      );
    });
  });

  // ========== TESTS DE CONFIRMAR DONACION ==========
  describe('confirmarDonacion', () => {
    it('debe delegar correctamente con gestorId', async () => {
      const dto: UpdateDonacionEstadoDto = { estado: DonacionEstado.APROBADA };
      const response: ResponseDonationDto = {
        id: 1,
        titulo: 'Donación de alimentos',
        detalle: 'Arroz y fideos',
        tipo: 'ALIMENTO',
        cantidad: 10,
        estado: DonacionEstado.APROBADA,
        puntos: 500,
        campaignId: 3,
        userId: 12,
        fecha_registro: new Date(),
        imagen: 'imagen.jpg',
      };

      donacionService.confirmarDonacion.mockResolvedValue(response);

      const result = await service.confirmarDonacion(1, dto, GESTOR_ID);

      expect(result).toBe(response);
      expect(donacionService.confirmarDonacion).toHaveBeenCalledWith(
        1,
        dto,
        GESTOR_ID,
      );
    });
  });

  // ========== TESTS DE CREATE CAMPAIGN ==========
  describe('createCampaign', () => {
    it('debe delegar correctamente a campaignService con usuarioId', async () => {
      const dto: CreateCampaignsDto = {
        titulo: 'Campaña',
        descripcion: 'Desc',
        fecha_Inicio: new Date(),
        fecha_Fin: new Date(),
        objetivo: 1000,
        puntos: 10,
      };
      const response = {} as ResponseCampaignsDto;
      campaignService.create.mockResolvedValue(response);

      const result = await service.createCampaign(ORG_ID, dto, [], USUARIO_ID);

      expect(result).toBe(response);
      expect(campaignService.create).toHaveBeenCalledWith(
        ORG_ID,
        dto,
        [],
        USUARIO_ID,
      );
    });
  });

  // ========== TESTS DE UPDATE CAMPAIGN ==========
  describe('updateCampaign', () => {
    it('debe delegar correctamente a campaignService con usuarioId', async () => {
      const dto: UpdateCampaignsDto = { titulo: 'Nueva' };
      const response = {} as ResponseCampaignsDto;
      campaignService.update.mockResolvedValue(response);

      const result = await service.updateCampaign(ORG_ID, dto, USUARIO_ID);

      expect(result).toBe(response);
      expect(campaignService.update).toHaveBeenCalledWith(
        ORG_ID,
        dto,
        USUARIO_ID,
        undefined,
      );
    });

    it('debe pasar imagenes cuando se proporcionan', async () => {
      const dto: UpdateCampaignsDto = { titulo: 'Nueva' };
      const imagenes = ['/img1.jpg', '/img2.jpg'];
      const response = {} as ResponseCampaignsDto;
      campaignService.update.mockResolvedValue(response);

      await service.updateCampaign(ORG_ID, dto, USUARIO_ID, imagenes);

      expect(campaignService.update).toHaveBeenCalledWith(
        ORG_ID,
        dto,
        USUARIO_ID,
        imagenes,
      );
    });
  });

  // ========== TESTS DE REGISTRAR ORGANIZACION ==========
  describe('registrarOrganizacion', () => {
    const createDto: CreateOrganizacionDto = {
      nombre: 'Juan',
      apellido: 'Pérez',
      documento: '12345678',
      correo: 'juan@org.com',
      clave: 'Password123',
      prefijo: '11',
      telefono: '1123456789',
      correo_organizacion: 'contacto@org.com',
      cuit_organizacion: '30123456789',
      razon_social: 'Fundación Ayudar',
      nombre_organizacion: 'Ayudar',
      calle: 'Av. Siempreviva',
      numero: '742',
    };

    it('debe registrar una organización correctamente', async () => {
      const mockGestor = { id: 99 } as Usuario;
      const mockOrgGuardada = { ...mockOrganizacion, id: 2 };

      dataSource.transaction.mockImplementation(async (cb: any) => {
        const mockManager = {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === Usuario) {
              return {
                findOne: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockReturnValue(mockGestor),
                save: jest.fn().mockResolvedValue(mockGestor),
              };
            }
            if (entity === Organizacion) {
              return {
                findOne: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockReturnValue(mockOrgGuardada),
                save: jest.fn().mockResolvedValue(mockOrgGuardada),
              };
            }
            if (entity === OrganizacionUsuario) {
              return {
                create: jest.fn().mockReturnValue({}),
                save: jest.fn().mockResolvedValue({}),
              };
            }
            return {};
          }),
        };
        return cb(mockManager);
      });

      hashService.hash.mockResolvedValue('hashed-password');

      const result = await service.registrarOrganizacion(createDto);

      expect(result).toBeInstanceOf(ResponseOrganizacionDto);
      expect(dataSource.transaction).toHaveBeenCalled();
    });

    it('debe lanzar ConflictException si ya existe organización con ese CUIT', async () => {
      dataSource.transaction.mockImplementation(async (cb: any) => {
        const mockManager = {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === Organizacion) {
              return {
                findOne: jest.fn().mockResolvedValue(mockOrganizacion),
              };
            }
            return { findOne: jest.fn().mockResolvedValue(null) };
          }),
        };
        return cb(mockManager);
      });

      await expect(service.registrarOrganizacion(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('debe lanzar ConflictException si ya existe usuario con ese documento', async () => {
      dataSource.transaction.mockImplementation(async (cb: any) => {
        const mockManager = {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === Organizacion) {
              return { findOne: jest.fn().mockResolvedValue(null) };
            }
            if (entity === Usuario) {
              return {
                findOne: jest.fn().mockResolvedValue({ id: 50 }),
              };
            }
            return { findOne: jest.fn().mockResolvedValue(null) };
          }),
        };
        return cb(mockManager);
      });

      await expect(service.registrarOrganizacion(createDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('debe lanzar ConflictException si ya existe usuario con ese correo', async () => {
      dataSource.transaction.mockImplementation(async (cb: any) => {
        const mockManager = {
          getRepository: jest.fn().mockImplementation((entity) => {
            if (entity === Organizacion) {
              return { findOne: jest.fn().mockResolvedValue(null) };
            }
            if (entity === Usuario) {
              return {
                findOne: jest
                  .fn()
                  .mockResolvedValueOnce(null)
                  .mockResolvedValueOnce({ id: 50 }),
              };
            }
            return { findOne: jest.fn().mockResolvedValue(null) };
          }),
        };
        return cb(mockManager);
      });

      await expect(service.registrarOrganizacion(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ========== TESTS DE UPDATE ==========
  describe('update', () => {
    const updateDto: UpdateOrganizacionDto = { descripcion: 'Nueva desc' };

    it('debe actualizar la organización correctamente', async () => {
      const orgPreload = { ...mockOrganizacion, descripcion: 'Nueva desc' };
      organizacionUsuarioRepository.findOne.mockResolvedValue({
        ...mockOrgUsuario,
        organizacion: {
          ...mockOrganizacion,
          contacto: mockOrganizacion.contacto,
          direccion: mockOrganizacion.direccion,
        },
      } as OrganizacionUsuario);
      organizacionRepository.preload.mockResolvedValue(
        orgPreload as Organizacion,
      );
      organizacionRepository.save.mockResolvedValue(orgPreload as Organizacion);

      const result = await service.update(updateDto, USUARIO_ID);

      expect(result).toBeInstanceOf(ResponseOrganizacionDto);
      expect(organizacionRepository.save).toHaveBeenCalled();
    });

    it('debe actualizar contacto si se proporciona', async () => {
      const updateConContacto: UpdateOrganizacionDto = {
        contacto: { telefono: '1198765432' },
      };
      const orgPreload = { ...mockOrganizacion };
      organizacionUsuarioRepository.findOne.mockResolvedValue(mockOrgUsuario);
      organizacionRepository.preload.mockResolvedValue(
        orgPreload as Organizacion,
      );
      organizacionRepository.save.mockResolvedValue(orgPreload as Organizacion);

      await service.update(updateConContacto, USUARIO_ID);

      expect(organizacionRepository.preload).toHaveBeenCalledWith(
        expect.objectContaining({
          contacto: expect.objectContaining({ telefono: '1198765432' }),
        }),
      );
    });

    it('debe lanzar NotFoundException si el usuario no gestiona ninguna organización', async () => {
      organizacionUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.update(updateDto, USUARIO_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar NotFoundException si la organización no existe en preload', async () => {
      organizacionUsuarioRepository.findOne.mockResolvedValue(mockOrgUsuario);
      organizacionRepository.preload.mockResolvedValue(undefined);

      await expect(service.update(updateDto, USUARIO_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ========== TESTS DE VERIFY ==========
  describe('verify', () => {
    it('debe marcar la organización como verificada', async () => {
      const orgSinVerificar = { ...mockOrganizacion, verificada: false };
      const orgVerificada = { ...mockOrganizacion, verificada: true };

      organizacionRepository.findOne.mockResolvedValue(
        orgSinVerificar as Organizacion,
      );
      organizacionRepository.save.mockResolvedValue(
        orgVerificada as Organizacion,
      );

      const result = await service.verify(ORG_ID);

      expect(result.verificada).toBe(true);
      expect(organizacionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ verificada: true }),
      );
    });

    it('debe lanzar NotFoundException si la organización no existe', async () => {
      organizacionRepository.findOne.mockResolvedValue(null);

      await expect(service.verify(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ========== TESTS DE DELETE ==========
  describe('delete', () => {
    it('debe deshabilitar la organización con update directo', async () => {
      organizacionRepository.findOne.mockResolvedValue(mockOrganizacion);
      organizacionRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.delete(ORG_ID);

      expect(organizacionRepository.update).toHaveBeenCalledWith(ORG_ID, {
        habilitada: false,
      });
    });

    it('debe lanzar NotFoundException si la organización no existe', async () => {
      organizacionRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
      expect(organizacionRepository.update).not.toHaveBeenCalled();
    });
  });

  // ========== TESTS DE RESTORE ==========
  describe('restore', () => {
    it('debe rehabilitar la organización con update directo', async () => {
      const orgDeshabilitada = { ...mockOrganizacion, habilitada: false };
      organizacionRepository.findOne.mockResolvedValue(
        orgDeshabilitada as Organizacion,
      );
      organizacionRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.restore(ORG_ID);

      expect(organizacionRepository.update).toHaveBeenCalledWith(ORG_ID, {
        habilitada: true,
      });
    });

    it('debe lanzar NotFoundException si la organización no existe', async () => {
      organizacionRepository.findOne.mockResolvedValue(null);

      await expect(service.restore(999)).rejects.toThrow(NotFoundException);
      expect(organizacionRepository.update).not.toHaveBeenCalled();
    });
  });
});