import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DonacionService } from '../../src/Modules/donation/donacion.service';
import { Donaciones } from '../../src/Entities/donacion.entity';
import { Campaigns } from '../../src/Entities/campaigns.entity';
import { Usuario } from '../../src/Entities/usuario.entity';
import { ImagenesDonaciones } from '../../src/Entities/imagenes_donaciones';
import { CreateDonationDto } from '../../src/Modules/donation/dto/create_donation.dto';
import { UpdateDonacionEstadoDto } from '../../src/Modules/donation/dto/update_donation_estado.dto';
import { DonacionEstado } from '../../src/Modules/donation/enum';
import { CampaignEstado } from '../../src/Modules/campaign/enum';
import { RankingService } from '../../src/Modules/ranking/ranking.service';

describe('DonacionService', () => {
  let service: DonacionService;

  // ========== Mocks de repositorios ==========
  let mockDonacionRepository: {
    findAndCount: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    createQueryBuilder: jest.Mock;
    manager: { transaction: jest.Mock };
  };
  let mockCampaignsRepository: {
    findOne: jest.Mock;
  };
  let mockUsuarioRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let mockDonationImagenRepository: {
    findOne: jest.Mock;
  };
  let mockRankingService: {
    ajustarPuntos: jest.Mock;
  };

  // IDs reutilizables
  const USUARIO_ID = 1;
  const CAMPAIGN_ID = 1;
  const DONACION_ID = 1;
  const GESTOR_ID = 99;

  let usuario: Usuario;
  let campaign: Campaigns;
  let donacion: Donaciones;
  let createDonationDto: CreateDonationDto;
  let updateDonacionEstadoDto: UpdateDonacionEstadoDto;

  beforeEach(async () => {
    mockDonacionRepository = {
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
      manager: { transaction: jest.fn() },
    };

    mockCampaignsRepository = {
      findOne: jest.fn(),
    };

    mockUsuarioRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    mockDonationImagenRepository = {
      findOne: jest.fn(),
    };

    mockRankingService = {
      ajustarPuntos: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonacionService,
        {
          provide: getRepositoryToken(Donaciones),
          useValue: mockDonacionRepository,
        },
        {
          provide: getRepositoryToken(Campaigns),
          useValue: mockCampaignsRepository,
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepository,
        },
        {
          provide: getRepositoryToken(ImagenesDonaciones),
          useValue: mockDonationImagenRepository,
        },
        {
          provide: RankingService,
          useValue: mockRankingService,
        },
      ],
    }).compile();

    service = module.get<DonacionService>(DonacionService);

    // ========== Usuario ==========
    usuario = {
      id: USUARIO_ID,
      nombre: 'Juan',
      apellido: 'Pérez',
      puntos: 500,
      habilitado: true,
      contacto: { correo: 'juan@example.com' },
    } as unknown as Usuario;

    // ========== Campaña ==========
    campaign = {
      id: CAMPAIGN_ID,
      titulo: 'Campaña de Ayuda',
      descripcion: 'Campaña para ayudar',
      objetivo: 1000,
      puntos: 10,
      estado: CampaignEstado.ACTIVA,
      fecha_Inicio: new Date('2025-01-01'),
      fecha_Fin: new Date('2025-12-31'),
      fecha_Registro: new Date(),
      ultimo_cambio: new Date(),
      organizacion: {
        id: 1,
        nombre_organizacion: 'Org Test',
        habilitada: true,
        direccion: {
          calle: 'Av. Test',
          numero: '123',
        },
      },
      imagenes: [],
      donaciones: [],
    } as unknown as Campaigns;

    // ========== Donación ==========
    donacion = {
      id: DONACION_ID,
      titulo: `Donación Solidaria de ${usuario.nombre} ${usuario.apellido}`,
      detalle: 'Detalle de la donación',
      tipo: 'Articulo',
      cantidad: 100,
      puntos: 1000,
      estado: DonacionEstado.PENDIENTE,
      fecha_registro: new Date(),
      motivo_rechazo: null,
      usuario,
      campaña: campaign,
    } as unknown as Donaciones;

    // ========== DTOs ==========
    createDonationDto = {
      campaignId: CAMPAIGN_ID,
      cantidad: 100,
      detalle: 'Detalle de la donación',
      puntos: 1000,
    };

    updateDonacionEstadoDto = {
      estado: DonacionEstado.APROBADA,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== Helper: buildQueryBuilder para findAllPaginatedByOrganizacion ==========
  const buildOrgQueryBuilder = (items: Donaciones[], total: number) => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([items, total]),
  });

  // ========== TESTS DE FIND ALL PAGINATED BY ORGANIZACION ==========
  describe('findAllPaginatedByOrganizacion', () => {
    it('debe retornar donaciones paginadas de una organización', async () => {
      const qb = buildOrgQueryBuilder([donacion], 1);
      mockDonacionRepository.createQueryBuilder.mockReturnValue(qb);

      const resultado = await service.findAllPaginatedByOrganizacion(1, 1, 10);

      expect(resultado.items).toHaveLength(1);
      expect(resultado.total).toBe(1);
      expect(qb.where).toHaveBeenCalledWith(
        'organizacion.id = :organizacionId',
        { organizacionId: 1 },
      );
    });

    it('debe retornar array vacío si no hay donaciones', async () => {
      const qb = buildOrgQueryBuilder([], 0);
      mockDonacionRepository.createQueryBuilder.mockReturnValue(qb);

      const resultado = await service.findAllPaginatedByOrganizacion(1, 1, 10);

      expect(resultado.items).toHaveLength(0);
      expect(resultado.total).toBe(0);
    });

    it('debe aplicar filtro de búsqueda por correo cuando se proporciona', async () => {
      const qb = buildOrgQueryBuilder([donacion], 1);
      mockDonacionRepository.createQueryBuilder.mockReturnValue(qb);

      await service.findAllPaginatedByOrganizacion(1, 1, 10, 'juan@example.com');

      expect(qb.andWhere).toHaveBeenCalledWith(
        'LOWER(contacto.correo) LIKE LOWER(:search)',
        { search: '%juan@example.com%' },
      );
    });

    it('NO debe aplicar filtro de búsqueda si search no se proporciona', async () => {
      const qb = buildOrgQueryBuilder([donacion], 1);
      mockDonacionRepository.createQueryBuilder.mockReturnValue(qb);

      await service.findAllPaginatedByOrganizacion(1, 1, 10);

      expect(qb.andWhere).not.toHaveBeenCalled();
    });
  });

  // ========== TESTS DE FIND ALL PAGINATED BY USER ==========
  describe('findAllPaginatedByUser', () => {
    it('debe retornar donaciones paginadas de un usuario', async () => {
      mockDonacionRepository.findAndCount.mockResolvedValue([[donacion], 1]);

      const resultado = await service.findAllPaginatedByUser(USUARIO_ID, 1, 10);

      expect(resultado.items).toHaveLength(1);
      expect(resultado.total).toBe(1);
      expect(mockDonacionRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { usuario: { id: USUARIO_ID } },
        }),
      );
    });

    it('debe retornar array vacío si no hay donaciones', async () => {
      mockDonacionRepository.findAndCount.mockResolvedValue([[], 0]);

      const resultado = await service.findAllPaginatedByUser(USUARIO_ID, 1, 10);

      expect(resultado.items).toHaveLength(0);
      expect(resultado.total).toBe(0);
    });

    it('debe respetar la paginación', async () => {
      mockDonacionRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAllPaginatedByUser(USUARIO_ID, 3, 5);

      expect(mockDonacionRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });
  });

  // ========== TESTS DE CREATE ==========
  describe('create', () => {
    it('debe crear una donación correctamente', async () => {
      mockCampaignsRepository.findOne.mockResolvedValue(campaign);
      mockUsuarioRepository.findOne.mockResolvedValue(usuario);
      mockDonacionRepository.create.mockReturnValue(donacion);
      mockDonacionRepository.save.mockResolvedValue(donacion);
      mockUsuarioRepository.save.mockResolvedValue(usuario);

      const resultado = await service.create(USUARIO_ID, createDonationDto);

      expect(resultado.id).toBe(donacion.id);
      expect(mockDonacionRepository.save).toHaveBeenCalled();
      expect(mockUsuarioRepository.save).toHaveBeenCalled();
    });

    it('debe asignar el título con nombre y apellido del usuario', async () => {
      mockCampaignsRepository.findOne.mockResolvedValue(campaign);
      mockUsuarioRepository.findOne.mockResolvedValue(usuario);
      mockDonacionRepository.create.mockReturnValue(donacion);
      mockDonacionRepository.save.mockResolvedValue(donacion);
      mockUsuarioRepository.save.mockResolvedValue(usuario);

      await service.create(USUARIO_ID, createDonationDto);

      expect(mockDonacionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: `Donación Solidaria de ${usuario.nombre} ${usuario.apellido}`,
        }),
      );
    });

    it('debe calcular los puntos como cantidad * puntos de la campaña', async () => {
      mockCampaignsRepository.findOne.mockResolvedValue(campaign);
      mockUsuarioRepository.findOne.mockResolvedValue(usuario);
      mockDonacionRepository.create.mockReturnValue(donacion);
      mockDonacionRepository.save.mockResolvedValue(donacion);
      mockUsuarioRepository.save.mockResolvedValue(usuario);

      await service.create(USUARIO_ID, createDonationDto);

      const cantidadFinal = Math.min(createDonationDto.cantidad, campaign.objetivo);
      const puntosEsperados = cantidadFinal * campaign.puntos;

      expect(mockDonacionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ puntos: puntosEsperados }),
      );
    });

    it('debe limitar la cantidad al objetivo de la campaña', async () => {
      const campaignConObjetivoMenor = { ...campaign, objetivo: 50 };
      mockCampaignsRepository.findOne.mockResolvedValue(campaignConObjetivoMenor);
      mockUsuarioRepository.findOne.mockResolvedValue(usuario);

      const donacionLimitada = { ...donacion, cantidad: 50 };
      mockDonacionRepository.create.mockReturnValue(donacionLimitada);
      mockDonacionRepository.save.mockResolvedValue(donacionLimitada);
      mockUsuarioRepository.save.mockResolvedValue(usuario);

      const resultado = await service.create(USUARIO_ID, createDonationDto);

      expect(resultado.cantidad).toBeLessThanOrEqual(campaignConObjetivoMenor.objetivo);
      expect(mockDonacionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ cantidad: 50 }),
      );
    });

    it('debe asignar creado_por con el usuarioId', async () => {
      mockCampaignsRepository.findOne.mockResolvedValue(campaign);
      mockUsuarioRepository.findOne.mockResolvedValue(usuario);
      mockDonacionRepository.create.mockReturnValue(donacion);
      mockDonacionRepository.save.mockResolvedValue(donacion);
      mockUsuarioRepository.save.mockResolvedValue(usuario);

      await service.create(USUARIO_ID, createDonationDto);

      expect(mockDonacionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          creado_por: { id: USUARIO_ID },
          estado: DonacionEstado.PENDIENTE,
        }),
      );
    });

    it('debe lanzar NotFoundException si la campaña no existe', async () => {
      mockCampaignsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(USUARIO_ID, createDonationDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsuarioRepository.findOne).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si el usuario no existe o está deshabilitado', async () => {
      mockCampaignsRepository.findOne.mockResolvedValue(campaign);
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.create(USUARIO_ID, createDonationDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockDonacionRepository.save).not.toHaveBeenCalled();
    });
  });

  // ========== TESTS DE CONFIRMAR DONACION ==========
  describe('confirmarDonacion', () => {
    const buildMockManager = (donacionMock: Donaciones | null, campaignMock?: Campaigns) => ({
      findOne: jest.fn().mockImplementation((entity) => {
        if (entity === Donaciones) return Promise.resolve(donacionMock);
        if (entity === Campaigns) return Promise.resolve(campaignMock ?? campaign);
        return Promise.resolve(null);
      }),
      save: jest.fn().mockImplementation((entity) => Promise.resolve(entity)),
    });

    it('debe cambiar estado de PENDIENTE a APROBADA y sumar puntos al usuario', async () => {
      const manager = buildMockManager(donacion);
      mockDonacionRepository.manager.transaction.mockImplementation((cb) => cb(manager));
      mockRankingService.ajustarPuntos.mockResolvedValue(undefined);

      const resultado = await service.confirmarDonacion(
        DONACION_ID,
        updateDonacionEstadoDto,
        GESTOR_ID,
      );

      expect(resultado.id).toBe(donacion.id);
      expect(manager.save).toHaveBeenCalled();
      expect(mockRankingService.ajustarPuntos).toHaveBeenCalledWith(
        usuario.id,
        donacion.puntos,
        manager,
      );
    });

    it('debe asignar aprobado_por y fecha_aprobacion al aprobar', async () => {
      const manager = buildMockManager(donacion);
      mockDonacionRepository.manager.transaction.mockImplementation((cb) => cb(manager));
      mockRankingService.ajustarPuntos.mockResolvedValue(undefined);

      await service.confirmarDonacion(DONACION_ID, updateDonacionEstadoDto, GESTOR_ID);

      expect(donacion.aprobado_por).toEqual({ id: GESTOR_ID });
      expect(donacion.fecha_aprobacion).toBeInstanceOf(Date);
    });

    it('debe asignar rechazado_por, fecha_rechazo y motivo_rechazo al rechazar', async () => {
      const manager = buildMockManager(donacion);
      mockDonacionRepository.manager.transaction.mockImplementation((cb) => cb(manager));

      const rechazarDto: UpdateDonacionEstadoDto = {
        estado: DonacionEstado.RECHAZADA,
        motivo: 'Artículos dañados',
      };

      await service.confirmarDonacion(DONACION_ID, rechazarDto, GESTOR_ID);

      expect(donacion.rechazado_por).toEqual({ id: GESTOR_ID });
      expect(donacion.fecha_rechazo).toBeInstanceOf(Date);
      expect(donacion.motivo_rechazo).toBe('Artículos dañados');
    });

    it('debe finalizar la campaña si objetivo llega a 0 al aprobar', async () => {
      const campaignConObjetivoExacto = {
        ...campaign,
        objetivo: donacion.cantidad,
      };
      const manager = buildMockManager(donacion, campaignConObjetivoExacto);
      mockDonacionRepository.manager.transaction.mockImplementation((cb) => cb(manager));
      mockRankingService.ajustarPuntos.mockResolvedValue(undefined);

      await service.confirmarDonacion(DONACION_ID, updateDonacionEstadoDto, GESTOR_ID);

      const savedCampaign = (manager.save as jest.Mock).mock.calls.find(
        (call) => call[0]?.estado === CampaignEstado.FINALIZADA,
      );
      expect(savedCampaign).toBeDefined();
    });

    it('debe lanzar NotFoundException si la donación no existe', async () => {
      const manager = buildMockManager(null);
      mockDonacionRepository.manager.transaction.mockImplementation((cb) => cb(manager));

      await expect(
        service.confirmarDonacion(999, updateDonacionEstadoDto, GESTOR_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si el nuevo estado es igual al actual', async () => {
      const manager = buildMockManager(donacion);
      mockDonacionRepository.manager.transaction.mockImplementation((cb) => cb(manager));

      const mismoEstado: UpdateDonacionEstadoDto = {
        estado: DonacionEstado.PENDIENTE,
      };

      await expect(
        service.confirmarDonacion(DONACION_ID, mismoEstado, GESTOR_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si intenta cambiar desde APROBADA', async () => {
      const donacionAprobada = {
        ...donacion,
        estado: DonacionEstado.APROBADA,
      } as unknown as Donaciones;

      const manager = buildMockManager(donacionAprobada);
      mockDonacionRepository.manager.transaction.mockImplementation((cb) => cb(manager));

      await expect(
        service.confirmarDonacion(DONACION_ID, updateDonacionEstadoDto, GESTOR_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException al revertir rechazo después de 48 horas', async () => {
      const donacionRechazada = {
        ...donacion,
        estado: DonacionEstado.RECHAZADA,
        fecha_rechazo: new Date(Date.now() - 49 * 60 * 60 * 1000),
      } as unknown as Donaciones;

      const manager = buildMockManager(donacionRechazada);
      mockDonacionRepository.manager.transaction.mockImplementation((cb) => cb(manager));

      const revertirDto: UpdateDonacionEstadoDto = {
        estado: DonacionEstado.APROBADA,
      };

      await expect(
        service.confirmarDonacion(DONACION_ID, revertirDto, GESTOR_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si donación RECHAZADA no tiene fecha_rechazo al intentar revertir', async () => {
      const donacionRechazadaSinFecha = {
        ...donacion,
        estado: DonacionEstado.RECHAZADA,
        fecha_rechazo: undefined,
      } as unknown as Donaciones;

      const manager = buildMockManager(donacionRechazadaSinFecha);
      mockDonacionRepository.manager.transaction.mockImplementation((cb) => cb(manager));

      const revertirDto: UpdateDonacionEstadoDto = {
        estado: DonacionEstado.APROBADA,
      };

      await expect(
        service.confirmarDonacion(DONACION_ID, revertirDto, GESTOR_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si transición desde RECHAZADA es a algo distinto de APROBADA', async () => {
      const donacionRechazada = {
        ...donacion,
        estado: DonacionEstado.RECHAZADA,
      } as unknown as Donaciones;

      const manager = buildMockManager(donacionRechazada);
      mockDonacionRepository.manager.transaction.mockImplementation((cb) => cb(manager));

      const dtoInvalido: UpdateDonacionEstadoDto = {
        estado: DonacionEstado.PENDIENTE,
      };

      await expect(
        service.confirmarDonacion(DONACION_ID, dtoInvalido, GESTOR_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });
});