import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsController } from '../../src/Modules/campaign/campaign.controller';
import { CampaignsService } from '../../src/Modules/campaign/campaign.service';
import { ResponseCampaignDetalleDto } from '../../src/Modules/campaign/dto/response_campaignDetalle.dto';
import { CampaignImagenDTO } from '../../src/Modules/campaign/dto/lista_campaign_imagen.dto';
import { CampaignEstado } from '../../src/Modules/campaign/enum';

describe('CampaignsController', () => {
  let controller: CampaignsController;
  let mockCampaignService: {
    findOneDetail: jest.Mock<Promise<ResponseCampaignDetalleDto>, [number]>;
    updateEstado: jest.Mock<Promise<void>, [number, CampaignEstado]>;
  };

  let campaignImage: CampaignImagenDTO;
  let responseCampaignDetalleDto: ResponseCampaignDetalleDto;

  beforeEach(async () => {
    mockCampaignService = {
      findOneDetail: jest.fn(),
      updateEstado: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignsController],
      providers: [
        {
          provide: CampaignsService,
          useValue: mockCampaignService,
        },
      ],
    }).compile();

    controller = module.get<CampaignsController>(CampaignsController);

    // ========== Campaign Image ==========
    campaignImage = {
      id: 1,
      nombre: 'campaign1',
      url: '/images/campaign1.jpg',
    };

    // ========== Response DTO ==========
    responseCampaignDetalleDto = {
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
      imagenes: [campaignImage],
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ========== TESTS DE FIND ONE DETAIL ==========
  describe('findOneDetail', () => {
    it('debe retornar una campaña específica con detalles', async () => {
      mockCampaignService.findOneDetail.mockResolvedValue(
        responseCampaignDetalleDto,
      );

      const resultado = await controller.findOneDetail(1);

      expect(resultado).toEqual(responseCampaignDetalleDto);
      expect(mockCampaignService.findOneDetail).toHaveBeenCalledWith(1);
    });

    it('debe propagar excepciones del servicio', async () => {
      const error = new Error('Campaña no encontrada');
      mockCampaignService.findOneDetail.mockRejectedValue(error);

      await expect(controller.findOneDetail(999)).rejects.toThrow(
        'Campaña no encontrada',
      );
    });
  });

  // ========== TESTS DE UPDATE ESTADO ==========
  describe('updateEstado', () => {
    it('debe actualizar el estado de una campaña', async () => {
      mockCampaignService.updateEstado.mockResolvedValue(undefined);

      await controller.updateEstado(1, CampaignEstado.ACTIVA);

      expect(mockCampaignService.updateEstado).toHaveBeenCalledWith(
        1,
        CampaignEstado.ACTIVA,
      );
    });

    it('debe aceptar diferentes estados', async () => {
      mockCampaignService.updateEstado.mockResolvedValue(undefined);

      await controller.updateEstado(1, CampaignEstado.FINALIZADA);

      expect(mockCampaignService.updateEstado).toHaveBeenCalledWith(
        1,
        CampaignEstado.FINALIZADA,
      );
    });

    it('debe propagar excepciones del servicio', async () => {
      const error = new Error('Campaña no encontrada');
      mockCampaignService.updateEstado.mockRejectedValue(error);

      await expect(
        controller.updateEstado(999, CampaignEstado.ACTIVA),
      ).rejects.toThrow('Campaña no encontrada');
    });
  });
});
