import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { CampaignsController } from '../../src/Modules/campaign/campaign.controller';
import { CampaignsService } from '../../src/Modules/campaign/campaign.service';

import { CampaignEstado } from '../../src/Modules/campaign/enum';
import { ResponseCampaignDetalleDto } from '../../src/Modules/campaign/dto/response_campaignDetalle.dto';

describe('CampaignsController', () => {
  let controller: CampaignsController;
  let service: DeepMockProxy<CampaignsService>;

  beforeEach(async () => {
    service = mockDeep<CampaignsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignsController],
      providers: [
        {
          provide: CampaignsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<CampaignsController>(CampaignsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findPaginated', () => {
    it('debe retornar campañas paginadas', async () => {
      const mockResponse = {
        items: [],
        total: 0,
      };

      service.findPaginated.mockResolvedValue(mockResponse);

      const result = await controller.findPaginated(1, 10, 'ayuda', true);

      expect(service.findPaginated).toHaveBeenCalledWith(1, 10, 'ayuda', true);

      expect(result).toEqual(mockResponse);
    });

    it('debe usar valores por defecto cuando no se envían queries', async () => {
      const mockResponse = {
        items: [],
        total: 0,
      };

      service.findPaginated.mockResolvedValue(mockResponse);

      const result = await controller.findPaginated(
        undefined,
        undefined,
        undefined,
        false,
      );

      expect(service.findPaginated).toHaveBeenCalledWith(1, 10, '', false);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('findOneDetail', () => {
    it('debe retornar el detalle de una campaña', async () => {
      const campaign: ResponseCampaignDetalleDto = {
        id: 1,
        titulo: 'Campaña de Ayuda',
        descripcion: 'Ayuda comunitaria',
        fecha_Inicio: new Date(),
        fecha_Fin: new Date(),
        objetivo: 10000,
        puntos: 100,
        estado: CampaignEstado.ACTIVA,
        fecha_Registro: new Date(),
        imagenPortada: '/img.jpg',
        organizacion: {
          id: 1,
          nombre_organizacion: 'Organización Solidaria',
          verificada: true,
        },
        imagenes: [],
      };

      service.findOneDetail.mockResolvedValue(campaign);

      const result = await controller.findOneDetail(1);

      expect(service.findOneDetail).toHaveBeenCalledWith(1);
      expect(result).toEqual(campaign);
    });

    it('debe propagar errores del servicio', async () => {
      const error = new Error('Campaña no encontrada');

      service.findOneDetail.mockRejectedValue(error);

      await expect(controller.findOneDetail(1)).rejects.toThrow(
        'Campaña no encontrada',
      );
    });
  });

  describe('updateEstado', () => {
    it('debe actualizar el estado de la campaña', async () => {
      service.updateEstado.mockResolvedValue(undefined);

      await controller.updateEstado(1, CampaignEstado.ACTIVA);

      expect(service.updateEstado).toHaveBeenCalledWith(
        1,
        CampaignEstado.ACTIVA,
      );
    });

    it('debe propagar errores del servicio', async () => {
      const error = new Error('Error al actualizar estado');

      service.updateEstado.mockRejectedValue(error);

      await expect(
        controller.updateEstado(1, CampaignEstado.ACTIVA),
      ).rejects.toThrow('Error al actualizar estado');
    });
  });
});
