import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsController } from '../../src/Modules/campaign/campaign.controller';
import { CampaignsService } from '../../src/Modules/campaign/campaign.service';
import { mock } from 'jest-mock-extended';
import { CampaignEstado } from '../../src/Modules/campaign/enum';
import { ResponseCampaignDetalleDto } from '../../src/Modules/campaign/dto/response_campaignDetalle.dto';
import { Campaigns } from '../../src/Entities/campaigns.entity';

describe('CampaignsController', () => {
  let controller: CampaignsController;
  let campaignService: jest.Mocked<CampaignsService>;

  const mockCampaignDetail: ResponseCampaignDetalleDto = {
    id: 1,
    titulo: 'Campaña Solidaria Invierno 2025',
    descripcion: 'Campaña destinada a la recolección de ropa de abrigo',
    estado: CampaignEstado.ACTIVA,
    fecha_Inicio: new Date('2025-06-01'),
    fecha_Fin: new Date('2025-08-31'),
    fecha_Registro: new Date('2025-05-15'),
    objetivo: 500000,
    puntos: 75,
    imagenPortada: null,
    organizacion: {
      id: 3,
      nombre_organizacion: 'Fundación Ayudar',
      verificada: true,
    },
    creado_por: {
      id: 5,
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@email.com',
    },
    actualizado_por: {
      id: 5,
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@email.com',
    },
    ultimo_cambio: new Date('2025-05-15T10:30:00.000Z'),
    imagenes: [
      {
        id: 1,
        nombre: 'imagen1',
        url: '/uploads/imagen1.jpg',
      },
      {
        id: 2,
        nombre: 'imagen2',
        url: '/uploads/imagen2.jpg',
      },
    ],
  };

  const mockCampaignsEntity: Campaigns = {
    id: 1,
    titulo: 'Campaña Solidaria Invierno 2025',
    descripcion: 'Campaña destinada a la recolección de ropa de abrigo',
    estado: CampaignEstado.PENDIENTE,
    fecha_Inicio: new Date('2025-06-01'),
    fecha_Fin: new Date('2025-08-31'),
    fecha_Registro: new Date('2025-05-15'),
    objetivo: 500000,
    puntos: 75,
    ultimo_cambio: new Date('2025-05-15T10:30:00.000Z'),
  } as Campaigns;

  beforeEach(async () => {
    const mockCampaignService = mock<CampaignsService>();

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
    campaignService = module.get(CampaignsService);
  });

  describe('findPaginated', () => {
    it('debe obtener campañas paginadas con valores por defecto', async () => {
      const expectedResponse: {
        items: ResponseCampaignDetalleDto[];
        total: number;
      } = {
        items: [mockCampaignDetail],
        total: 1,
      };

      campaignService.findPaginated.mockResolvedValue(expectedResponse);

      const result = await controller.findPaginated(1, 10, '', true);

      expect(result).toEqual(expectedResponse);
      expect(campaignService.findPaginated).toHaveBeenCalledWith(
        1,
        10,
        '',
        true,
      );
      expect(campaignService.findPaginated).toHaveBeenCalledTimes(1);
    });

    it('debe obtener campañas paginadas con parámetros personalizados', async () => {
      const expectedResponse: {
        items: ResponseCampaignDetalleDto[];
        total: number;
      } = {
        items: [mockCampaignDetail],
        total: 3,
      };

      campaignService.findPaginated.mockResolvedValue(expectedResponse);

      const result = await controller.findPaginated(2, 20, 'navidad', false);

      expect(result).toEqual(expectedResponse);
      expect(campaignService.findPaginated).toHaveBeenCalledWith(
        2,
        20,
        'navidad',
        false,
      );
    });

    it('debe manejar búsqueda vacía', async () => {
      const expectedResponse: {
        items: ResponseCampaignDetalleDto[];
        total: number;
      } = {
        items: [],
        total: 0,
      };

      campaignService.findPaginated.mockResolvedValue(expectedResponse);

      const result = await controller.findPaginated(1, 10, '', true);

      expect(result).toEqual(expectedResponse);
      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('debe manejar onlyEnabled como false', async () => {
      const expectedResponse: {
        items: ResponseCampaignDetalleDto[];
        total: number;
      } = {
        items: [mockCampaignDetail],
        total: 1,
      };

      campaignService.findPaginated.mockResolvedValue(expectedResponse);

      const result = await controller.findPaginated(1, 10, 'test', false);

      expect(result).toEqual(expectedResponse);
      expect(campaignService.findPaginated).toHaveBeenCalledWith(
        1,
        10,
        'test',
        false,
      );
    });

    it('debe manejar error del servicio', async () => {
      const error = new Error('Error al obtener campañas');

      campaignService.findPaginated.mockRejectedValue(error);

      await expect(controller.findPaginated(1, 10, '', true)).rejects.toThrow(
        'Error al obtener campañas',
      );
    });
  });

  describe('findOneDetail', () => {
    it('debe obtener detalle de campaña por ID exitosamente', async () => {
      const id = 1;

      campaignService.findOneDetail.mockResolvedValue(mockCampaignDetail);

      const result = await controller.findOneDetail(id);

      expect(result).toEqual(mockCampaignDetail);
      expect(campaignService.findOneDetail).toHaveBeenCalledWith(1);
      expect(campaignService.findOneDetail).toHaveBeenCalledTimes(1);
    });

    it('debe manejar error cuando la campaña no existe', async () => {
      const id = 999;
      const error = new Error('Campaña no encontrada');

      campaignService.findOneDetail.mockRejectedValue(error);

      await expect(controller.findOneDetail(id)).rejects.toThrow(
        'Campaña no encontrada',
      );
    });
  });

  describe('updateEstado', () => {
    it('debe actualizar el estado de la campaña a ACTIVA exitosamente', async () => {
      const id = 1;
      const estado = CampaignEstado.ACTIVA;
      const expectedResponse: Campaigns = {
        ...mockCampaignsEntity,
        estado: CampaignEstado.ACTIVA,
      };

      campaignService.updateEstado.mockResolvedValue(expectedResponse);

      const result = await controller.updateEstado(id, estado);

      expect(result).toEqual(expectedResponse);
      expect(result.estado).toBe(CampaignEstado.ACTIVA);
      expect(campaignService.updateEstado).toHaveBeenCalledWith(1, estado);
      expect(campaignService.updateEstado).toHaveBeenCalledTimes(1);
    });

    it('debe actualizar el estado de la campaña a PENDIENTE', async () => {
      const id = 2;
      const estado = CampaignEstado.PENDIENTE;
      const expectedResponse: Campaigns = {
        ...mockCampaignsEntity,
        id: 2,
        estado: CampaignEstado.PENDIENTE,
      };

      campaignService.updateEstado.mockResolvedValue(expectedResponse);

      const result = await controller.updateEstado(id, estado);

      expect(result).toEqual(expectedResponse);
      expect(result.estado).toBe(CampaignEstado.PENDIENTE);
      expect(campaignService.updateEstado).toHaveBeenCalledWith(2, estado);
    });

    it('debe actualizar el estado de la campaña a FINALIZADA', async () => {
      const id = 3;
      const estado = CampaignEstado.FINALIZADA;
      const expectedResponse: Campaigns = {
        ...mockCampaignsEntity,
        id: 3,
        estado: CampaignEstado.FINALIZADA,
      };

      campaignService.updateEstado.mockResolvedValue(expectedResponse);

      const result = await controller.updateEstado(id, estado);

      expect(result).toEqual(expectedResponse);
      expect(result.estado).toBe(CampaignEstado.FINALIZADA);
      expect(campaignService.updateEstado).toHaveBeenCalledWith(3, estado);
    });

    it('debe actualizar el estado de la campaña a RECHAZADA', async () => {
      const id = 4;
      const estado = CampaignEstado.RECHAZADA;
      const expectedResponse: Campaigns = {
        ...mockCampaignsEntity,
        id: 4,
        estado: CampaignEstado.RECHAZADA,
      };

      campaignService.updateEstado.mockResolvedValue(expectedResponse);

      const result = await controller.updateEstado(id, estado);

      expect(result).toEqual(expectedResponse);
      expect(result.estado).toBe(CampaignEstado.RECHAZADA);
      expect(campaignService.updateEstado).toHaveBeenCalledWith(4, estado);
    });

    it('debe manejar error cuando la campaña no existe', async () => {
      const id = 999;
      const estado = CampaignEstado.ACTIVA;
      const error = new Error('Campaña no encontrada');

      campaignService.updateEstado.mockRejectedValue(error);

      await expect(controller.updateEstado(id, estado)).rejects.toThrow(
        'Campaña no encontrada',
      );
    });

    it('debe manejar error cuando el estado es inválido', async () => {
      const id = 1;
      const estado = 'ESTADO_INVALIDO' as CampaignEstado;
      const error = new Error('Estado inválido');

      campaignService.updateEstado.mockRejectedValue(error);

      await expect(controller.updateEstado(id, estado)).rejects.toThrow(
        'Estado inválido',
      );
    });
  });
});
