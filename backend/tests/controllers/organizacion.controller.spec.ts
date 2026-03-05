import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { OrganizacionesController } from '../../src/Modules/organization/organizacion.controller';
import { PerfilOrganizacionService } from '../../src/Modules/organization/organizacion.service';
import { RequestConUsuario } from '../../src/Modules/auth/interfaces/authenticated_request.interface';

import { ResponseOrganizacionDto } from '../../src/Modules/organization/dto/response_organizacion.dto';
import { ResponseCampaignsDetailPaginatedDto } from '../../src/Modules/campaign/dto/response_campaign_paginated.dto';
import { ResponseCampaignsDto } from '../../src/Modules/campaign/dto/response_campaigns.dto';
import { ResponseOrganizationPaginatedDto } from '../../src/Modules/organization/dto/response_organizacion_paginated.dto';
import { PaginatedOrganizationDonationsResponseDto } from '../../src/Modules/donation/dto/response_donation_paginatedByOrganizacion.dto';
import { UpdateDonacionEstadoDto } from '../../src/Modules/donation/dto/update_donation_estado.dto';
import { UpdateOrganizacionDto } from '../../src/Modules/organization/dto/update_organizacion.dto';
import { UpdateCredencialesDto } from '../../src/Modules/user/dto/panelUsuario.dto';
import { CreateCampaignsDto } from '../../src/Modules/campaign/dto/create_campaigns.dto';
import { UpdateCampaignsDto } from '../../src/Modules/campaign/dto/update_campaigns.dto';
import { ResponseDonationDto } from '../../src/Modules/donation/dto/response_donation.dto';
import { DonacionEstado } from '../../src/Modules/donation/enum';

