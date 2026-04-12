import { Test, TestingModule } from '@nestjs/testing';
import { RankingController } from '../../src/Modules/ranking/ranking.controller';
import { RankingService } from '../../src/Modules/ranking/ranking.service';
import { mock } from 'jest-mock-extended';
import { RankingDTO } from '../../src/Modules/ranking/dto/ranking.dto';

describe('RankingController', () => {
  let controller: RankingController;
  let rankingService: jest.Mocked<RankingService>;

  const mockRankingList: RankingDTO[] = [
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
    {
      id_usuario: 3,
      puntos: 80,
      nombre: 'Carlos',
      apellido: 'Lopez',
    },
  ];

  beforeEach(async () => {
    const mockRankingService = mock<RankingService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RankingController],
      providers: [
        {
          provide: RankingService,
          useValue: mockRankingService,
        },
      ],
    }).compile();

    controller = module.get<RankingController>(RankingController);
    rankingService = module.get(RankingService);
  });

  describe('getTop10', () => {
    it('debe retornar el top 10 de usuarios', async () => {
      rankingService.getTop10.mockResolvedValue(mockRankingList);

      const result = await controller.getTop10();

      expect(rankingService.getTop10).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockRankingList);
    });

    it('debe retornar un arreglo vacío cuando no hay usuarios', async () => {
      rankingService.getTop10.mockResolvedValue([]);

      const result = await controller.getTop10();

      expect(result).toEqual([]);
      expect(rankingService.getTop10).toHaveBeenCalledTimes(1);
    });

    it('debe propagar errores del servicio', async () => {
      const error = new Error('Error obteniendo ranking');

      rankingService.getTop10.mockRejectedValue(error);

      await expect(controller.getTop10()).rejects.toThrow(
        'Error obteniendo ranking',
      );
    });
  });
});
