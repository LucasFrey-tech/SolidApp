import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { mock } from 'jest-mock-extended';
import { InvitacionesService } from '../../src/Modules/invitaciones/invitacion.service';
import { EmailService } from '../../src/Modules/email/email.service';
import { Invitacion } from '../../src/Entities/invitacion.entity';
import { Contacto } from '../../src/Entities/contacto.entity';
import { EmpresaUsuario } from '../../src/Entities/empresa_usuario.entity';
import { OrganizacionUsuario } from '../../src/Entities/organizacion_usuario.entity';
import { RolSecundario } from '../../src/Modules/user/enums/enums';

const createMockInvitacion = (overrides?: Partial<Invitacion>): Invitacion => {
  const invitacion = Object.assign(new Invitacion(), {
    id: 1,
    token: 'token-123',
    correo: 'test@test.com',
    empresa: { id: 1 },
    organizacion: undefined,
    invitadorID: 1,
    rol: RolSecundario.MIEMBRO,
    expirada: false,
    fecha_creacion: new Date(),
    fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ...overrides,
  });
  return invitacion;
};

const mockInvitacion = createMockInvitacion();

const mockContacto = Object.assign(new Contacto(), {
  id: 1,
  correo: 'test@test.com',
});

const mockEmpresaUsuario = Object.assign(new EmpresaUsuario(), {
  id: 1,
  id_usuario: 1,
  id_empresa: 1,
  rol: RolSecundario.MIEMBRO,
  activo: true,
  fecha_asignacion: new Date(),
});

const mockOrganizacionUsuario = Object.assign(new OrganizacionUsuario(), {
  id: 1,
  id_usuario: 1,
  id_organizacion: 1,
  rol: RolSecundario.MIEMBRO,
  activo: true,
  fecha_asignacion: new Date(),
});

