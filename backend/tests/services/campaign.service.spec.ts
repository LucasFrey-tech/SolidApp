import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { mock } from 'jest-mock-extended';
import { CampaignsService } from '../../src/Modules/campaign/campaign.service';
import { Campaigns } from '../../src/Entities/campaigns.entity';
import { Organizacion } from '../../src/Entities/organizacion.entity';
import { imagenes_campania } from '../../src/Entities/imagenes_campania.entity';
import { CreateCampaignsDto } from '../../src/Modules/campaign/dto/create_campaigns.dto';
import { UpdateCampaignsDto } from '../../src/Modules/campaign/dto/update_campaigns.dto';
import { CampaignEstado } from '../../src/Modules/campaign/enum';
import { Usuario } from '../../src/Entities/usuario.entity';

const mockOrganizacion = Object.assign(new Organizacion(), {
  id: 1,
  nombre_organizacion: 'Fundación Test',
  verificada: true,
  habilitada: true,
});

const mockUsuario = Object.assign(new Usuario(), {
  id: 1,
  nombre: 'Juan',
  apellido: 'Pérez',
});

const mockImagenCampania = Object.assign(new imagenes_campania(), {
  id: 1,
  imagen: '/uploads/imagen1.jpg',
  esPortada: true,
  campaign: {} as Campaigns,
});

const mockCampaign = Object.assign(new Campaigns(), {
  id: 1,
  titulo: 'Campaña Test',
  descripcion: 'Descripción de la campaña',
  estado: CampaignEstado.PENDIENTE,
  fecha_Inicio: new Date('2025-06-01'),
  fecha_Fin: new Date('2025-08-31'),
  fecha_Registro: new Date('2025-05-15'),
  objetivo: 100000,
  puntos: 50,
  organizacion: mockOrganizacion,
  imagenes: [mockImagenCampania],
  creado_por: mockUsuario,
  actualizado_por: mockUsuario,
  ultimo_cambio: new Date(),
});

