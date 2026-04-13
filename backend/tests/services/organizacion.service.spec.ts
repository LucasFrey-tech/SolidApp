import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { mock } from 'jest-mock-extended';
import { OrganizacionService } from '../../src/Modules/organizacion/organizacion.service';
import { CampaignsService } from '../../src/Modules/campaign/campaign.service';
import { DonacionService } from '../../src/Modules/donation/donacion.service';
import { HashService } from '../../src/common/bcryptService/hashService';
import { InvitacionesService } from '../../src/Modules/invitaciones/invitacion.service';
import { Organizacion } from '../../src/Entities/organizacion.entity';
import { OrganizacionUsuario } from '../../src/Entities/organizacion_usuario.entity';
import { Usuario } from '../../src/Entities/usuario.entity';
import { Contacto } from '../../src/Entities/contacto.entity';
import { Direccion } from '../../src/Entities/direccion.entity';
import { CreateOrganizacionDto } from '../../src/Modules/organizacion/dto/create_organizacion.dto';
import { UpdateOrganizacionDto } from '../../src/Modules/organizacion/dto/update_organizacion.dto';
import { ResponseOrganizacionDto } from '../../src/Modules/organizacion/dto/response_organizacion.dto';
import { CreateCampaignsDto } from '../../src/Modules/campaign/dto/create_campaigns.dto';
import { UpdateCampaignsDto } from '../../src/Modules/campaign/dto/update_campaigns.dto';
import { UpdateDonacionEstadoDto } from '../../src/Modules/donation/dto/update_donation_estado.dto';
import { DonacionEstado } from '../../src/Modules/donation/enum';
import { Rol, RolSecundario } from '../../src/Modules/user/enums/enums';

const mockContacto = Object.assign(new Contacto(), {
  id: 1,
  correo: 'organizacion@test.com',
  prefijo: '11',
  telefono: '12345678',
});

const mockContactoUsuario = Object.assign(new Contacto(), {
  id: 2,
  correo: 'usuario@test.com',
  prefijo: '11',
  telefono: '87654321',
});

const mockDireccion = Object.assign(new Direccion(), {
  id: 1,
  calle: 'Av. Test',
  numero: '123',
  ciudad: 'Ciudad Test',
  provincia: 'Provincia Test',
  codigo_postal: '1234',
});

const mockUsuario = Object.assign(new Usuario(), {
  id: 1,
  nombre: 'Juan',
  apellido: 'Pérez',
  documento: '12345678',
  clave: 'hashed_password',
  rol: Rol.COLABORADOR,
  contacto: mockContactoUsuario,
  habilitado: true,
});

const mockOrganizacion = Object.assign(new Organizacion(), {
  id: 1,
  cuit: '30-12345678-9',
  razon_social: 'Organización Test S.A.',
  nombre_organizacion: 'Test Organización',
  descripcion: 'Descripción de la organización',
  web: 'https://test.com',
  verificada: false,
  habilitada: true,
  contacto: mockContacto,
  direccion: mockDireccion,
  creado_por: mockUsuario,
  actualizado_por: mockUsuario,
  fecha_registro: new Date(),
  ultimo_cambio: new Date(),
});

const mockOrganizacionUsuario = Object.assign(new OrganizacionUsuario(), {
  id: 1,
  id_usuario: 1,
  id_organizacion: 1,
  rol: RolSecundario.GESTOR,
  activo: true,
  usuario: mockUsuario,
  organizacion: mockOrganizacion,
  fecha_asignacion: new Date(),
});

const mockResponseDto: ResponseOrganizacionDto = {
  id: 1,
  cuit: '30-12345678-9',
  razon_social: 'Organización Test S.A.',
  nombre_organizacion: 'Test Organización',
  descripcion: 'Descripción de la organización',
  web: 'https://test.com',
  verificada: false,
  habilitada: true,
  fecha_registro: mockOrganizacion.fecha_registro,
  ultimo_cambio: mockOrganizacion.ultimo_cambio,
  contacto: {
    id: mockContacto.id,
    correo: mockContacto.correo,
    telefono: mockContacto.telefono,
    prefijo: mockContacto.prefijo,
  },
  direccion: {
    id: mockDireccion.id,
    calle: mockDireccion.calle,
    numero: mockDireccion.numero,
    provincia: mockDireccion.provincia,
    ciudad: mockDireccion.ciudad,
    codigo_postal: mockDireccion.codigo_postal,
  },
};

