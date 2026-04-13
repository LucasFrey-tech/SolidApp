import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { mock } from 'jest-mock-extended';
import { RankingService } from '../../src/Modules/ranking/ranking.service';
import { RankingDonador } from '../../src/Entities/ranking.entity';
import { ErrorManager } from '../../src/common/errors/error.manager';

const mockUsuario = {
  id: 1,
  nombre: 'Juan',
  apellido: 'Pérez',
};

const mockRankingDonador: RankingDonador = {
  id_usuario: 1,
  puntos: 1500,
  usuario: mockUsuario,
} as RankingDonador;

describe('RankingService', () => {
  let service: RankingService;
  let puntosRepository: jest.Mocked<Repository<RankingDonador>>;
  let mockEntityManager: jest.Mocked<EntityManager>;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const mockRepository = mock<Repository<RankingDonador>>();
    mockEntityManager = mock<EntityManager>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RankingService,
        {
          provide: getRepositoryToken(RankingDonador),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<RankingService>(RankingService);
    puntosRepository = module.get(getRepositoryToken(RankingDonador));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTop10', () => {
    it('debe obtener el top 10 de usuarios con mayor puntaje', async () => {
      const mockRankingList = [mockRankingDonador];
      const expectedResponse = [
        {
          id_usuario: 1,
          puntos: 1500,
          nombre: 'Juan',
          apellido: 'Pérez',
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockRankingList);
      puntosRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      const result = await service.getTop10();

      expect(result).toEqual(expectedResponse);
      expect(puntosRepository.createQueryBuilder).toHaveBeenCalledWith(
        'ranking',
      );
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'ranking.usuario',
        'perfil_usuario',
      );
      expect(mockQueryBuilder.select).toHaveBeenCalledWith([
        'ranking.id_usuario',
        'ranking.puntos',
        'perfil_usuario.nombre',
        'perfil_usuario.apellido',
      ]);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'ranking.puntos',
        'DESC',
      );
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.getMany).toHaveBeenCalledTimes(1);
    });

    it('debe retornar un arreglo vacío cuando no hay usuarios en el ranking', async () => {
      mockQueryBuilder.getMany.mockResolvedValue([]);
      puntosRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      const result = await service.getTop10();

      expect(result).toEqual([]);
    });

    it('debe manejar error cuando falla la consulta a la base de datos', async () => {
      const error = new Error('Error de conexión a la base de datos');
      mockQueryBuilder.getMany.mockRejectedValue(error);
      puntosRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);

      await expect(service.getTop10()).rejects.toThrow(
        'Error de conexión a la base de datos',
      );
    });
  });

  describe('ajustarPuntos', () => {
    const userID = 1;
    const puntos = 100;
    const mockRepo = mock<Repository<RankingDonador>>();

    beforeEach(() => {
      mockEntityManager.getRepository = jest.fn().mockReturnValue(mockRepo);
    });

    it('debe crear un nuevo registro cuando el usuario no existe en el ranking', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.save.mockResolvedValue({
        id_usuario: userID,
        puntos,
      } as RankingDonador);

      await service.ajustarPuntos(userID, puntos, mockEntityManager);

      expect(mockEntityManager.getRepository).toHaveBeenCalledWith(
        RankingDonador,
      );
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id_usuario: userID },
      });
      expect(mockRepo.save).toHaveBeenCalledWith({
        id_usuario: userID,
        puntos,
      });
      expect(mockRepo.increment).not.toHaveBeenCalled();
    });

    it('debe incrementar los puntos cuando el usuario ya existe en el ranking', async () => {
      mockRepo.findOne.mockResolvedValue(mockRankingDonador);
      mockRepo.increment.mockResolvedValue({ affected: 1 } as any);

      await service.ajustarPuntos(userID, puntos, mockEntityManager);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id_usuario: userID },
      });
      expect(mockRepo.increment).toHaveBeenCalledWith(
        { id_usuario: userID },
        'puntos',
        puntos,
      );
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('debe lanzar ErrorManager cuando los puntos son menores o iguales a 0', async () => {
      try {
        await service.ajustarPuntos(userID, 0, mockEntityManager);
        fail('Debería haber lanzado un error');
      } catch (error) {
        expect(error).toBeInstanceOf(ErrorManager);
        expect(error.message).toContain('BAD_REQUEST');
        expect(error.message).toContain(
          'Los puntos a sumar deben ser mayores a 0',
        );
      }
    });

    it('debe manejar error cuando findOne falla', async () => {
      const error = new Error('Error de base de datos');
      mockRepo.findOne.mockRejectedValue(error);

      await expect(
        service.ajustarPuntos(userID, puntos, mockEntityManager),
      ).rejects.toThrow('Error de base de datos');
    });

    it('debe manejar error cuando save falla', async () => {
      const error = new Error('Error al guardar');
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.save.mockRejectedValue(error);

      await expect(
        service.ajustarPuntos(userID, puntos, mockEntityManager),
      ).rejects.toThrow('Error al guardar');
    });

    it('debe manejar error cuando increment falla', async () => {
      const error = new Error('Error al incrementar');
      mockRepo.findOne.mockResolvedValue(mockRankingDonador);
      mockRepo.increment.mockRejectedValue(error);

      await expect(
        service.ajustarPuntos(userID, puntos, mockEntityManager),
      ).rejects.toThrow('Error al incrementar');
    });
  });
});
