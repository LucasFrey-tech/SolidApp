import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CampaignsService } from '../../src/Modules/campaign/campaign.service';
import { Campaigns } from '../../src/Entities/campaigns.entity';
import { PerfilOrganizacion } from '../../src/Entities/perfil_organizacion.entity';
import { Campaigns_images } from '../../src/Entities/campaigns_images.entity';
import { CreateCampaignsDto } from '../../src/Modules/campaign/dto/create_campaigns.dto';
import { UpdateCampaignsDto } from '../../src/Modules/campaign/dto/update_campaigns.dto';
import { ResponseCampaignsDto } from '../../src/Modules/campaign/dto/response_campaigns.dto';
import { ResponseCampaignDetalleDto } from '../../src/Modules/campaign/dto/response_campaignDetalle.dto';
import { ResponseCampaignsDetailPaginatedDto } from '../../src/Modules/campaign/dto/response_campaign_paginated.dto';
import { CampaignEstado } from '../../src/Modules/campaign/enum';

describe('CampaignsService', () => {
  let service: CampaignsService;
  let mockCampaignsRepository: {
    findOne: jest.Mock<Promise<Campaigns | null>, [object]>;
    findAndCount: jest.Mock<Promise<[Campaigns[], number]>, [object]>;
    create: jest.Mock<Campaigns, [object]>;
    save: jest.Mock<Promise<Campaigns>, [Campaigns]>;
    remove: jest.Mock<Promise<Campaigns>, [Campaigns]>;
  };
  let mockOrganizacionRepository: {
    findOne: jest.Mock<Promise<PerfilOrganizacion | null>, [object]>;
  };
  let mockCampaignsImagesRepository: {
    find: jest.Mock<Promise<Campaigns_images[]>, [object]>;
    save: jest.Mock<Promise<Campaigns_images>, [Campaigns_images]>;
    remove: jest.Mock<Promise<Campaigns_images[]>, [Campaigns_images[]]>;
    findOne: jest.Mock<Promise<Campaigns_images | null>, [object]>;
  };

  let organizacion: PerfilOrganizacion;
  let campaign: Campaigns;
  let createCampaignDto: CreateCampaignsDto;
  let updateCampaignDto: UpdateCampaignsDto;
  let campaignImages: Campaigns_images[];
  let responseCampaignDto: ResponseCampaignsDto;
  let responseCampaignDetalleDto: ResponseCampaignDetalleDto;

  beforeEach(async () => {
    mockCampaignsRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    mockOrganizacionRepository = {
      findOne: jest.fn(),
    };
    mockCampaignsImagesRepository = {
      find: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        {
          provide: getRepositoryToken(Campaigns),
          useValue: mockCampaignsRepository,
        },
        {
          provide: getRepositoryToken(PerfilOrganizacion),
          useValue: mockOrganizacionRepository,
        },
        {
          provide: getRepositoryToken(Campaigns_images),
          useValue: mockCampaignsImagesRepository,
        },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);

    // ========== DTOs ==========
    createCampaignDto = {
      titulo: 'Campaña de Ayuda',
      descripcion: 'Campaña para ayudar a necesitados',
      fecha_Inicio: new Date('2025-01-01'),
      fecha_Fin: new Date('2025-12-31'),
      objetivo: 10000,
      puntos: 100,
    };

    updateCampaignDto = {
      titulo: 'Campaña de Ayuda Actualizada',
      descripcion: 'Campaña actualizada',
      objetivo: 15000,
    };

    // ========== Organizacion ==========
    organizacion = {
      id: 1,
      nombre_organizacion: 'Organización Solidaria',
      verificada: true,
      cuenta: { deshabilitado: false },
    } as unknown as PerfilOrganizacion;

    // ========== Campaign ==========
    campaign = {
      id: 1,
      titulo: 'Campaña de Ayuda',
      descripcion: 'Campaña para ayudar a necesitados',
      fecha_Inicio: new Date('2025-01-01'),
      fecha_Fin: new Date('2025-12-31'),
      objetivo: 10000,
      puntos: 100,
      estado: CampaignEstado.PENDIENTE,
      fecha_Registro: new Date(),
      ultimo_cambio: new Date(),
      organizacion,
      imagenes: [],
      donaciones: [],
    } as unknown as Campaigns;

    // ========== Campaign Images ==========
    campaignImages = [
      {
        id: 1,
        imagen: '/images/campaign1.jpg',
        esPortada: true,
        id_campaign: campaign,
      } as Campaigns_images,
    ];

    // ========== Response DTOs ==========
    responseCampaignDto = {
      id: 1,
      titulo: 'Campaña de Ayuda',
      descripcion: 'Campaña para ayudar a necesitados',
      fecha_Inicio: new Date('2025-01-01'),
      fecha_Fin: new Date('2025-12-31'),
      objetivo: 10000,
      puntos: 100,
      estado: CampaignEstado.PENDIENTE,
      fecha_Registro: new Date(),
      imagenPortada: '/images/campaign1.jpg',
      organizacion: {
        id: 1,
        nombre_organizacion: 'Organización Solidaria',
        verificada: true,
      },
    };

    responseCampaignDetalleDto = {
      ...responseCampaignDto,
      imagenes: [
        {
          id: 1,
          nombre: 'campaign1',
          url: '/images/campaign1.jpg',
          esPortada: true,
        },
      ],
    } as unknown as ResponseCampaignDetalleDto;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTS DE FIND CAMPAIGNS PAGINATED ==========
  describe('findCampaignsPaginated', () => {
    it('debe retornar campañas paginadas de una organización específica', async () => {
      mockCampaignsRepository.findAndCount.mockResolvedValue([[campaign], 1]);

      const resultado: ResponseCampaignsDetailPaginatedDto =
        await service.findCampaignsPaginated(1, 1, 10);

      expect(resultado.items).toHaveLength(1);
      expect(resultado.total).toBe(1);
      expect(mockCampaignsRepository.findAndCount).toHaveBeenCalledWith({
        where: { organizacion: { id: 1 } },
        relations: ['organizacion', 'imagenes'],
        skip: 0,
        take: 10,
      });
    });
  });

  // ========== TESTS DE FIND ONE DETAIL ==========
  describe('findOneDetail', () => {
    it('debe retornar una campaña específica con detalles', async () => {
      const campaignConImagenes = { ...campaign, imagenes: campaignImages };
      mockCampaignsRepository.findOne.mockResolvedValue(campaignConImagenes);

      const resultado: ResponseCampaignDetalleDto =
        await service.findOneDetail(1);

      expect(resultado).toEqual(responseCampaignDetalleDto);
    });

    it('debe lanzar NotFoundException si la campaña no existe', async () => {
      mockCampaignsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneDetail(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ========== TESTS DE CREATE ==========
  describe('create', () => {
    it('debe crear una campaña correctamente', async () => {
      mockOrganizacionRepository.findOne.mockResolvedValue(organizacion);
      mockCampaignsRepository.create.mockReturnValue(campaign);
      mockCampaignsRepository.save.mockResolvedValue(campaign);
      mockCampaignsImagesRepository.save.mockResolvedValue(campaignImages[0]);

      const resultado: ResponseCampaignsDto = await service.create(
        1,
        createCampaignDto,
        ['/images/campaign1.jpg'],
      );

      expect(resultado.id).toBe(campaign.id);
      expect(resultado.titulo).toBe(campaign.titulo);
      expect(mockCampaignsRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si la organización no existe', async () => {
      mockOrganizacionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(999, createCampaignDto, ['/images/campaign1.jpg']),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si el objetivo es menor a 0', async () => {
      mockOrganizacionRepository.findOne.mockResolvedValue(organizacion);

      const dtoInvalido: CreateCampaignsDto = {
        ...createCampaignDto,
        objetivo: -100,
      };

      await expect(
        service.create(1, dtoInvalido, ['/images/campaign1.jpg']),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si fecha_Fin es anterior a fecha_Inicio', async () => {
      mockOrganizacionRepository.findOne.mockResolvedValue(organizacion);

      const dtoInvalido: CreateCampaignsDto = {
        ...createCampaignDto,
        fecha_Inicio: new Date('2025-12-31'),
        fecha_Fin: new Date('2025-01-01'),
      };

      await expect(
        service.create(1, dtoInvalido, ['/images/campaign1.jpg']),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ========== TESTS DE UPDATE ==========
  describe('update', () => {
    it('debe actualizar una campaña correctamente', async () => {
      mockCampaignsRepository.findOne.mockResolvedValue(campaign);
      mockOrganizacionRepository.findOne.mockResolvedValue(organizacion);
      mockCampaignsImagesRepository.find.mockResolvedValue([]);
      mockCampaignsRepository.save.mockResolvedValue(campaign);

      const resultado: ResponseCampaignsDto = await service.update(
        1,
        updateCampaignDto,
      );

      expect(resultado.id).toBe(campaign.id);
      expect(mockCampaignsRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si la campaña no existe', async () => {
      mockCampaignsRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateCampaignDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar BadRequestException si el objetivo es negativo', async () => {
      mockCampaignsRepository.findOne.mockResolvedValue(campaign);
      mockOrganizacionRepository.findOne.mockResolvedValue(organizacion);

      const dtoInvalido: UpdateCampaignsDto = { objetivo: -100 };

      await expect(service.update(1, dtoInvalido)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ========== TESTS DE UPDATE ESTADO ==========
  describe('updateEstado', () => {
    it('debe actualizar el estado de una campaña', async () => {
      mockCampaignsRepository.findOne.mockResolvedValue(campaign);
      mockCampaignsRepository.save.mockResolvedValue(campaign);

      await service.updateEstado(1, CampaignEstado.ACTIVA);

      expect(mockCampaignsRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si la campaña no existe', async () => {
      mockCampaignsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateEstado(999, CampaignEstado.ACTIVA),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ========== TESTS DE DELETE ==========
  describe('delete', () => {
    it('debe eliminar una campaña correctamente', async () => {
      mockCampaignsRepository.findOne.mockResolvedValue(campaign);
      mockCampaignsRepository.remove.mockResolvedValue(campaign);

      await service.delete(1);

      expect(mockCampaignsRepository.remove).toHaveBeenCalledWith(campaign);
    });

    it('debe lanzar NotFoundException si la campaña no existe', async () => {
      mockCampaignsRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
