import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Repository } from 'typeorm';

import { CampaignsService } from '../../src/Modules/campaign/campaign.service';
import { Campaigns } from '../../src/Entities/campaigns.entity';
import { PerfilOrganizacion } from '../../src/Entities/perfil_organizacion.entity';
import { Campaigns_images } from '../../src/Entities/campaigns_images.entity';

import { CreateCampaignsDto } from '../../src/Modules/campaign/dto/create_campaigns.dto';
import { UpdateCampaignsDto } from '../../src/Modules/campaign/dto/update_campaigns.dto';

import { CampaignEstado } from '../../src/Modules/campaign/enum';

describe('CampaignsService', () => {
  let service: CampaignsService;

  let campaignsRepository: DeepMockProxy<Repository<Campaigns>>;
  let organizacionRepository: DeepMockProxy<Repository<PerfilOrganizacion>>;
  let campaignsImagesRepository: DeepMockProxy<Repository<Campaigns_images>>;

  let organizacion: PerfilOrganizacion;
  let campaign: Campaigns;
  let campaignImages: Campaigns_images[];

  let createCampaignDto: CreateCampaignsDto;
  let updateCampaignDto: UpdateCampaignsDto;

  beforeEach(async () => {
    campaignsRepository = mockDeep<Repository<Campaigns>>();
    organizacionRepository = mockDeep<Repository<PerfilOrganizacion>>();
    campaignsImagesRepository = mockDeep<Repository<Campaigns_images>>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        {
          provide: getRepositoryToken(Campaigns),
          useValue: campaignsRepository,
        },
        {
          provide: getRepositoryToken(PerfilOrganizacion),
          useValue: organizacionRepository,
        },
        {
          provide: getRepositoryToken(Campaigns_images),
          useValue: campaignsImagesRepository,
        },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);

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

    organizacion = {
      id: 1,
      nombre_organizacion: 'Organización Solidaria',
      verificada: true,
      cuenta: { deshabilitado: false },
    } as unknown as PerfilOrganizacion;

    campaignImages = [
      {
        id: 1,
        imagen: '/images/campaign1.jpg',
        esPortada: true,
      } as Campaigns_images,
    ];

    campaign = {
      id: 1,
      titulo: 'Campaña de Ayuda',
      descripcion: 'Campaña solidaria',
      fecha_Inicio: new Date('2025-01-01'),
      fecha_Fin: new Date('2025-12-31'),
      objetivo: 10000,
      puntos: 100,
      estado: CampaignEstado.PENDIENTE,
      fecha_Registro: new Date(),
      ultimo_cambio: new Date(),
      organizacion,
      imagenes: campaignImages,
      donaciones: [],
    } as unknown as Campaigns;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findPaginated', () => {
    const buildQueryBuilder = () => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
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

    it('debe aplicar filtro onlyEnabled', async () => {
      const queryBuilder: any = buildQueryBuilder();

      campaignsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findPaginated(1, 10, '', true);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'campaign.estado = :estado',
        { estado: CampaignEstado.ACTIVA },
      );
    });

    it('debe aplicar búsqueda', async () => {
      const queryBuilder: any = buildQueryBuilder();

      campaignsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findPaginated(1, 10, 'ayuda', false);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(campaign.titulo LIKE :search OR campaign.descripcion LIKE :search)',
        { search: '%ayuda%' },
      );
    });

    it('NO debe aplicar filtro onlyEnabled cuando es false', async () => {
      const queryBuilder: any = buildQueryBuilder();

      campaignsRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findPaginated(1, 10, '', false);

      expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
        'campaign.estado = :estado',
        { estado: CampaignEstado.ACTIVA },
      );
    });
  });

  describe('findCampaignsPaginated', () => {
    it('debe retornar campañas de una organización', async () => {
      campaignsRepository.findAndCount.mockResolvedValue([[campaign], 1]);

      const result = await service.findCampaignsPaginated(1, 1, 10);

      expect(result.total).toBe(1);

      expect(campaignsRepository.findAndCount).toHaveBeenCalledWith({
        where: { organizacion: { id: 1 } },
        relations: ['organizacion', 'imagenes'],
        skip: 0,
        take: 10,
      });
    });
  });

  describe('findOneDetail', () => {
    it('debe retornar campaña', async () => {
      campaignsRepository.findOne.mockResolvedValue(campaign);

      const result = await service.findOneDetail(1);

      expect(result.id).toBe(1);
      expect(result.imagenes.length).toBe(1);
    });

    it('debe lanzar NotFound', async () => {
      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneDetail(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('debe crear campaña', async () => {
      organizacionRepository.findOne.mockResolvedValue(organizacion);

      campaignsRepository.create.mockReturnValue(campaign);
      campaignsRepository.save.mockResolvedValue(campaign);

      campaignsImagesRepository.save.mockResolvedValue(campaignImages[0]);

      const result = await service.create(1, createCampaignDto, [
        '/images/campaign1.jpg',
      ]);

      expect(result.id).toBe(campaign.id);

      expect(campaignsRepository.save).toHaveBeenCalled();
      expect(campaignsImagesRepository.save).toHaveBeenCalled();
    });

    it('debe fallar si organización no existe', async () => {
      organizacionRepository.findOne.mockResolvedValue(null);

      await expect(service.create(1, createCampaignDto, [])).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe fallar si objetivo negativo', async () => {
      organizacionRepository.findOne.mockResolvedValue(organizacion);

      await expect(
        service.create(1, { ...createCampaignDto, objetivo: -1 }, []),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe fallar si fechas inválidas', async () => {
      organizacionRepository.findOne.mockResolvedValue(organizacion);

      await expect(
        service.create(
          1,
          {
            ...createCampaignDto,
            fecha_Inicio: new Date('2025-12-31'),
            fecha_Fin: new Date('2025-01-01'),
          },
          [],
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('debe actualizar campaña', async () => {
      campaignsRepository.findOne.mockResolvedValue(campaign);
      organizacionRepository.findOne.mockResolvedValue(organizacion);

      campaignsRepository.save.mockResolvedValue(campaign);

      campaignsImagesRepository.find.mockResolvedValue([]);

      const result = await service.update(1, updateCampaignDto);

      expect(result.id).toBe(campaign.id);
      expect(campaignsRepository.save).toHaveBeenCalled();
    });

    it('debe agregar nuevas imágenes', async () => {
      campaignsRepository.findOne.mockResolvedValue(campaign);
      organizacionRepository.findOne.mockResolvedValue(organizacion);

      campaignsImagesRepository.find.mockResolvedValue([]);
      campaignsImagesRepository.findOne.mockResolvedValue(null);

      campaignsRepository.save.mockResolvedValue(campaign);

      await service.update(1, updateCampaignDto, ['/img1.jpg']);

      expect(campaignsImagesRepository.save).toHaveBeenCalled();
    });

    it('debe eliminar imágenes removidas', async () => {
      campaignsRepository.findOne.mockResolvedValue(campaign);
      organizacionRepository.findOne.mockResolvedValue(organizacion);

      campaignsImagesRepository.find.mockResolvedValue(campaignImages);

      campaignsRepository.save.mockResolvedValue(campaign);

      await service.update(1, {
        imagenesExistentes: [],
      });

      expect(campaignsImagesRepository.remove).toHaveBeenCalled();
    });

    it('debe lanzar NotFound si campaña no existe', async () => {
      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateCampaignDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar BadRequest si objetivo negativo', async () => {
      campaignsRepository.findOne.mockResolvedValue(campaign);
      organizacionRepository.findOne.mockResolvedValue(organizacion);

      await expect(service.update(1, { objetivo: -100 })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateEstado', () => {
    it('debe actualizar estado', async () => {
      campaignsRepository.findOne.mockResolvedValue(campaign);
      campaignsRepository.save.mockResolvedValue(campaign);

      await service.updateEstado(1, CampaignEstado.ACTIVA);

      expect(campaignsRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar NotFound', async () => {
      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateEstado(999, CampaignEstado.ACTIVA),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('debe eliminar campaña', async () => {
      campaignsRepository.findOne.mockResolvedValue(campaign);
      campaignsRepository.remove.mockResolvedValue(campaign);

      await service.delete(1);

      expect(campaignsRepository.remove).toHaveBeenCalledWith(campaign);
    });

    it('debe lanzar NotFound si campaña no existe', async () => {
      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
