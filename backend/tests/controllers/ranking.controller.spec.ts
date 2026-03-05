import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { RankingController } from '../../src/Modules/ranking/ranking.controller';
import { RankingService } from '../../src/Modules/ranking/ranking.service';
import { RankingDTO } from '../../src/Modules/ranking/dto/ranking.dto';

describe('RankingController', () => {
  let controller: RankingController;
  let service: DeepMockProxy<RankingService>;

  beforeEach(async () => {
    service = mockDeep<RankingService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RankingController],
      providers: [
        {
          provide: RankingService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<RankingController>(RankingController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTop10', () => {
    it('debe retornar el top 10 de usuarios', async () => {
      const mockResponse: RankingDTO[] = [
        {
          id_usuario: 1,
          puntos: 100,
          nombre: 'Juan',
          apellido: 'Perez',
        },
        {
          id_usuario: 2,
          puntos: 90,
          nombre: 'Maria',
          apellido: 'Gomez',
        },
      ];

      service.getTop10.mockResolvedValue(mockResponse);

      const result = await controller.getTop10();

      expect(service.getTop10).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
    });

    it('debe propagar errores del servicio', async () => {
      const error = new Error('Error obteniendo ranking');

      service.getTop10.mockRejectedValue(error);

      await expect(controller.getTop10()).rejects.toThrow(
        'Error obteniendo ranking',
      );
    });
  });
});