describe('CampaignsService', () => {
  let service: CampaignsService;
  let campaignsRepository: jest.Mocked<Repository<Campaigns>>;
  let organizacionRepository: jest.Mocked<Repository<Organizacion>>;
  let campaignsImagesRepository: jest.Mocked<Repository<imagenes_campania>>;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const mockCampaignsRepo = mock<Repository<Campaigns>>();
    const mockOrganizacionRepo = mock<Repository<Organizacion>>();
    const mockCampaignsImagesRepo = mock<Repository<imagenes_campania>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        { provide: getRepositoryToken(Campaigns), useValue: mockCampaignsRepo },
        {
          provide: getRepositoryToken(Organizacion),
          useValue: mockOrganizacionRepo,
        },
        {
          provide: getRepositoryToken(imagenes_campania),
          useValue: mockCampaignsImagesRepo,
        },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
    campaignsRepository = module.get(getRepositoryToken(Campaigns));
    organizacionRepository = module.get(getRepositoryToken(Organizacion));
    campaignsImagesRepository = module.get(
      getRepositoryToken(imagenes_campania),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findPaginated', () => {
    beforeEach(() => {
      campaignsRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);
    });

    it('debe obtener campañas paginadas con onlyEnabled = true', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockCampaign], 1]);

      const result = await service.findPaginated(1, 10, '', true);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'campaign.estado = :estado',
        { estado: CampaignEstado.ACTIVA },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'campaign.objetivo > 0',
      );
    });

    it('debe obtener campañas paginadas con onlyEnabled = false', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockCampaign], 1]);

      const result = await service.findPaginated(1, 10, '', false);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('debe filtrar por search cuando se proporciona', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findPaginated(1, 10, 'test', false);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(campaign.titulo LIKE :search OR campaign.descripcion LIKE :search)',
        { search: '%test%' },
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      mockQueryBuilder.getManyAndCount.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(service.findPaginated(1, 10, '', false)).rejects.toThrow(
        'Error desconocido',
      );
    });
  });

  describe('findCampaignsPaginated', () => {
    const organizacionId = 1;

    it('debe obtener campañas paginadas por organización', async () => {
      campaignsRepository.findAndCount.mockResolvedValue([[mockCampaign], 1]);

      const result = await service.findCampaignsPaginated(
        organizacionId,
        1,
        10,
      );

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(campaignsRepository.findAndCount).toHaveBeenCalledWith({
        where: { organizacion: { id: organizacionId } },
        relations: ['organizacion', 'imagenes'],
        skip: 0,
        take: 10,
      });
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      campaignsRepository.findAndCount.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(
        service.findCampaignsPaginated(organizacionId, 1, 10),
      ).rejects.toThrow('Error desconocido');
    });
  });

  describe('findOneDetail', () => {
    const campaignId = 1;

    it('debe obtener detalle de campaña por ID', async () => {
      campaignsRepository.findOne.mockResolvedValue(mockCampaign);

      const result = await service.findOneDetail(campaignId);

      expect(result.id).toBe(1);
      expect(campaignsRepository.findOne).toHaveBeenCalledWith({
        where: { id: campaignId },
        relations: ['organizacion', 'imagenes'],
      });
    });

    it('debe lanzar error cuando la campaña no existe', async () => {
      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneDetail(campaignId)).rejects.toThrow(
        'Campaña no encontrada',
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      campaignsRepository.findOne.mockRejectedValue('Error string inesperado');

      await expect(service.findOneDetail(campaignId)).rejects.toThrow(
        'Error desconocido',
      );
    });
  });

  describe('create', () => {
    const organizacionId = 1;
    const usuarioId = 1;
    const createDto: CreateCampaignsDto = {
      titulo: 'Nueva Campaña',
      descripcion: 'Descripción de la campaña',
      fecha_Inicio: new Date('2025-06-01'),
      fecha_Fin: new Date('2025-08-31'),
      objetivo: 100000,
      puntos: 50,
    };
    const imagenes = ['/uploads/img1.jpg', '/uploads/img2.jpg'];

    beforeEach(() => {
      organizacionRepository.findOne.mockResolvedValue(mockOrganizacion);
      campaignsRepository.create.mockReturnValue(mockCampaign);
      campaignsRepository.save.mockResolvedValue(mockCampaign);
      campaignsImagesRepository.save.mockResolvedValue(mockImagenCampania);
      campaignsRepository.findOne.mockResolvedValue(mockCampaign);
    });

    it('debe crear una campaña exitosamente', async () => {
      const result = await service.create(
        organizacionId,
        createDto,
        imagenes,
        usuarioId,
      );

      expect(result.id).toBe(1);
      expect(organizacionRepository.findOne).toHaveBeenCalledWith({
        where: { id: organizacionId, habilitada: true },
      });
      expect(campaignsRepository.create).toHaveBeenCalled();
      expect(campaignsRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar error cuando la organización no existe', async () => {
      organizacionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(organizacionId, createDto, imagenes, usuarioId),
      ).rejects.toThrow(
        'Organización con ID 1 no encontrada o está deshabilitada',
      );
    });

    it('debe lanzar error cuando el objetivo es menor o igual a 0', async () => {
      const dtoInvalido = { ...createDto, objetivo: 0 };

      await expect(
        service.create(organizacionId, dtoInvalido, imagenes, usuarioId),
      ).rejects.toThrow('El objetivo tiene que ser mayor a 0');
    });

    it('debe lanzar error cuando la fecha de fin es anterior a la fecha de inicio', async () => {
      const dtoFechasInvalidas = {
        ...createDto,
        fecha_Inicio: new Date('2025-08-31'),
        fecha_Fin: new Date('2025-06-01'),
      };

      await expect(
        service.create(organizacionId, dtoFechasInvalidas, imagenes, usuarioId),
      ).rejects.toThrow(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    });

    it('debe lanzar error cuando la campaña no se encuentra después de crear', async () => {
      organizacionRepository.findOne.mockResolvedValue(mockOrganizacion);
      campaignsRepository.create.mockReturnValue(mockCampaign);
      campaignsRepository.save.mockResolvedValue(mockCampaign);
      campaignsImagesRepository.save.mockResolvedValue(mockImagenCampania);

      campaignsRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.create(organizacionId, createDto, imagenes, usuarioId),
      ).rejects.toThrow('Error al recuperar la campaña recién creada');
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      organizacionRepository.findOne.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(
        service.create(organizacionId, createDto, imagenes, usuarioId),
      ).rejects.toThrow('Error desconocido');
    });

    it('debe lanzar error cuando falta fecha de inicio', async () => {
      const dtoSinFechaInicio = {
        ...createDto,
        fecha_Inicio: undefined as unknown as Date,
      };
      organizacionRepository.findOne.mockResolvedValue(mockOrganizacion);

      await expect(
        service.create(organizacionId, dtoSinFechaInicio, imagenes, usuarioId),
      ).rejects.toThrow('Las fechas son obligatorias');
    });
  });

  describe('update', () => {
    const organizacionId = 1;
    const campaignId = 1;
    const usuarioId = 1;
    const updateDto: UpdateCampaignsDto = {
      titulo: 'Título Actualizado',
      objetivo: 150000,
    };

    beforeEach(() => {
      campaignsRepository.findOne.mockResolvedValue(mockCampaign);
      organizacionRepository.findOne.mockResolvedValue(mockOrganizacion);
      campaignsRepository.save.mockResolvedValue({
        ...mockCampaign,
        titulo: 'Título Actualizado',
      });
      campaignsImagesRepository.find.mockResolvedValue([mockImagenCampania]);
    });

    it('debe actualizar una campaña exitosamente', async () => {
      const result = await service.update(
        organizacionId,
        campaignId,
        updateDto,
        usuarioId,
      );

      expect(result.id).toBe(1);
      expect(campaignsRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar error cuando la campaña no existe', async () => {
      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(organizacionId, campaignId, updateDto, usuarioId),
      ).rejects.toThrow(`Campaña con ID ${campaignId} no encontrada`);
    });

    it('debe lanzar error cuando la campaña no pertenece a la organización', async () => {
      const campaignOtraOrg = Object.assign(new Campaigns(), {
        ...mockCampaign,
        organizacion: Object.assign(new Organizacion(), { id: 999 }),
      });
      campaignsRepository.findOne.mockResolvedValue(campaignOtraOrg);

      await expect(
        service.update(organizacionId, campaignId, updateDto, usuarioId),
      ).rejects.toThrow('Esta campaña no pertenece a tu organización');
    });

    it('debe lanzar error cuando la organización está deshabilitada', async () => {
      organizacionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(organizacionId, campaignId, updateDto, usuarioId),
      ).rejects.toThrow(
        `Organización con ID ${organizacionId} no encontrada o está deshabilitada`,
      );
    });

    it('debe lanzar error cuando el objetivo es negativo', async () => {
      const updateDtoNegativo: UpdateCampaignsDto = { objetivo: -100 };

      campaignsRepository.findOne.mockResolvedValue(mockCampaign);
      organizacionRepository.findOne.mockResolvedValue(mockOrganizacion);

      await expect(
        service.update(
          organizacionId,
          campaignId,
          updateDtoNegativo,
          usuarioId,
        ),
      ).rejects.toThrow('El objetivo no puede ser negativo');
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      const updateDto: UpdateCampaignsDto = { titulo: 'Nuevo título' };

      campaignsRepository.findOne.mockRejectedValue('Error string inesperado');

      await expect(
        service.update(organizacionId, campaignId, updateDto, usuarioId),
      ).rejects.toThrow('Error desconocido');
    });

    it('debe actualizar el estado automáticamente cuando se actualizan fechas', async () => {
      const updateDtoFechas: UpdateCampaignsDto = {
        fecha_Inicio: new Date('2025-01-01'),
        fecha_Fin: new Date('2025-12-31'),
      };

      campaignsRepository.findOne.mockResolvedValue(mockCampaign);
      organizacionRepository.findOne.mockResolvedValue(mockOrganizacion);
      campaignsRepository.save.mockResolvedValue({
        ...mockCampaign,
        estado: CampaignEstado.PENDIENTE,
      });

      const result = await service.update(
        organizacionId,
        campaignId,
        updateDtoFechas,
        usuarioId,
      );

      expect(result).toBeDefined();
      expect(campaignsRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateEstado', () => {
    const campaignId = 1;
    const estado = CampaignEstado.ACTIVA;

    beforeEach(() => {
      campaignsRepository.findOne.mockResolvedValue(mockCampaign);
      campaignsRepository.save.mockResolvedValue({ ...mockCampaign, estado });
    });

    it('debe actualizar el estado de una campaña', async () => {
      const result = await service.updateEstado(campaignId, estado);

      expect(result.estado).toBe(CampaignEstado.ACTIVA);
      expect(campaignsRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar error cuando la campaña no existe', async () => {
      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(service.updateEstado(campaignId, estado)).rejects.toThrow(
        `Campaña con ID ${campaignId} no encontrada`,
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      campaignsRepository.findOne.mockRejectedValue('Error string inesperado');

      await expect(service.updateEstado(campaignId, estado)).rejects.toThrow(
        'Error desconocido',
      );
    });
  });

  describe('delete', () => {
    const campaignId = 1;

    beforeEach(() => {
      campaignsRepository.findOne.mockResolvedValue(mockCampaign);
      campaignsRepository.remove.mockResolvedValue(mockCampaign as any);
    });

    it('debe eliminar una campaña', async () => {
      await service.delete(campaignId);

      expect(campaignsRepository.remove).toHaveBeenCalledWith(mockCampaign);
    });

    it('debe lanzar error cuando la campaña no existe', async () => {
      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(campaignId)).rejects.toThrow(
        `Campaña con ID ${campaignId} no encontrada`,
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      campaignsRepository.findOne.mockRejectedValue('Error string inesperado');

      await expect(service.delete(campaignId)).rejects.toThrow(
        'Error desconocido',
      );
    });
  });
});