describe('OrganizacionesController', () => {
  let controller: OrganizacionesController;
  let service: DeepMockProxy<PerfilOrganizacionService>;

  beforeEach(async () => {
    service = mockDeep<PerfilOrganizacionService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizacionesController],
      providers: [
        {
          provide: PerfilOrganizacionService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<OrganizacionesController>(OrganizacionesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockRequest = (
    perfilId: number,
    cuentaId?: number,
  ): RequestConUsuario =>
    ({
      user: {
        perfil: { id: perfilId },
        cuenta: { id: cuentaId ?? 1 },
      },
    }) as RequestConUsuario;

  const mockDonationResponse: ResponseDonationDto = {
    id: 1,
    titulo: 'Donación test',
    detalle: 'Detalle',
    cantidad: 1,
    puntos: 10,
    campaignId: 1,
    userId: 1,
    fecha_registro: new Date(),
    imagen: 'img.jpg',
    estado: DonacionEstado.APROBADA,
  };

  describe('getMiPerfil', () => {
    it('debe retornar el perfil', async () => {
      const req = mockRequest(10);
      const response = {} as ResponseOrganizacionDto;

      service.findOne.mockResolvedValue(response);

      const result = await controller.getMiPerfil(req);

      expect(service.findOne).toHaveBeenCalledWith(10);
      expect(result).toBe(response);
    });
  });

  describe('getMisCampañas', () => {
    it('debe retornar campañas paginadas', async () => {
      const req = mockRequest(5);
      const response = {} as ResponseCampaignsDetailPaginatedDto;

      service.getCampaigns.mockResolvedValue(response);

      const result = await controller.getMisCampañas(req, 2, 20);

      expect(service.getCampaigns).toHaveBeenCalledWith(5, 2, 20);
      expect(result).toBe(response);
    });
  });

  describe('createMiCampaign', () => {
    it('debe crear campaña con imágenes', async () => {
      const req = mockRequest(7);
      const dto = {} as CreateCampaignsDto;

      const files = [
        { filename: 'img1.jpg' },
        { filename: 'img2.jpg' },
      ] as Express.Multer.File[];

      const urls = [
        'http://localhost:3001/resources/campaigns/img1.jpg',
        'http://localhost:3001/resources/campaigns/img2.jpg',
      ];

      const response = {} as ResponseCampaignsDto;

      service.createCampaign.mockResolvedValue(response);

      const result = await controller.createMiCampaign(req, dto, files);

      expect(service.createCampaign).toHaveBeenCalledWith(7, dto, urls);
      expect(result).toBe(response);
    });
  });

  describe('updateMiCampaign', () => {
    it('debe actualizar campaña con imágenes', async () => {
      const req = mockRequest(8);
      const dto = {} as UpdateCampaignsDto;

      const files = [{ filename: 'img.jpg' }] as Express.Multer.File[];

      const urls = ['http://localhost:3001/resources/campaigns/img.jpg'];

      const response = {} as ResponseCampaignsDto;

      service.updateCampaign.mockResolvedValue(response);

      const result = await controller.updateMiCampaign(req, dto, files);

      expect(service.updateCampaign).toHaveBeenCalledWith(8, dto, urls);
      expect(result).toBe(response);
    });

    it('debe actualizar campaña sin imágenes', async () => {
      const req = mockRequest(8);
      const dto = {} as UpdateCampaignsDto;

      const response = {} as ResponseCampaignsDto;

      service.updateCampaign.mockResolvedValue(response);

      const result = await controller.updateMiCampaign(req, dto);

      expect(service.updateCampaign).toHaveBeenCalledWith(8, dto, undefined);
      expect(result).toBe(response);
    });
  });

  describe('getMisDonaciones', () => {
    it('debe retornar donaciones paginadas', async () => {
      const req = mockRequest(3);
      const response = {} as PaginatedOrganizationDonationsResponseDto;

      service.getDonaciones.mockResolvedValue(response);

      const result = await controller.getMisDonaciones(req, 1, 10);

      expect(service.getDonaciones).toHaveBeenCalledWith(3, 1, 10);
      expect(result).toBe(response);
    });
  });

  describe('actualizarEstadoDonación', () => {
    it('debe confirmar donación', async () => {
      const dto = {} as UpdateDonacionEstadoDto;

      service.confirmarDonacion.mockResolvedValue(mockDonationResponse);

      await controller.actualizarEstadoDonación(4, dto);

      expect(service.confirmarDonacion).toHaveBeenCalledWith(4, dto);
    });
  });

  describe('updateMiPerfil', () => {
    it('debe actualizar perfil', async () => {
      const req = mockRequest(6);
      const dto = {} as UpdateOrganizacionDto;

      const response = {} as ResponseOrganizacionDto;

      service.update.mockResolvedValue(response);

      const result = await controller.updateMiPerfil(req, dto);

      expect(service.update).toHaveBeenCalledWith(6, dto);
      expect(result).toBe(response);
    });
  });

  describe('updateMisCredenciales', () => {
    it('debe actualizar credenciales', async () => {
      const req = mockRequest(6, 20);
      const dto = {} as UpdateCredencialesDto;

      service.updateCredenciales.mockResolvedValue();

      await controller.updateMisCredenciales(req, dto);

      expect(service.updateCredenciales).toHaveBeenCalledWith(20, dto);
    });
  });

  describe('findPaginated', () => {
    it('debe retornar listado paginado', async () => {
      const response = {} as ResponseOrganizationPaginatedDto;

      service.findPaginated.mockResolvedValue(response);

      const result = await controller.findPaginated(2, 15, 'search');

      expect(service.findPaginated).toHaveBeenCalledWith(2, 15, 'search');
      expect(result).toBe(response);
    });
  });

  describe('update (admin)', () => {
    it('debe actualizar organización', async () => {
      const dto = {} as UpdateOrganizacionDto;

      const response = {} as ResponseOrganizacionDto;

      service.update.mockResolvedValue(response);

      const result = await controller.update(9, dto);

      expect(service.update).toHaveBeenCalledWith(9, dto);
      expect(result).toBe(response);
    });
  });

  describe('delete', () => {
    it('debe eliminar organización', async () => {
      service.delete.mockResolvedValue();

      await controller.delete(11);

      expect(service.delete).toHaveBeenCalledWith(11);
    });
  });

  describe('restore', () => {
    it('debe restaurar organización', async () => {
      service.restore.mockResolvedValue();

      await controller.restore(12);

      expect(service.restore).toHaveBeenCalledWith(12);
    });
  });
});