describe('InvitacionesService', () => {
  let service: InvitacionesService;
  let invitacionRepo: jest.Mocked<Repository<Invitacion>>;
  let contactoRepo: jest.Mocked<Repository<Contacto>>;
  let empresaUsuarioRepo: jest.Mocked<Repository<EmpresaUsuario>>;
  let organizacionUsuarioRepo: jest.Mocked<Repository<OrganizacionUsuario>>;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const mockInvitacionRepo = mock<Repository<Invitacion>>();
    const mockContactoRepo = mock<Repository<Contacto>>();
    const mockEmpresaUsuarioRepo = mock<Repository<EmpresaUsuario>>();
    const mockOrganizacionUsuarioRepo = mock<Repository<OrganizacionUsuario>>();
    const mockEmailService = mock<EmailService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitacionesService,
        {
          provide: getRepositoryToken(Invitacion),
          useValue: mockInvitacionRepo,
        },
        { provide: getRepositoryToken(Contacto), useValue: mockContactoRepo },
        {
          provide: getRepositoryToken(EmpresaUsuario),
          useValue: mockEmpresaUsuarioRepo,
        },
        {
          provide: getRepositoryToken(OrganizacionUsuario),
          useValue: mockOrganizacionUsuarioRepo,
        },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<InvitacionesService>(InvitacionesService);
    invitacionRepo = module.get(getRepositoryToken(Invitacion));
    contactoRepo = module.get(getRepositoryToken(Contacto));
    empresaUsuarioRepo = module.get(getRepositoryToken(EmpresaUsuario));
    organizacionUsuarioRepo = module.get(
      getRepositoryToken(OrganizacionUsuario),
    );
    emailService = module.get(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('crearInvitacionesEmpresa', () => {
    const correos = ['test1@test.com', 'test2@test.com'];
    const empresaId = 1;
    const usuarioInvitadorId = 1;

    beforeEach(() => {
      contactoRepo.findOne.mockResolvedValue(null);
      invitacionRepo.findOne.mockResolvedValue(null);
      invitacionRepo.create.mockReturnValue(mockInvitacion);
      invitacionRepo.save.mockResolvedValue([mockInvitacion] as any);
      emailService.sendInvitationEmail.mockResolvedValue(undefined);
    });

    it('debe crear invitaciones para empresa exitosamente', async () => {
      const result = await service.crearInvitacionesEmpresa(
        correos,
        empresaId,
        usuarioInvitadorId,
      );

      expect(result.invitaciones).toBeDefined();
      expect(emailService.sendInvitationEmail).toHaveBeenCalled();
    });

    it('debe detectar correos existentes', async () => {
      contactoRepo.findOne.mockResolvedValue(mockContacto);

      const result = await service.crearInvitacionesEmpresa(
        correos,
        empresaId,
        usuarioInvitadorId,
      );

      expect(result.correosExistentes).toContain('test1@test.com');
    });

    it('debe detectar correos ya invitados', async () => {
      contactoRepo.findOne.mockResolvedValue(null);
      invitacionRepo.findOne.mockResolvedValue(mockInvitacion);

      const result = await service.crearInvitacionesEmpresa(
        correos,
        empresaId,
        usuarioInvitadorId,
      );

      expect(result.correosYaInvitados).toContain('test1@test.com');
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      contactoRepo.findOne.mockRejectedValue('Error string inesperado');

      await expect(
        service.crearInvitacionesEmpresa(
          correos,
          empresaId,
          usuarioInvitadorId,
        ),
      ).rejects.toThrow('Error desconocido');
    });
  });

  describe('crearInvitacionesOrganizacion', () => {
    const correos = ['test1@test.com'];
    const organizacionId = 1;
    const usuarioInvitadorId = 1;

    beforeEach(() => {
      invitacionRepo.count.mockResolvedValue(0);
      contactoRepo.findOne.mockResolvedValue(null);
      invitacionRepo.findOne.mockResolvedValue(null);
      invitacionRepo.create.mockReturnValue(mockInvitacion);
      invitacionRepo.save.mockResolvedValue([mockInvitacion] as any);
      emailService.sendInvitationEmail.mockResolvedValue(undefined);
    });

    it('debe crear invitaciones para organización exitosamente', async () => {
      const result = await service.crearInvitacionesOrganizacion(
        correos,
        organizacionId,
        usuarioInvitadorId,
      );

      expect(result.invitaciones).toBeDefined();
      expect(emailService.sendInvitationEmail).toHaveBeenCalled();
    });

    it('debe lanzar error cuando excede el límite de 5 invitaciones pendientes', async () => {
      invitacionRepo.count.mockResolvedValue(5);

      await expect(
        service.crearInvitacionesOrganizacion(
          correos,
          organizacionId,
          usuarioInvitadorId,
        ),
      ).rejects.toThrow('No se pueden enviar más de 5 invitaciones pendientes');
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      invitacionRepo.count.mockRejectedValue('Error string inesperado');

      await expect(
        service.crearInvitacionesOrganizacion(
          correos,
          organizacionId,
          usuarioInvitadorId,
        ),
      ).rejects.toThrow('Error desconocido');
    });
  });

  describe('invitarEntidad', () => {
    const correos = ['entidad@test.com'];
    const usuarioInvitadorId = 1;

    it('debe invitar a una entidad exitosamente', async () => {
      contactoRepo.findOne.mockResolvedValue(null);
      invitacionRepo.create.mockReturnValue(mockInvitacion);
      invitacionRepo.save.mockResolvedValue([mockInvitacion] as any);
      emailService.sendEntidadInvitationEmail.mockResolvedValue(undefined);

      const result = await service.invitarEntidad(correos, usuarioInvitadorId);

      expect(result.invitaciones).toHaveLength(1);
      expect(result.correosExistentes).toHaveLength(0);
      expect(emailService.sendEntidadInvitationEmail).toHaveBeenCalled();
    });

    it('debe detectar correos existentes y no crear invitaciones', async () => {
      contactoRepo.findOne.mockResolvedValue(mockContacto);

      invitacionRepo.save.mockResolvedValue([] as any);

      const result = await service.invitarEntidad(correos, usuarioInvitadorId);

      expect(result.correosExistentes).toContain('entidad@test.com');
      expect(result.invitaciones).toHaveLength(0);
      expect(invitacionRepo.create).not.toHaveBeenCalled();
      expect(emailService.sendEntidadInvitationEmail).not.toHaveBeenCalled();
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      contactoRepo.findOne.mockRejectedValue('Error string inesperado');

      await expect(
        service.invitarEntidad(correos, usuarioInvitadorId),
      ).rejects.toThrow('Error desconocido');
    });
  });

  describe('listarInvitacionesEntidad', () => {
    it('debe listar invitaciones de entidad paginadas', async () => {
      invitacionRepo.findAndCount.mockResolvedValue([[mockInvitacion], 1]);

      const result = await service.listarInvitacionesEntidad(1, 10);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      invitacionRepo.findAndCount.mockRejectedValue('Error string inesperado');

      await expect(service.listarInvitacionesEntidad(1, 10)).rejects.toThrow(
        'Error desconocido',
      );
    });
  });

  describe('listarInvitacionesEmpresa', () => {
    const empresaId = 1;

    it('debe listar invitaciones de empresa paginadas', async () => {
      invitacionRepo.findAndCount.mockResolvedValue([[mockInvitacion], 1]);

      const result = await service.listarInvitacionesEmpresa(empresaId, 1, 5);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      invitacionRepo.findAndCount.mockRejectedValue('Error string inesperado');

      await expect(
        service.listarInvitacionesEmpresa(empresaId, 1, 5),
      ).rejects.toThrow('Error desconocido');
    });
  });

  describe('listarInvitacionesOrganizacion', () => {
    const organizacionId = 1;

    it('debe listar invitaciones de organización paginadas', async () => {
      invitacionRepo.findAndCount.mockResolvedValue([[mockInvitacion], 1]);

      const result = await service.listarInvitacionesOrganizacion(
        organizacionId,
        1,
        5,
      );

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      invitacionRepo.findAndCount.mockRejectedValue('Error string inesperado');

      await expect(
        service.listarInvitacionesOrganizacion(organizacionId, 1, 5),
      ).rejects.toThrow('Error desconocido');
    });
  });

  describe('validarToken', () => {
    const token = 'token-123';

    it('debe validar un token exitosamente', async () => {
      invitacionRepo.findOne.mockResolvedValue(mockInvitacion);

      const result = await service.validarToken(token);

      expect(result.correo).toBe('test@test.com');
      expect(result.empresaId).toBe(1);
      expect(result.rol).toBe(RolSecundario.MIEMBRO);
    });

    it('debe lanzar error cuando el token no existe', async () => {
      invitacionRepo.findOne.mockResolvedValue(null);

      await expect(service.validarToken(token)).rejects.toThrow(
        'Invitación inválida',
      );
    });

    it('debe lanzar error cuando la invitación está expirada por fecha', async () => {
      const invitacionConFechaExpirada = createMockInvitacion({
        id: 3,
        token: 'token-789',
        expirada: false,
        fecha_expiracion: new Date(Date.now() - 24 * 60 * 60 * 1000),
      });
      invitacionRepo.findOne.mockResolvedValue(invitacionConFechaExpirada);

      await expect(service.validarToken(token)).rejects.toThrow(
        'Invitación expirada',
      );
    });

    it('debe lanzar error cuando la invitación ya fue utilizada (expirada = true)', async () => {
      const invitacionUsada = createMockInvitacion({
        id: 4,
        token: 'token-usado',
        expirada: true,
        fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      invitacionRepo.findOne.mockResolvedValue(invitacionUsada);

      await expect(service.validarToken('token-usado')).rejects.toThrow(
        'Invitación ya utilizada',
      );
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      invitacionRepo.findOne.mockRejectedValue('Error string inesperado');

      await expect(service.validarToken(token)).rejects.toThrow(
        'Error desconocido',
      );
    });
  });

  describe('agregarUsuarioAOrganizacion', () => {
    const usuarioId = 1;
    const organizacionId = 1;

    it('debe agregar un usuario a una organización', async () => {
      organizacionUsuarioRepo.create.mockReturnValue(mockOrganizacionUsuario);
      organizacionUsuarioRepo.save.mockResolvedValue(mockOrganizacionUsuario);

      const result = await service.agregarUsuarioAOrganizacion(
        usuarioId,
        organizacionId,
      );

      expect(result.id).toBe(1);
    });
  });

  describe('agregarUsuarioAEmpresa', () => {
    const usuarioId = 1;
    const empresaId = 1;

    it('debe agregar un usuario a una empresa', async () => {
      empresaUsuarioRepo.create.mockReturnValue(mockEmpresaUsuario);
      empresaUsuarioRepo.save.mockResolvedValue(mockEmpresaUsuario);

      const result = await service.agregarUsuarioAEmpresa(usuarioId, empresaId);

      expect(result.id).toBe(1);
    });
  });

  describe('marcarAceptada', () => {
    const invitacionId = 1;
    const usuarioId = 1;

    it('debe marcar una invitación como aceptada', async () => {
      invitacionRepo.findOne.mockResolvedValue(mockInvitacion);
      const invitacionActualizada = createMockInvitacion({
        expirada: true,
        usuarioId: usuarioId,
      });
      invitacionRepo.save.mockResolvedValue(invitacionActualizada);

      const result = await service.marcarAceptada(invitacionId, usuarioId);

      expect(result.expirada).toBe(true);
    });

    it('debe lanzar error cuando la invitación no existe', async () => {
      invitacionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.marcarAceptada(invitacionId, usuarioId),
      ).rejects.toThrow('Invitación no encontrada');
    });

    it('debe manejar error cuando el error no es instancia de Error', async () => {
      invitacionRepo.findOne.mockRejectedValue('Error string inesperado');

      await expect(
        service.marcarAceptada(invitacionId, usuarioId),
      ).rejects.toThrow('Error desconocido');
    });
  });

  describe('validarInvitacion', () => {
    const token = 'token-123';
    const correo = 'test@test.com';

    it('debe validar una invitación exitosamente', async () => {
      const invitacionValida = createMockInvitacion({
        expirada: false,
        fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      invitacionRepo.findOne.mockResolvedValue(invitacionValida);

      const result = await service.validarInvitacion(token, correo);

      expect(result.id).toBe(1);
    });

    it('debe lanzar error cuando el token no existe', async () => {
      invitacionRepo.findOne.mockResolvedValue(null);

      await expect(service.validarInvitacion(token, correo)).rejects.toThrow(
        'Invitación inválida',
      );
    });

    it('debe lanzar error cuando el correo no coincide', async () => {
      invitacionRepo.findOne.mockResolvedValue(mockInvitacion);

      await expect(
        service.validarInvitacion(token, 'otro@test.com'),
      ).rejects.toThrow('El correo no coincide con la invitación');
    });

    it('debe lanzar error cuando la invitación ya fue utilizada', async () => {
      const invitacionUsada = createMockInvitacion({
        expirada: true,
      });
      invitacionRepo.findOne.mockResolvedValue(invitacionUsada);

      await expect(service.validarInvitacion(token, correo)).rejects.toThrow(
        'La invitación ya fue utilizada',
      );
    });
  });
});
