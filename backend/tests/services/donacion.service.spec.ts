import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { DonacionService } from '../../src/Modules/donation/donacion.service';
import { Donaciones } from '../../src/Entities/donacion.entity';
import { Campaigns } from '../../src/Entities/campaigns.entity';
import { PerfilUsuario } from '../../src/Entities/perfil_Usuario.entity';
import { Donation_images } from '../../src/Entities/donation_images.entity';
import { CreateDonationDto } from '../../src/Modules/donation/dto/create_donation.dto';
import { UpdateDonacionEstadoDto } from '../../src/Modules/donation/dto/update_donation_estado.dto';
import { ResponseDonationDto } from '../../src/Modules/donation/dto/response_donation.dto';
import { DonacionEstado } from '../../src/Modules/donation/enum';
import { CampaignEstado } from '../../src/Modules/campaign/enum';
import { RankingService } from '../../src/Modules/ranking/ranking.service';

describe('DonacionService', () => {
  let service: DonacionService;
  let mockDonacionRepository: {
    findAndCount: jest.Mock<Promise<[Donaciones[], number]>, [object]>;
    create: jest.Mock<Donaciones, [object]>;
    save: jest.Mock<Promise<Donaciones>, [Donaciones]>;
    manager: { transaction: jest.Mock };
  };
  let mockCampaignsRepository: {
    findOne: jest.Mock<Promise<Campaigns | null>, [object]>;
  };
  let mockPerfilUsuarioRepository: {
    findOne: jest.Mock<Promise<PerfilUsuario | null>, [object]>;
    save: jest.Mock<Promise<PerfilUsuario>, [PerfilUsuario]>;
  };
  let mockDonationImagenRepository: {
    findOne: jest.Mock<Promise<Donation_images | null>, [object]>;
  };
  let mockRankingService: {
    ajustarPuntos: jest.Mock<Promise<void>, [number, number, object]>;
  };

  let usuario: PerfilUsuario;
  let campaign: Campaigns;
  let donacion: Donaciones;
  let createDonationDto: CreateDonationDto;
  let updateDonacionEstadoDto: UpdateDonacionEstadoDto;

  beforeEach(async () => {
    mockDonacionRepository = {
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      manager: { transaction: jest.fn() },
    };

    mockCampaignsRepository = {
      findOne: jest.fn(),
    };

    mockPerfilUsuarioRepository = {
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
          provide: getRepositoryToken(PerfilUsuario),
          useValue: mockPerfilUsuarioRepository,
        },
        {
          provide: getRepositoryToken(Donation_images),
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
      id: 1,
      nombre: 'Juan',
      apellido: 'Pérez',
      puntos: 500,
      cuenta: { deshabilitado: false, correo: 'juan@example.com' },
    } as unknown as PerfilUsuario;

    // ========== Campaña ==========
    campaign = {
      id: 1,
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
        cuenta: {
          calle: 'Av. Test',
          numero: '123',
        },
      },
      imagenes: [],
      donaciones: [],
    } as unknown as Campaigns;

    // ========== Donación ==========
    donacion = {
      id: 1,
      titulo: `Donación Solidaria de ${usuario.nombre} ${usuario.apellido}`,
      detalle: 'Detalle de la donación',
      tipo: 'Donación',
      cantidad: 100,
      puntos: 1000,
      estado: DonacionEstado.PENDIENTE,
      fecha_registro: new Date(),
      fecha_estado: new Date(),
      motivo_rechazo: '',
      usuario,
      campaña: campaign,
    } as unknown as Donaciones;

    // ========== DTOs ==========
    createDonationDto = {
      campaignId: 1,
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

  // ========== TESTS DE FIND ALL PAGINATED BY ORGANIZACION ==========
  describe('findAllPaginatedByOrganizacion', () => {
    it('debe retornar donaciones paginadas de una organización', async () => {
      mockDonacionRepository.findAndCount.mockResolvedValue([[donacion], 1]);

      const resultado = await service.findAllPaginatedByOrganizacion(1, 1, 10);

      expect(resultado.items).toHaveLength(1);
      expect(resultado.total).toBe(1);
      expect(mockDonacionRepository.findAndCount).toHaveBeenCalled();
    });

    it('debe retornar array vacío si no hay donaciones', async () => {
      mockDonacionRepository.findAndCount.mockResolvedValue([[], 0]);

      const resultado = await service.findAllPaginatedByOrganizacion(1, 1, 10);

      expect(resultado.items).toHaveLength(0);
      expect(resultado.total).toBe(0);
    });
  });

  // ========== TESTS DE FIND ALL PAGINATED BY USER ==========
  describe('findAllPaginatedByUser', () => {
    it('debe retornar donaciones paginadas de un usuario', async () => {
      mockDonacionRepository.findAndCount.mockResolvedValue([[donacion], 1]);

      const resultado = await service.findAllPaginatedByUser(1, 1, 10);

      expect(resultado.items).toHaveLength(1);
      expect(resultado.total).toBe(1);
      expect(mockDonacionRepository.findAndCount).toHaveBeenCalled();
    });

    it('debe retornar array vacío si no hay donaciones', async () => {
      mockDonacionRepository.findAndCount.mockResolvedValue([[], 0]);

      const resultado = await service.findAllPaginatedByUser(1, 1, 10);

      expect(resultado.items).toHaveLength(0);
      expect(resultado.total).toBe(0);
    });
  });

  // ========== TESTS DE CREATE ==========
  describe('create', () => {
    it('debe crear una donación correctamente', async () => {
      mockCampaignsRepository.findOne.mockResolvedValue(campaign);
      mockPerfilUsuarioRepository.findOne.mockResolvedValue(usuario);
      mockDonacionRepository.create.mockReturnValue(donacion);
      mockDonacionRepository.save.mockResolvedValue(donacion);
      mockPerfilUsuarioRepository.save.mockResolvedValue(usuario);

      const resultado: ResponseDonationDto = await service.create(
        1,
        createDonationDto,
      );

      expect(resultado.id).toBe(donacion.id);
      expect(mockDonacionRepository.save).toHaveBeenCalled();
      expect(mockPerfilUsuarioRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si la campaña no existe', async () => {
      mockCampaignsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(1, createDonationDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      mockCampaignsRepository.findOne.mockResolvedValue(campaign);
      mockPerfilUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.create(1, createDonationDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe limitar la cantidad al objetivo de la campaña', async () => {
      const campaignConObjetivoMenor = {
        ...campaign,
        objetivo: 50,
        puntos: 10,
      };
      mockCampaignsRepository.findOne.mockResolvedValue(
        campaignConObjetivoMenor,
      );
      mockPerfilUsuarioRepository.findOne.mockResolvedValue(usuario);
      const donacionLimitada = { ...donacion, cantidad: 50, puntos: 500 };
      mockDonacionRepository.create.mockReturnValue(donacionLimitada);
      mockDonacionRepository.save.mockResolvedValue(donacionLimitada);
      mockPerfilUsuarioRepository.save.mockResolvedValue(usuario);

      const resultado = await service.create(1, createDonationDto);

      expect(resultado.cantidad).toBeLessThanOrEqual(
        campaignConObjetivoMenor.objetivo,
      );
    });
  });

  // ========== TESTS DE CONFIRMAR DONACION ==========
  describe('confirmarDonacion', () => {
    it('debe cambiar estado de PENDIENTE a APROBADA', async () => {
      const mockManager = {
        findOne: jest.fn().mockResolvedValue(donacion),
        save: jest.fn().mockResolvedValue(donacion),
      };

      mockDonacionRepository.manager.transaction.mockImplementation(
        (callback) => callback(mockManager),
      );
      mockRankingService.ajustarPuntos.mockResolvedValue(undefined);

      const resultado = await service.confirmarDonacion(
        1,
        updateDonacionEstadoDto,
      );

      expect(resultado.id).toBe(donacion.id);
      expect(mockManager.save).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si la donación no existe', async () => {
      const mockManager = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      mockDonacionRepository.manager.transaction.mockImplementation(
        (callback) => callback(mockManager),
      );

      await expect(
        service.confirmarDonacion(999, updateDonacionEstadoDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si el estado es el mismo', async () => {
      const mockManager = {
        findOne: jest.fn().mockResolvedValue(donacion),
      };

      mockDonacionRepository.manager.transaction.mockImplementation(
        (callback) => callback(mockManager),
      );

      const mismoEstado = {
        estado: DonacionEstado.PENDIENTE,
      };

      await expect(service.confirmarDonacion(1, mismoEstado)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException si intenta cambiar desde APROBADA', async () => {
      const donacionAprobada = {
        ...donacion,
        estado: DonacionEstado.APROBADA,
      };

      const mockManager = {
        findOne: jest.fn().mockResolvedValue(donacionAprobada),
      };

      mockDonacionRepository.manager.transaction.mockImplementation(
        (callback) => callback(mockManager),
      );

      await expect(
        service.confirmarDonacion(1, updateDonacionEstadoDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe rechazar reversion después de 48 horas', async () => {
      const donacionRechazada = {
        ...donacion,
        estado: DonacionEstado.RECHAZADA,
        fecha_estado: new Date(Date.now() - 49 * 60 * 60 * 1000), // 49 horas atrás
      };

      const mockManager = {
        findOne: jest.fn().mockResolvedValue(donacionRechazada),
      };

      mockDonacionRepository.manager.transaction.mockImplementation(
        (callback) => callback(mockManager),
      );

      const revertir = {
        estado: DonacionEstado.APROBADA,
      };

      await expect(service.confirmarDonacion(1, revertir)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