describe('OrganizacionService', () => {
  let service: OrganizacionService;
  let organizacionRepository: jest.Mocked<Repository<Organizacion>>;
  let organizacionUsuarioRepository: jest.Mocked<
    Repository<OrganizacionUsuario>
  >;
  let campaignService: jest.Mocked<CampaignsService>;
  let donacionService: jest.Mocked<DonacionService>;
  let hashService: jest.Mocked<HashService>;
  let dataSource: jest.Mocked<DataSource>;
  let invitacionesService: jest.Mocked<InvitacionesService>;

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const mockOrganizacionRepo = mock<Repository<Organizacion>>();
    const mockOrganizacionUsuarioRepo = mock<Repository<OrganizacionUsuario>>();
    const mockCampaignService = mock<CampaignsService>();
    const mockDonacionService = mock<DonacionService>();
    const mockHashService = mock<HashService>();
    const mockDataSource = mock<DataSource>();
    const mockInvitacionesService = mock<InvitacionesService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizacionService,
        {
          provide: getRepositoryToken(Organizacion),
          useValue: mockOrganizacionRepo,
        },
        {
          provide: getRepositoryToken(OrganizacionUsuario),
          useValue: mockOrganizacionUsuarioRepo,
        },
        { provide: CampaignsService, useValue: mockCampaignService },
        { provide: DonacionService, useValue: mockDonacionService },
        { provide: HashService, useValue: mockHashService },
        { provide: DataSource, useValue: mockDataSource },
        { provide: InvitacionesService, useValue: mockInvitacionesService },
      ],
    }).compile();

    service = module.get<OrganizacionService>(OrganizacionService);
    organizacionRepository = module.get(getRepositoryToken(Organizacion));
    organizacionUsuarioRepository = module.get(
      getRepositoryToken(OrganizacionUsuario),
    );
    campaignService = module.get(CampaignsService);
    donacionService = module.get(DonacionService);
    hashService = module.get(HashService);
    dataSource = module.get(DataSource);
    invitacionesService = module.get(InvitacionesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findPaginated', () => {
    beforeEach(() => {
      organizacionRepository.createQueryBuilder = jest
        .fn()
        .mockReturnValue(mockQueryBuilder);
    });

    it('debe obtener organizaciones paginadas sin búsqueda', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([
        [mockOrganizacion],
        1,
      ]);

      const result = await service.findPaginated(1, 10, '');

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('debe obtener organizaciones paginadas con búsqueda', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findPaginated(1, 10, 'test');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      mockQueryBuilder.getManyAndCount.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(service.findPaginated(1, 10, '')).rejects.toThrow(
        'Error desconocido',
      );
    });
  });

  describe('getOrganizacionByUsuario', () => {
    const usuarioId = 1;

    it('debe obtener la organización del usuario', async () => {
      organizacionUsuarioRepository.findOne.mockResolvedValue(
        mockOrganizacionUsuario,
      );

      const result = await service.getOrganizacionByUsuario(usuarioId);

      expect(result.id).toBe(1);
      expect(organizacionUsuarioRepository.findOne).toHaveBeenCalledWith({
        where: { id_usuario: usuarioId, activo: true },
        relations: [
          'organizacion',
          'organizacion.contacto',
          'organizacion.direccion',
        ],
      });
    });

    it('debe lanzar error cuando el usuario no gestiona ninguna organización', async () => {
      organizacionUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.getOrganizacionByUsuario(usuarioId)).rejects.toThrow(
        'El usuario no gestiona ninguna organizacion',
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      organizacionUsuarioRepository.findOne.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(service.getOrganizacionByUsuario(usuarioId)).rejects.toThrow(
        'Error desconocido',
      );
    });
  });

  describe('findById', () => {
    const id = 1;

    it('debe encontrar una organización por ID', async () => {
      organizacionRepository.findOne.mockResolvedValue(mockOrganizacion);

      const result = await service.findById(id);

      expect(result.id).toBe(1);
    });

    it('debe lanzar error cuando la organización no existe', async () => {
      organizacionRepository.findOne.mockResolvedValue(null);

      await expect(service.findById(id)).rejects.toThrow(
        `Organización ${id} no encontrada`,
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      organizacionRepository.findOne.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(service.findById(id)).rejects.toThrow('Error desconocido');
    });
  });

  describe('getCampaigns', () => {
    const id = 1;
    const mockResponse = { items: [], total: 0 };

    it('debe obtener las campañas de la organización', async () => {
      campaignService.findCampaignsPaginated.mockResolvedValue(mockResponse);

      const result = await service.getCampaigns(id, 1, 10);

      expect(result).toEqual(mockResponse);
      expect(campaignService.findCampaignsPaginated).toHaveBeenCalledWith(
        id,
        1,
        10,
      );
    });
  });

  describe('getDonaciones', () => {
    const id = 1;
    const mockResponse = { items: [], total: 0 };

    it('debe obtener las donaciones de la organización', async () => {
      donacionService.findAllPaginatedByOrganizacion.mockResolvedValue(
        mockResponse,
      );

      const result = await service.getDonaciones(id, 1, 10);

      expect(result).toEqual(mockResponse);
      expect(
        donacionService.findAllPaginatedByOrganizacion,
      ).toHaveBeenCalledWith(id, 1, 10, undefined);
    });
  });

  describe('confirmarDonacion', () => {
    const id = 1;
    const gestorId = 1;
    const dto: UpdateDonacionEstadoDto = { estado: DonacionEstado.APROBADA };
    const mockResponse = { id: 1, estado: DonacionEstado.APROBADA };

    it('debe confirmar una donación', async () => {
      donacionService.confirmarDonacion.mockResolvedValue(mockResponse as any);

      const result = await service.confirmarDonacion(id, dto, gestorId);

      expect(result).toEqual(mockResponse);
      expect(donacionService.confirmarDonacion).toHaveBeenCalledWith(
        id,
        dto,
        gestorId,
      );
    });
  });

  describe('createCampaign', () => {
    const id = 1;
    const usuarioId = 1;
    const createDto: CreateCampaignsDto = {
      titulo: 'Campaña Test',
      descripcion: 'Descripción',
      fecha_Inicio: new Date(),
      fecha_Fin: new Date(),
      objetivo: 100000,
      puntos: 50,
    };
    const imagenes = ['img1.jpg'];
    const mockResponse = { id: 1, titulo: 'Campaña Test' };

    it('debe crear una campaña', async () => {
      campaignService.create.mockResolvedValue(mockResponse as any);

      const result = await service.createCampaign(
        id,
        createDto,
        imagenes,
        usuarioId,
      );

      expect(result).toEqual(mockResponse);
      expect(campaignService.create).toHaveBeenCalledWith(
        id,
        createDto,
        imagenes,
        usuarioId,
      );
    });
  });

  describe('updateCampaign', () => {
    const id = 1;
    const campaignId = 1;
    const usuarioId = 1;
    const updateDto: UpdateCampaignsDto = { titulo: 'Nuevo título' };
    const mockResponse = { id: 1, titulo: 'Nuevo título' };

    it('debe actualizar una campaña', async () => {
      campaignService.update.mockResolvedValue(mockResponse as any);

      const result = await service.updateCampaign(
        id,
        campaignId,
        updateDto,
        usuarioId,
      );

      expect(result).toEqual(mockResponse);
      expect(campaignService.update).toHaveBeenCalledWith(
        id,
        campaignId,
        updateDto,
        usuarioId,
        undefined,
      );
    });
  });

  describe('registrarOrganizacion', () => {
    const createDto: CreateOrganizacionDto = {
      nombre: 'Juan',
      apellido: 'Pérez',
      documento: '12345678',
      correo: 'juan@test.com',
      clave: 'Password123',
      prefijo: '11',
      telefono: '12345678',
      correo_organizacion: 'organizacion@test.com',
      cuit_organizacion: '30123456789',
      razon_social: 'Organización Test S.A.',
      nombre_organizacion: 'Test Organización',
      calle: 'Av. Test',
      numero: '123',
    };

    const mockEntityManager = {
      getRepository: jest.fn(),
    };

    const mockUsuarioRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockOrganizacionRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockOrgUsuarioRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockContactoRepo = {
      find: jest.fn(),
    };

    beforeEach(() => {
      mockEntityManager.getRepository.mockImplementation((entity) => {
        if (entity === Usuario) return mockUsuarioRepo;
        if (entity === Organizacion) return mockOrganizacionRepo;
        if (entity === OrganizacionUsuario) return mockOrgUsuarioRepo;
        if (entity === Contacto) return mockContactoRepo;
        return null;
      });

      dataSource.transaction = jest
        .fn()
        .mockImplementation(async (callback) => {
          return callback(mockEntityManager);
        });
      hashService.hash.mockResolvedValue('hashed_password');

      mockUsuarioRepo.findOne.mockResolvedValue(null);
      mockOrganizacionRepo.findOne.mockResolvedValue(null);
      mockContactoRepo.find.mockResolvedValue([]);
      mockUsuarioRepo.create.mockReturnValue(mockUsuario);
      mockUsuarioRepo.save.mockResolvedValue(mockUsuario);
      mockOrganizacionRepo.create.mockReturnValue(mockOrganizacion);
      mockOrganizacionRepo.save.mockResolvedValue(mockOrganizacion);
      mockOrgUsuarioRepo.create.mockReturnValue(mockOrganizacionUsuario);
      mockOrgUsuarioRepo.save.mockResolvedValue(mockOrganizacionUsuario);
    });

    it('debe registrar una organización exitosamente', async () => {
      const result = await service.registrarOrganizacion(createDto);

      expect(result.id).toBe(1);
      expect(hashService.hash).toHaveBeenCalledWith('Password123');
    });

    it('debe lanzar error cuando el CUIT ya existe', async () => {
      mockOrganizacionRepo.findOne.mockResolvedValueOnce(mockOrganizacion);

      await expect(service.registrarOrganizacion(createDto)).rejects.toThrow(
        'Ya existe una organización con ese CUIT',
      );
    });

    it('debe lanzar error cuando el documento ya existe', async () => {
      mockUsuarioRepo.findOne.mockResolvedValueOnce(mockUsuario);

      await expect(service.registrarOrganizacion(createDto)).rejects.toThrow(
        'Ya existe un usuario con ese documento',
      );
    });

    it('debe lanzar error cuando el correo del usuario ya existe', async () => {
      const mockEntityManager = {
        getRepository: jest.fn((entity) => {
          if (entity === Organizacion) {
            return {
              findOne: jest.fn().mockResolvedValue(null),
              create: jest.fn(),
              save: jest.fn(),
            };
          }
          if (entity === Usuario) {
            return {
              findOne: jest.fn().mockResolvedValue(null),
              create: jest.fn(),
              save: jest.fn(),
            };
          }
          if (entity === Contacto) {
            return {
              find: jest.fn().mockResolvedValue([{ correo: 'juan@test.com' }]),
            };
          }
          return null;
        }),
      };

      dataSource.transaction = jest
        .fn()
        .mockImplementation(async (callback) => {
          return callback(mockEntityManager);
        });
      hashService.hash.mockResolvedValue('hashed_password');

      await expect(service.registrarOrganizacion(createDto)).rejects.toThrow(
        'Ya existe un usuario con ese correo',
      );
    });

    it('debe lanzar error cuando el correo de la organización ya existe', async () => {
      const mockEntityManager = {
        getRepository: jest.fn((entity) => {
          if (entity === Organizacion) {
            return {
              findOne: jest.fn().mockResolvedValue(null),
              create: jest.fn(),
              save: jest.fn(),
            };
          }
          if (entity === Usuario) {
            return {
              findOne: jest.fn().mockResolvedValue(null),
              create: jest.fn(),
              save: jest.fn(),
            };
          }
          if (entity === Contacto) {
            return {
              find: jest
                .fn()
                .mockResolvedValue([{ correo: 'organizacion@test.com' }]),
            };
          }
          return null;
        }),
      };

      dataSource.transaction = jest
        .fn()
        .mockImplementation(async (callback) => {
          return callback(mockEntityManager);
        });
      hashService.hash.mockResolvedValue('hashed_password');

      await expect(service.registrarOrganizacion(createDto)).rejects.toThrow(
        'Ya existe una organización con ese correo',
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      dataSource.transaction = jest
        .fn()
        .mockRejectedValue('Error string inesperado');

      await expect(service.registrarOrganizacion(createDto)).rejects.toThrow(
        'Error desconocido',
      );
    });
  });

  describe('update', () => {
    const usuarioId = 1;
    const updateDto: UpdateOrganizacionDto = {
      descripcion: 'Nueva descripción',
      web: 'https://nueva-web.com',
    };

    beforeEach(() => {
      organizacionUsuarioRepository.findOne.mockResolvedValue(
        mockOrganizacionUsuario,
      );
      organizacionRepository.preload = jest
        .fn()
        .mockResolvedValue(mockOrganizacion);
      organizacionRepository.save.mockResolvedValue(mockOrganizacion);
    });

    it('debe actualizar una organización exitosamente', async () => {
      const result = await service.update(updateDto, usuarioId);

      expect(result.id).toBe(1);
      expect(organizacionRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar error cuando el usuario no gestiona ninguna organización', async () => {
      organizacionUsuarioRepository.findOne.mockResolvedValue(null);

      await expect(service.update(updateDto, usuarioId)).rejects.toThrow(
        'El usuario no gestiona ninguna organización',
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      organizacionUsuarioRepository.findOne.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(service.update(updateDto, usuarioId)).rejects.toThrow(
        'Error desconocido',
      );
    });

    it('debe lanzar error cuando la organización no se encuentra para preload', async () => {
      organizacionUsuarioRepository.findOne.mockResolvedValue(
        mockOrganizacionUsuario,
      );
      organizacionRepository.preload = jest.fn().mockResolvedValue(null);

      await expect(service.update(updateDto, usuarioId)).rejects.toThrow(
        'Organización con ID 1 no encontrada',
      );
    });
  });

  describe('verify', () => {
    const id = 1;

    beforeEach(() => {
      organizacionRepository.findOne.mockResolvedValue(mockOrganizacion);
      organizacionRepository.save.mockResolvedValue({
        ...mockOrganizacion,
        verificada: true,
      });
    });

    it('debe verificar una organización', async () => {
      const result = await service.verify(id);

      expect(result.verificada).toBe(true);
    });

    it('debe lanzar error cuando la organización no existe', async () => {
      organizacionRepository.findOne.mockResolvedValue(null);

      await expect(service.verify(id)).rejects.toThrow(
        `Organización con ID ${id} no encontrada`,
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      organizacionRepository.findOne.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(service.verify(id)).rejects.toThrow('Error desconocido');
    });
  });

  describe('delete', () => {
    const id = 1;

    beforeEach(() => {
      organizacionRepository.findOne.mockResolvedValue(mockOrganizacion);
      organizacionRepository.update.mockResolvedValue({ affected: 1 } as any);
    });

    it('debe deshabilitar una organización', async () => {
      await service.delete(id);

      expect(organizacionRepository.update).toHaveBeenCalledWith(id, {
        habilitada: false,
      });
    });

    it('debe lanzar error cuando la organización no existe', async () => {
      organizacionRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(id)).rejects.toThrow(
        `Organizacion con ID ${id} no encontrada`,
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      organizacionRepository.findOne.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(service.delete(id)).rejects.toThrow('Error desconocido');
    });
  });

  describe('restore', () => {
    const id = 1;

    beforeEach(() => {
      organizacionRepository.findOne.mockResolvedValue(mockOrganizacion);
      organizacionRepository.update.mockResolvedValue({ affected: 1 } as any);
    });

    it('debe restaurar una organización', async () => {
      await service.restore(id);

      expect(organizacionRepository.update).toHaveBeenCalledWith(id, {
        habilitada: true,
      });
    });

    it('debe lanzar error cuando la organización no existe', async () => {
      organizacionRepository.findOne.mockResolvedValue(null);

      await expect(service.restore(id)).rejects.toThrow(
        `Organizacion con ID ${id} no encontrada`,
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      organizacionRepository.findOne.mockRejectedValue(
        'Error string inesperado',
      );

      await expect(service.restore(id)).rejects.toThrow('Error desconocido');
    });
  });
});
