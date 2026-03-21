import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';

import { CampaignsService } from '../../src/Modules/campaign/campaign.service';
import { Campaigns } from '../../src/Entities/campaigns.entity';
import { Organizacion } from '../../src/Entities/organizacion.entity';
import { imagenes_campania } from '../../src/Entities/imagenes_campania.entity';

import { CreateCampaignsDto } from '../../src/Modules/campaign/dto/create_campaigns.dto';
import { UpdateCampaignsDto } from '../../src/Modules/campaign/dto/update_campaigns.dto';
import { CampaignEstado } from '../../src/Modules/campaign/enum';

describe('CampaignsService', () => {
  let service: CampaignsService;

  let campaignsRepository: DeepMockProxy<Repository<Campaigns>>;
  let organizacionRepository: DeepMockProxy<Repository<Organizacion>>;
  let campaignsImagesRepository: DeepMockProxy<Repository<imagenes_campania>>;

  const ORG_ID = 1;
  const CAMPAIGN_ID = 1;
  const USUARIO_ID = 10;

  let organizacion: Organizacion;
  let campaign: Campaigns;
  let campaignImages: imagenes_campania[];

  let createCampaignDto: CreateCampaignsDto;
  let updateCampaignDto: UpdateCampaignsDto;

  beforeEach(async () => {
    campaignsRepository = mockDeep<Repository<Campaigns>>();
    organizacionRepository = mockDeep<Repository<Organizacion>>();
    campaignsImagesRepository = mockDeep<Repository<imagenes_campania>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        {
          provide: getRepositoryToken(Campaigns),
          useValue: campaignsRepository,
        },
        {
          provide: getRepositoryToken(Organizacion),
          useValue: organizacionRepository,
        },
        {
          provide: getRepositoryToken(imagenes_campania),
          useValue: campaignsImagesRepository,
        },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);

    // ========== DTOs ==========
    createCampaignDto = {
      titulo: 'Campaña de Ayuda',
      descripcion: 'Campaña solidaria',
      fecha_Inicio: new Date('2025-01-01'),
      fecha_Fin: new Date('2025-12-31'),
      objetivo: 10000,
      puntos: 100,
    };

    updateCampaignDto = {
      titulo: 'Campaña Actualizada',
      descripcion: 'Descripción nueva',
      objetivo: 20000,
    };

    // ========== Entidades ==========
    organizacion = {
      id: ORG_ID,
      nombre_organizacion: 'Organización Solidaria',
      verificada: true,
      habilitada: true,
    } as unknown as Organizacion;

    campaignImages = [
      {
        id: 1,
        imagen: '/images/campaign1.jpg',
        esPortada: true,
      } as imagenes_campania,
    ];

    campaign = {
      id: CAMPAIGN_ID,
      titulo: 'Campaña de Ayuda',
      descripcion: 'Campaña solidaria',
      fecha_Inicio: new Date('2025-01-01'),
      fecha_Fin: new Date('2025-12-31'),
      objetivo: 10000,
      puntos: 100,
      estado: CampaignEstado.PENDIENTE,
      fecha_Registro: new Date(),
      ultimo_cambio: new Date(),
      organizacion: { ...organizacion, id: CAMPAIGN_ID },
      imagenes: campaignImages,
      donaciones: [],
    } as unknown as Campaigns;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTS DE FIND PAGINATED ==========
  describe('findPaginated', () => {
    const buildQueryBuilder = () => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[campaign], 1]),
    });

    it('debe retornar campañas paginadas', async () => {
      const queryBuilder: any = buildQueryBuilder();
      campaignsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findPaginated(1, 10, '', false);

      expect(result.total).toBe(1);
      expect(result.items.length).toBe(1);
    });

    it('debe aplicar filtros fijos de habilitado y habilitada siempre', async () => {
      const queryBuilder: any = buildQueryBuilder();
      campaignsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findPaginated(1, 10, '', false);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'usuario.habilitado = :habilitado',
        { habilitado: 1 },
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'organizacion.habilitada = :habilitada',
        { habilitada: 1 },
      );
    });

    it('debe aplicar filtro de estado cuando onlyEnabled es true', async () => {
      const queryBuilder: any = buildQueryBuilder();
      campaignsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findPaginated(1, 10, '', true);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'campaign.estado = :estado',
        { estado: CampaignEstado.ACTIVA },
      );
    });

    it('debe aplicar filtro objetivo > 0 cuando onlyEnabled es true', async () => {
      const queryBuilder: any = buildQueryBuilder();
      campaignsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findPaginated(1, 10, '', true);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'campaign.objetivo > 0',
      );
    });

    it('NO debe aplicar filtro de estado cuando onlyEnabled es false', async () => {
      const queryBuilder: any = buildQueryBuilder();
      campaignsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findPaginated(1, 10, '', false);

      expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
        'campaign.estado = :estado',
        { estado: CampaignEstado.ACTIVA },
      );
    });

    it('debe aplicar búsqueda por título y descripción', async () => {
      const queryBuilder: any = buildQueryBuilder();
      campaignsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findPaginated(1, 10, 'ayuda', false);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(campaign.titulo LIKE :search OR campaign.descripcion LIKE :search)',
        { search: '%ayuda%' },
      );
    });

    it('NO debe aplicar búsqueda cuando search está vacío', async () => {
      const queryBuilder: any = buildQueryBuilder();
      campaignsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findPaginated(1, 10, '', false);

      expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
        expect.stringContaining('LIKE :search'),
        expect.anything(),
      );
    });
  });

  // ========== TESTS DE FIND CAMPAIGNS PAGINATED ==========
  describe('findCampaignsPaginated', () => {
    it('debe retornar campañas de una organización', async () => {
      campaignsRepository.findAndCount.mockResolvedValue([[campaign], 1]);

      const result = await service.findCampaignsPaginated(ORG_ID, 1, 10);

      expect(result.total).toBe(1);
      expect(result.items.length).toBe(1);
      expect(campaignsRepository.findAndCount).toHaveBeenCalledWith({
        where: { organizacion: { id: ORG_ID } },
        relations: ['organizacion', 'imagenes'],
        skip: 0,
        take: 10,
      });
    });

    it('debe respetar la paginación', async () => {
      campaignsRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findCampaignsPaginated(ORG_ID, 3, 5);

      expect(campaignsRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 }),
      );
    });
  });

  // ========== TESTS DE FIND ONE DETAIL ==========
  describe('findOneDetail', () => {
    it('debe retornar el detalle de una campaña', async () => {
      campaignsRepository.findOne.mockResolvedValue(campaign);

      const result = await service.findOneDetail(CAMPAIGN_ID);

      expect(result.id).toBe(CAMPAIGN_ID);
      expect(result.imagenes.length).toBe(1);
    });

    it('debe lanzar NotFoundException si la campaña no existe', async () => {
      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneDetail(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ========== TESTS DE CREATE ==========
  describe('create', () => {
    it('debe crear una campaña correctamente', async () => {
      organizacionRepository.findOne.mockResolvedValue(organizacion);
      campaignsRepository.create.mockReturnValue(campaign);
      campaignsRepository.save.mockResolvedValue(campaign);
      campaignsRepository.findOne.mockResolvedValue(campaign);
      campaignsImagesRepository.save.mockResolvedValue(campaignImages[0]);

      const result = await service.create(
        ORG_ID,
        createCampaignDto,
        ['/images/campaign1.jpg'],
        USUARIO_ID,
      );

      expect(result.id).toBe(campaign.id);
      expect(campaignsRepository.save).toHaveBeenCalled();
      expect(campaignsImagesRepository.save).toHaveBeenCalled();
    });

    it('debe crear campaña sin imágenes', async () => {
      organizacionRepository.findOne.mockResolvedValue(organizacion);
      campaignsRepository.create.mockReturnValue(campaign);
      campaignsRepository.save.mockResolvedValue(campaign);
      campaignsRepository.findOne.mockResolvedValue(campaign);

      const result = await service.create(ORG_ID, createCampaignDto, [], USUARIO_ID);

      expect(result.id).toBe(campaign.id);
      expect(campaignsImagesRepository.save).not.toHaveBeenCalled();
    });

    it('debe asignar creado_por y actualizado_por con usuarioId', async () => {
      organizacionRepository.findOne.mockResolvedValue(organizacion);
      campaignsRepository.create.mockReturnValue(campaign);
      campaignsRepository.save.mockResolvedValue(campaign);
      campaignsRepository.findOne.mockResolvedValue(campaign);

      await service.create(ORG_ID, createCampaignDto, [], USUARIO_ID);

      expect(campaignsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          creado_por: { id: USUARIO_ID },
          actualizado_por: { id: USUARIO_ID },
        }),
      );
    });

    it('debe lanzar NotFoundException si la organización no existe o está deshabilitada', async () => {
      organizacionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(ORG_ID, createCampaignDto, [], USUARIO_ID),
      ).rejects.toThrow(NotFoundException);

      expect(campaignsRepository.save).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException si el objetivo es menor o igual a 0', async () => {
      organizacionRepository.findOne.mockResolvedValue(organizacion);

      await expect(
        service.create(ORG_ID, { ...createCampaignDto, objetivo: 0 }, [], USUARIO_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si las fechas son inválidas (fin anterior a inicio)', async () => {
      organizacionRepository.findOne.mockResolvedValue(organizacion);

      await expect(
        service.create(
          ORG_ID,
          {
            ...createCampaignDto,
            fecha_Inicio: new Date('2025-12-31'),
            fecha_Fin: new Date('2025-01-01'),
          },
          [],
          USUARIO_ID,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe marcar la primera imagen como portada', async () => {
      organizacionRepository.findOne.mockResolvedValue(organizacion);
      campaignsRepository.create.mockReturnValue(campaign);
      campaignsRepository.save.mockResolvedValue(campaign);
      campaignsRepository.findOne.mockResolvedValue(campaign);
      campaignsImagesRepository.save.mockResolvedValue(campaignImages[0]);

      await service.create(
        ORG_ID,
        createCampaignDto,
        ['/img1.jpg', '/img2.jpg'],
        USUARIO_ID,
      );

      const primerGuardado = (campaignsImagesRepository.save as jest.Mock).mock.calls[0][0];
      expect(primerGuardado.esPortada).toBe(true);

      const segundoGuardado = (campaignsImagesRepository.save as jest.Mock).mock.calls[1][0];
      expect(segundoGuardado.esPortada).toBe(false);
    });
  });

  // ========== TESTS DE UPDATE ==========
  describe('update', () => {
    it('debe actualizar una campaña correctamente', async () => {
      campaignsRepository.findOne.mockResolvedValue(campaign);
      organizacionRepository.findOne.mockResolvedValue(organizacion);
      campaignsRepository.save.mockResolvedValue(campaign);
      campaignsImagesRepository.find.mockResolvedValue([]);

      const result = await service.update(CAMPAIGN_ID, updateCampaignDto, USUARIO_ID);

      expect(result.id).toBe(campaign.id);
      expect(campaignsRepository.save).toHaveBeenCalled();
    });

    it('debe asignar actualizado_por con usuarioId', async () => {
      campaignsRepository.findOne.mockResolvedValue(campaign);
      organizacionRepository.findOne.mockResolvedValue(organizacion);
      campaignsRepository.save.mockResolvedValue(campaign);
      campaignsImagesRepository.find.mockResolvedValue([]);

      await service.update(CAMPAIGN_ID, updateCampaignDto, USUARIO_ID);

      const savedCampaign = (campaignsRepository.save as jest.Mock).mock.calls[0][0];
      expect(savedCampaign.actualizado_por).toEqual({ id: USUARIO_ID });
    });

    it('debe agregar nuevas imágenes', async () => {
      campaignsRepository.findOne.mockResolvedValue(campaign);
      organizacionRepository.findOne.mockResolvedValue(organizacion);
      campaignsImagesRepository.find.mockResolvedValue([]);
      campaignsImagesRepository.findOne.mockResolvedValue(null);
      campaignsRepository.save.mockResolvedValue(campaign);

      await service.update(CAMPAIGN_ID, updateCampaignDto, USUARIO_ID, ['/img1.jpg']);

      expect(campaignsImagesRepository.save).toHaveBeenCalled();
    });

    it('debe eliminar imágenes que no están en imagenesExistentes', async () => {
      campaignsRepository.findOne.mockResolvedValue(campaign);
      organizacionRepository.findOne.mockResolvedValue(organizacion);
      campaignsImagesRepository.find.mockResolvedValue(campaignImages);
      campaignsRepository.save.mockResolvedValue(campaign);

      await service.update(CAMPAIGN_ID, { imagenesExistentes: [] }, USUARIO_ID);

      expect(campaignsImagesRepository.remove).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si la campaña no existe', async () => {
      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(CAMPAIGN_ID, updateCampaignDto, USUARIO_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar ForbiddenException si la campaña no pertenece a la organización del id', async () => {
      const campaignDeOtraOrg = {
        ...campaign,
        organizacion: { ...organizacion, id: 999 },
      } as unknown as Campaigns;

      campaignsRepository.findOne.mockResolvedValue(campaignDeOtraOrg);

      await expect(
        service.update(CAMPAIGN_ID, updateCampaignDto, USUARIO_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debe lanzar BadRequestException si el objetivo es negativo', async () => {
      campaignsRepository.findOne.mockResolvedValue(campaign);
      organizacionRepository.findOne.mockResolvedValue(organizacion);

      await expect(
        service.update(CAMPAIGN_ID, { objetivo: -100 }, USUARIO_ID),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar NotFoundException si la organización no existe o está deshabilitada', async () => {
      campaignsRepository.findOne.mockResolvedValue(campaign);
      organizacionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(CAMPAIGN_ID, updateCampaignDto, USUARIO_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ========== TESTS DE UPDATE ESTADO ==========
  describe('updateEstado', () => {
    it('debe actualizar el estado de una campaña', async () => {
      campaignsRepository.findOne.mockResolvedValue(campaign);
      campaignsRepository.save.mockResolvedValue({
        ...campaign,
        estado: CampaignEstado.ACTIVA,
      });

      await service.updateEstado(CAMPAIGN_ID, CampaignEstado.ACTIVA);

      expect(campaignsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ estado: CampaignEstado.ACTIVA }),
      );
    });

    it('debe lanzar NotFoundException si la campaña no existe', async () => {
      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateEstado(999, CampaignEstado.ACTIVA),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ========== TESTS DE DELETE ==========
  describe('delete', () => {
    it('debe eliminar una campaña correctamente', async () => {
      campaignsRepository.findOne.mockResolvedValue(campaign);
      campaignsRepository.remove.mockResolvedValue(campaign);

      await service.delete(CAMPAIGN_ID);

      expect(campaignsRepository.remove).toHaveBeenCalledWith(campaign);
    });

    it('debe lanzar NotFoundException si la campaña no existe', async () => {
      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);

      expect(campaignsRepository.remove).not.toHaveBeenCalled();
    });
  });
});