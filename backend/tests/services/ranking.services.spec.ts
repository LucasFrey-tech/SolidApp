import { Test, TestingModule } from '@nestjs/testing';
import { RankingService } from '../../src/Modules/ranking/ranking.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { RankingDonador } from '../../src/Entities/ranking.entity';
import { RankingDTO } from '../../src/Modules/ranking/dto/ranking.dto';

describe('RankingService', () => {
  let service: RankingService;
  let repository: jest.Mocked<Repository<RankingDonador>>;

  const mockRepository = {
    createQueryBuilder: jest.fn(),
    findOne: jest.fn(),
  } as unknown as jest.Mocked<Repository<RankingDonador>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingService,
        {
          provide: getRepositoryToken(RankingDonador),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get(RankingService);
    repository = module.get(getRepositoryToken(RankingDonador));
    jest.clearAllMocks();
  });

  describe('getTop10', () => {
    it('debe retornar los 10 usuarios ordenados', async () => {
      const mockRanking: RankingDonador[] = [
        {
          id_usuario: 1,
          puntos: 100,
          usuario: {
            nombre: 'Juan',
            apellido: 'Perez',
          },
        },
      ] as RankingDonador[];

      const mockQB = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockRanking),
      };

      repository.createQueryBuilder.mockReturnValue(mockQB as never);

      const result = await service.getTop10();

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('ranking');
      expect(mockQB.leftJoinAndSelect).toHaveBeenCalledWith(
        'ranking.usuario',
        'perfil_usuario',
      );
      expect(mockQB.orderBy).toHaveBeenCalledWith('ranking.puntos', 'DESC');
      expect(mockQB.take).toHaveBeenCalledWith(10);

      const expected: RankingDTO[] = [
        {
          id_usuario: 1,
          puntos: 100,
          nombre: 'Juan',
          apellido: 'Perez',
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('ajustarPuntos', () => {
    let manager: jest.Mocked<EntityManager>;
    let transactionalRepo: {
      save: jest.Mock;
      increment: jest.Mock;
    };

    beforeEach(() => {
      transactionalRepo = {
        save: jest.fn(),
        increment: jest.fn(),
      };

      manager = {
        getRepository: jest.fn().mockReturnValue(transactionalRepo),
      } as unknown as jest.Mocked<EntityManager>;
    });

    it('debe crear registro si no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await service.ajustarPuntos(1, 50, manager);

      expect(transactionalRepo.save).toHaveBeenCalledWith({
        id_usuario: 1,
        puntos: 50,
      });
    });

    it('debe incrementar puntos si existe', async () => {
      repository.findOne.mockResolvedValue({
        id_usuario: 1,
        puntos: 100,
      } as RankingDonador);

      await service.ajustarPuntos(1, 50, manager);

      expect(transactionalRepo.increment).toHaveBeenCalledWith(
        { id_usuario: 1 },
        'puntos',
        50,
      );
    });

    it('debe lanzar error si queda en negativo', async () => {
      repository.findOne.mockResolvedValue({
        id_usuario: 1,
        puntos: 10,
      } as RankingDonador);

      await expect(service.ajustarPuntos(1, -20, manager)).rejects.toThrow(
        'No se puede dejar el ranking en negativo',
      );

      expect(transactionalRepo.increment).not.toHaveBeenCalled();
    });
  });
});
