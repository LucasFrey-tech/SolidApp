import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { mock } from 'jest-mock-extended';
import { DonacionService } from '../../src/Modules/donation/donacion.service';
import { RankingService } from '../../src/Modules/ranking/ranking.service';
import { Donaciones } from '../../src/Entities/donacion.entity';
import { Campaigns } from '../../src/Entities/campaigns.entity';
import { Usuario } from '../../src/Entities/usuario.entity';
import { CreateDonationDto } from '../../src/Modules/donation/dto/create_donation.dto';
import { UpdateDonacionEstadoDto } from '../../src/Modules/donation/dto/update_donation_estado.dto';
import { DonacionEstado } from '../../src/Modules/donation/enum';
import { CampaignEstado } from '../../src/Modules/campaign/enum';

const mockContacto = { id: 1, correo: 'test@test.com' };

const mockDireccion = { id: 1, calle: 'Av. Test', numero: '123' };

const mockOrganizacion = {
  id: 1,
  nombre_organizacion: 'Org Test',
  direccion: mockDireccion,
};

const mockCampaign = Object.assign(new Campaigns(), {
  id: 1,
  titulo: 'Campaña Test',
  objetivo: 100,
  puntos: 10,
  estado: CampaignEstado.ACTIVA,
  organizacion: mockOrganizacion,
});

const mockUsuario = Object.assign(new Usuario(), {
  id: 1,
  nombre: 'Juan',
  apellido: 'Pérez',
  puntos: 0,
  habilitado: true,
  contacto: mockContacto,
});

const mockDonacionPendiente = Object.assign(new Donaciones(), {
  id: 1,
  titulo: 'Donación Test',
  detalle: 'Detalle de donación',
  cantidad: 5,
  estado: DonacionEstado.PENDIENTE,
  puntos: 50,
  fecha_registro: new Date(),
  usuario: mockUsuario,
  campaña: mockCampaign,
});

const mockDonacionAprobada = Object.assign(new Donaciones(), {
  ...mockDonacionPendiente,
  estado: DonacionEstado.APROBADA,
  fecha_aprobacion: new Date(),
  aprobado_por: Object.assign(new Usuario(), {
    id: 2,
    nombre: 'Admin',
    apellido: 'Test',
  }),
});

const mockDonacionRechazada = Object.assign(new Donaciones(), {
  ...mockDonacionPendiente,
  estado: DonacionEstado.RECHAZADA,
  fecha_rechazo: new Date(),
  rechazado_por: Object.assign(new Usuario(), {
    id: 2,
    nombre: 'Admin',
    apellido: 'Test',
  }),
  motivo_rechazo: 'Motivo de rechazo',
});

describe('DonacionService', () => {
  let service: DonacionService;
  let donacionRepository: jest.Mocked<Repository<Donaciones>>;
  let campaignsRepository: jest.Mocked<Repository<Campaigns>>;
  let usuarioRepository: jest.Mocked<Repository<Usuario>>;
  let rankingService: jest.Mocked<RankingService>;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const mockDonacionRepo = mock<Repository<Donaciones>>();
    const mockCampaignsRepo = mock<Repository<Campaigns>>();
    const mockUsuarioRepo = mock<Repository<Usuario>>();
    const mockRankingService = mock<RankingService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonacionService,
        { provide: getRepositoryToken(Donaciones), useValue: mockDonacionRepo },
        { provide: getRepositoryToken(Campaigns), useValue: mockCampaignsRepo },
        { provide: getRepositoryToken(Usuario), useValue: mockUsuarioRepo },
        { provide: RankingService, useValue: mockRankingService },
      ],
    }).compile();

    service = module.get<DonacionService>(DonacionService);
    donacionRepository = module.get(getRepositoryToken(Donaciones));
    campaignsRepository = module.get(getRepositoryToken(Campaigns));
    usuarioRepository = module.get(getRepositoryToken(Usuario));
    rankingService = module.get(RankingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllPaginatedByOrganizacion', () => {
    const organizacionId = 1;

    beforeEach(() => {
      donacionRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);
    });

    it('debe obtener donaciones paginadas por organización sin search', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([
        [mockDonacionPendiente],
        1,
      ]);

      const result = await service.findAllPaginatedByOrganizacion(
        organizacionId,
        1,
        10,
      );

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(donacionRepository.createQueryBuilder).toHaveBeenCalledWith(
        'donacion',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'organizacion.id = :organizacionId',
        { organizacionId },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'donacion.estado',
        'ASC',
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });

    it('debe obtener donaciones paginadas con search por email', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAllPaginatedByOrganizacion(
        organizacionId,
        1,
        10,
        'test@test.com',
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('debe manejar error cuando falla la consulta', async () => {
      const error = new Error('Error de base de datos');
      mockQueryBuilder.getManyAndCount.mockRejectedValue(error);

      await expect(
        service.findAllPaginatedByOrganizacion(organizacionId, 1, 10),
      ).rejects.toThrow('Error de base de datos');
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      mockQueryBuilder.getManyAndCount.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(
        service.findAllPaginatedByOrganizacion(organizacionId, 1, 10),
      ).rejects.toThrow('Error desconocido');
    });
  });

  describe('findAllPaginatedByUser', () => {
    const userId = 1;

    it('debe obtener donaciones paginadas por usuario', async () => {
      donacionRepository.findAndCount.mockResolvedValue([
        [mockDonacionPendiente],
        1,
      ]);

      const result = await service.findAllPaginatedByUser(userId, 1, 10);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(donacionRepository.findAndCount).toHaveBeenCalled();
    });

    it('debe manejar error cuando falla la consulta', async () => {
      const error = new Error('Error de base de datos');
      donacionRepository.findAndCount.mockRejectedValue(error);

      await expect(
        service.findAllPaginatedByUser(userId, 1, 10),
      ).rejects.toThrow('Error de base de datos');
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      donacionRepository.findAndCount.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(
        service.findAllPaginatedByUser(userId, 1, 10),
      ).rejects.toThrow('Error desconocido');
    });
  });

  describe('create', () => {
    const usuarioId = 1;
    const createDto: CreateDonationDto = {
      detalle: 'Detalle de donación',
      cantidad: 5,
      campaignId: 1,
      puntos: 50,
    };

    beforeEach(() => {
      campaignsRepository.findOne.mockResolvedValue(mockCampaign);
      usuarioRepository.findOne.mockResolvedValue(mockUsuario);
      donacionRepository.create.mockReturnValue(mockDonacionPendiente);
      donacionRepository.save.mockResolvedValue(mockDonacionPendiente);
    });

    it('debe crear una donación exitosamente', async () => {
      const result = await service.create(usuarioId, createDto);

      expect(result.id).toBe(1);
      expect(campaignsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(usuarioRepository.findOne).toHaveBeenCalledWith({
        where: { id: usuarioId, habilitado: true },
      });
    });

    it('debe lanzar error cuando la campaña no existe', async () => {
      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(usuarioId, createDto)).rejects.toThrow(
        'Campaña no encontrada',
      );
    });

    it('debe lanzar error cuando la cantidad supera el objetivo', async () => {
      const dtoExcedido = { ...createDto, cantidad: 200 };

      await expect(service.create(usuarioId, dtoExcedido)).rejects.toThrow(
        'superar el objetivo',
      );
    });

    it('debe lanzar error cuando el usuario no existe', async () => {
      usuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.create(usuarioId, createDto)).rejects.toThrow(
        'Usuario no encontrado',
      );
    });

    it('debe manejar error cuando el error no es instancia de Error en create', async () => {
      campaignsRepository.findOne.mockRejectedValue('Error string inesperado');

      await expect(service.create(usuarioId, createDto)).rejects.toThrow(
        'Error desconocido',
      );
    });
  });

  describe('confirmarDonacion', () => {
    const donacionId = 1;
    const gestorId = 2;

    const setupTransaction = async (donacionMock: Donaciones) => {
      const mockEntityManager = {
        findOne: jest.fn().mockResolvedValue(donacionMock),
        save: jest.fn().mockResolvedValue(donacionMock),
        findOneOrFail: jest.fn(),
      };
      const transactionSpy = jest
        .fn()
        .mockImplementation(async (cb) => cb(mockEntityManager));
      Object.defineProperty(donacionRepository, 'manager', {
        get: () => ({ transaction: transactionSpy }),
      });
      return { mockEntityManager, transactionSpy };
    };

    describe('Aprobación de donaciones', () => {
      it('debe aprobar una donación pendiente exitosamente', async () => {
        const { mockEntityManager } = await setupTransaction(
          mockDonacionPendiente,
        );

        usuarioRepository.save = jest.fn().mockResolvedValue(mockUsuario);
        rankingService.ajustarPuntos = jest.fn().mockResolvedValue(undefined);
        campaignsRepository.findOne = jest.fn().mockResolvedValue(mockCampaign);
        campaignsRepository.save = jest.fn().mockResolvedValue(mockCampaign);

        const dto: UpdateDonacionEstadoDto = {
          estado: DonacionEstado.APROBADA,
        };
        const result = await service.confirmarDonacion(
          donacionId,
          dto,
          gestorId,
        );

        expect(result.estado).toBe(DonacionEstado.APROBADA);
        expect(mockEntityManager.save).toHaveBeenCalled();
      });
    });

    describe('Rechazo de donaciones', () => {
      it('debe rechazar una donación pendiente exitosamente', async () => {
        const donacionPendiente = Object.assign(new Donaciones(), {
          ...mockDonacionPendiente,
          estado: DonacionEstado.PENDIENTE,
        });
        const { mockEntityManager } = await setupTransaction(donacionPendiente);

        const dto: UpdateDonacionEstadoDto = {
          estado: DonacionEstado.RECHAZADA,
          motivo: 'Motivo de rechazo',
        };
        const result = await service.confirmarDonacion(
          donacionId,
          dto,
          gestorId,
        );

        expect(result.estado).toBe(DonacionEstado.RECHAZADA);
        expect(mockEntityManager.save).toHaveBeenCalledWith(
          expect.objectContaining({
            rechazado_por: expect.objectContaining({ id: gestorId }),
            fecha_rechazo: expect.any(Date),
            motivo_rechazo: 'Motivo de rechazo',
          }),
        );
      });
    });

    describe('Reversión de rechazo', () => {
      it('debe permitir revertir un rechazo dentro de la ventana de 48 horas', async () => {
        const fechaRechazo = new Date();
        fechaRechazo.setHours(fechaRechazo.getHours() - 24);
        const donacionRechazadaReciente = Object.assign(new Donaciones(), {
          ...mockDonacionRechazada,
          fecha_rechazo: fechaRechazo,
        });
        const { mockEntityManager } = await setupTransaction(
          donacionRechazadaReciente,
        );

        usuarioRepository.save = jest.fn().mockResolvedValue(mockUsuario);
        rankingService.ajustarPuntos = jest.fn().mockResolvedValue(undefined);
        campaignsRepository.findOne = jest.fn().mockResolvedValue(mockCampaign);
        campaignsRepository.save = jest.fn().mockResolvedValue(mockCampaign);

        const dto: UpdateDonacionEstadoDto = {
          estado: DonacionEstado.APROBADA,
        };
        const result = await service.confirmarDonacion(
          donacionId,
          dto,
          gestorId,
        );

        expect(result.estado).toBe(DonacionEstado.APROBADA);
      });

      it('debe lanzar error al revertir un rechazo fuera de la ventana de 48 horas', async () => {
        const fechaRechazo = new Date();
        fechaRechazo.setHours(fechaRechazo.getHours() - 72);
        const donacionRechazadaVieja = Object.assign(new Donaciones(), {
          ...mockDonacionRechazada,
          fecha_rechazo: fechaRechazo,
        });
        await setupTransaction(donacionRechazadaVieja);

        const dto: UpdateDonacionEstadoDto = {
          estado: DonacionEstado.APROBADA,
        };

        await expect(
          service.confirmarDonacion(donacionId, dto, gestorId),
        ).rejects.toThrow('El plazo para revertir la donación ha expirado');
      });
    });

    describe('Validaciones de transición', () => {
      it('debe lanzar error cuando la donación ya tiene el mismo estado', async () => {
        await setupTransaction(mockDonacionAprobada);

        const dto: UpdateDonacionEstadoDto = {
          estado: DonacionEstado.APROBADA,
        };

        await expect(
          service.confirmarDonacion(donacionId, dto, gestorId),
        ).rejects.toThrow('La donación ya tiene ese estado');
      });

      it('debe lanzar error cuando la transición no es válida', async () => {
        await setupTransaction(mockDonacionAprobada);

        const dto: UpdateDonacionEstadoDto = {
          estado: DonacionEstado.PENDIENTE,
        };

        await expect(
          service.confirmarDonacion(donacionId, dto, gestorId),
        ).rejects.toThrow('Transición de estado no válida');
      });
    });

    it('debe lanzar error cuando la donación rechazada no tiene fecha de rechazo al intentar revertir', async () => {
      const donacionRechazadaSinFecha = Object.assign(new Donaciones(), {
        ...mockDonacionRechazada,
        fecha_rechazo: undefined,
      });

      const mockEntityManager = {
        findOne: jest.fn().mockResolvedValue(donacionRechazadaSinFecha),
        save: jest.fn().mockResolvedValue(donacionRechazadaSinFecha),
      };
      const transactionSpy = jest
        .fn()
        .mockImplementation(async (cb) => cb(mockEntityManager));
      Object.defineProperty(donacionRepository, 'manager', {
        get: () => ({ transaction: transactionSpy }),
      });

      const dto: UpdateDonacionEstadoDto = {
        estado: DonacionEstado.APROBADA,
      };

      await expect(
        service.confirmarDonacion(donacionId, dto, gestorId),
      ).rejects.toThrow('La donación no tiene fecha de rechazo');
    });

    it('debe finalizar la campaña cuando el objetivo llega a 0', async () => {
      const donacionConCantidadGrande = Object.assign(new Donaciones(), {
        ...mockDonacionPendiente,
        estado: DonacionEstado.PENDIENTE,
        cantidad: 100,
      });

      const campaignConObjetivoPequeno = Object.assign(new Campaigns(), {
        ...mockCampaign,
        objetivo: 100,
      });

      const mockEntityManager = {
        findOne: jest.fn().mockResolvedValue(donacionConCantidadGrande),
        save: jest.fn().mockResolvedValue({
          ...campaignConObjetivoPequeno,
          objetivo: 0,
          estado: CampaignEstado.FINALIZADA,
        }),
      };
      const transactionSpy = jest
        .fn()
        .mockImplementation(async (cb) => cb(mockEntityManager));
      Object.defineProperty(donacionRepository, 'manager', {
        get: () => ({ transaction: transactionSpy }),
      });

      campaignsRepository.findOne = jest
        .fn()
        .mockResolvedValue(campaignConObjetivoPequeno);
      rankingService.ajustarPuntos = jest.fn().mockResolvedValue(undefined);
      usuarioRepository.save = jest.fn().mockResolvedValue(mockUsuario);

      const dto: UpdateDonacionEstadoDto = {
        estado: DonacionEstado.APROBADA,
      };

      const result = await service.confirmarDonacion(donacionId, dto, gestorId);

      expect(result.estado).toBe(DonacionEstado.APROBADA);
    });

    describe('Manejo de errores', () => {
      it('debe lanzar error cuando la donación no existe', async () => {
        const mockEntityManager = {
          findOne: jest.fn().mockResolvedValue(null),
        };
        const transactionSpy = jest
          .fn()
          .mockImplementation(async (cb) => cb(mockEntityManager));
        Object.defineProperty(donacionRepository, 'manager', {
          get: () => ({ transaction: transactionSpy }),
        });

        const dto: UpdateDonacionEstadoDto = {
          estado: DonacionEstado.APROBADA,
        };

        await expect(
          service.confirmarDonacion(donacionId, dto, gestorId),
        ).rejects.toThrow('Donación no encontrada');
      });
    });
  });
});
