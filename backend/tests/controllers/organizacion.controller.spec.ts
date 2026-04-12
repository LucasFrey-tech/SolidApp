import { Test, TestingModule } from '@nestjs/testing';
import { OrganizacionesController } from '../../src/Modules/organizacion/organizacion.controller';
import { OrganizacionService } from '../../src/Modules/organizacion/organizacion.service';
import { mock } from 'jest-mock-extended';
import { RequestConUsuario } from '../../src/Modules/auth/interfaces/authenticated_request.interface';
import { Rol } from '../../src/Modules/user/enums/enums';
import { UpdateOrganizacionDto } from '../../src/Modules/organizacion/dto/update_organizacion.dto';
import { CreateOrganizacionDto } from '../../src/Modules/organizacion/dto/create_organizacion.dto';
import { ResponseOrganizacionDto } from '../../src/Modules/organizacion/dto/response_organizacion.dto';
import { CreateCampaignsDto } from '../../src/Modules/campaign/dto/create_campaigns.dto';
import { UpdateCampaignsDto } from '../../src/Modules/campaign/dto/update_campaigns.dto';
import { UpdateDonacionEstadoDto } from '../../src/Modules/donation/dto/update_donation_estado.dto';
import { DonacionEstado } from '../../src/Modules/donation/enum';
import { ResponseCampaignsDto } from '../../src/Modules/campaign/dto/response_campaigns.dto';
import { ResponseDonationDto } from '../../src/Modules/donation/dto/response_donation.dto';
import { PaginatedOrganizationDonationsResponseDto } from '../../src/Modules/donation/dto/response_donation_paginatedByOrganizacion.dto';
import { ResponseCampaignsDetailPaginatedDto } from '../../src/Modules/campaign/dto/response_campaign_paginated.dto';
import { Organizacion } from '../../src/Entities/organizacion.entity';
import { Contacto } from '../../src/Entities/contacto.entity';
import { Direccion } from '../../src/Entities/direccion.entity';

const mockContacto: Contacto = {
  id: 1,
  correo: 'contacto@fundaciontest.org',
  prefijo: '11',
  telefono: '12345678',
};

const mockDireccion: Direccion = {
  id: 1,
  calle: 'Av. Siempre Viva',
  numero: '742',
  codigo_postal: '1638',
  ciudad: 'Springfield',
  provincia: 'Buenos Aires',
};

const mockOrganizacionEntity: Organizacion = {
  id: 1,
  cuit: '30-12345678-9',
  razon_social: 'Fundación Test S.A.',
  nombre_organizacion: 'Fundación Test',
  contacto: mockContacto,
  direccion: mockDireccion,
  descripcion: 'Descripción de la fundación',
  verificada: true,
  web: 'https://fundaciontest.org',
  fecha_registro: new Date(),
  ultimo_cambio: new Date(),
  habilitada: true,
  organizacionUsuarios: [],
  campaign: [],
};

const mockOrganizacionResponse: ResponseOrganizacionDto = {
  id: 1,
  cuit: '30-12345678-9',
  razon_social: 'Fundación Test S.A.',
  nombre_organizacion: 'Fundación Test',
  verificada: true,
  habilitada: true,
  descripcion: 'Descripción de la fundación',
  web: 'https://fundaciontest.org',
  fecha_registro: mockOrganizacionEntity.fecha_registro,
  ultimo_cambio: mockOrganizacionEntity.ultimo_cambio,
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

const mockCampaignResponse: ResponseCampaignsDto = {
  id: 1,
  titulo: 'Campaña Solidaria',
  descripcion: 'Descripción de la campaña',
  fecha_Inicio: new Date(),
  fecha_Fin: new Date(),
  fecha_Registro: new Date(),
  objetivo: 100000,
  puntos: 50,
  organizacion: {
    id: 1,
    nombre_organizacion: 'Fundación Test',
    verificada: true,
  },
};

const mockDonacionResponse: ResponseDonationDto = {
  id: 1,
  titulo: 'Donación de alimentos',
  detalle: 'Arroz, fideos y enlatados',
  tipo: 'ALIMENTO',
  cantidad: 10,
  estado: DonacionEstado.APROBADA,
  puntos: 500,
  campaignId: 1,
  userId: 1,
  fecha_registro: new Date(),
  imagen: 'imagen.jpg',
};

describe('OrganizacionesController', () => {
  let controller: OrganizacionesController;
  let organizacionService: jest.Mocked<OrganizacionService>;

  const mockReq = {
    user: { id: 1, rol: Rol.COLABORADOR },
  } as RequestConUsuario;

  beforeEach(async () => {
    const mockOrganizacionService = mock<OrganizacionService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizacionesController],
      providers: [
        {
          provide: OrganizacionService,
          useValue: mockOrganizacionService,
        },
      ],
    }).compile();

    controller = module.get<OrganizacionesController>(OrganizacionesController);
    organizacionService = module.get(OrganizacionService);
  });

  describe('getMiPerfil', () => {
    it('debe obtener el perfil de la organización del usuario autenticado', async () => {
      organizacionService.getOrganizacionByUsuario.mockResolvedValue(
        mockOrganizacionEntity,
      );

      const result = await controller.getMiPerfil(mockReq);

      expect(result).toEqual(mockOrganizacionEntity);
      expect(organizacionService.getOrganizacionByUsuario).toHaveBeenCalledWith(
        1,
      );
    });

    it('debe manejar error cuando el usuario no tiene organización asociada', async () => {
      const error = new Error('Usuario no asociado a ninguna organización');

      organizacionService.getOrganizacionByUsuario.mockRejectedValue(error);

      await expect(controller.getMiPerfil(mockReq)).rejects.toThrow(
        'Usuario no asociado a ninguna organización',
      );
    });
  });

  describe('getMisCampañas', () => {
    const mockCampañasResponse: ResponseCampaignsDetailPaginatedDto = {
      items: [],
      total: 0,
    };

    it('debe obtener las campañas de la organización paginadas', async () => {
      organizacionService.getOrganizacionByUsuario.mockResolvedValue(
        mockOrganizacionEntity,
      );
      organizacionService.getCampaigns.mockResolvedValue(mockCampañasResponse);

      const result = await controller.getMisCampañas(mockReq, 1, 10);

      expect(result).toEqual(mockCampañasResponse);
      expect(organizacionService.getOrganizacionByUsuario).toHaveBeenCalledWith(
        1,
      );
      expect(organizacionService.getCampaigns).toHaveBeenCalledWith(1, 1, 10);
    });
  });

  describe('registrarOrganizacion', () => {
    const createDto: CreateOrganizacionDto = {
      nombre: 'Juan',
      apellido: 'Pérez',
      documento: '12345678',
      correo: 'juan@organizacion.com',
      clave: 'Password123',
      prefijo: '11',
      telefono: '1123456789',
      correo_organizacion: 'contacto@organizacion.com',
      cuit_organizacion: '30123456789',
      razon_social: 'Fundación Test S.A.',
      nombre_organizacion: 'Fundación Test',
      calle: 'Av. Siempre Viva',
      numero: '742',
    };

    it('debe registrar una nueva organización exitosamente', async () => {
      organizacionService.registrarOrganizacion.mockResolvedValue(
        mockOrganizacionResponse,
      );

      const result = await controller.registrarOrganizacion(createDto);

      expect(result).toEqual(mockOrganizacionResponse);
      expect(organizacionService.registrarOrganizacion).toHaveBeenCalledWith(
        createDto,
      );
    });
  });

  describe('createMiCampaign', () => {
    const createDto: CreateCampaignsDto = {
      titulo: 'Campaña Solidaria',
      descripcion: 'Descripción de la campaña',
      fecha_Inicio: new Date('2025-06-01'),
      fecha_Fin: new Date('2025-08-31'),
      objetivo: 100000,
      puntos: 50,
    };

    it('debe crear una campaña exitosamente sin imágenes', async () => {
      organizacionService.getOrganizacionByUsuario.mockResolvedValue(
        mockOrganizacionEntity,
      );
      organizacionService.createCampaign.mockResolvedValue(
        mockCampaignResponse,
      );

      const result = await controller.createMiCampaign(mockReq, createDto, []);

      expect(result).toEqual(mockCampaignResponse);
      expect(organizacionService.createCampaign).toHaveBeenCalledWith(
        1,
        createDto,
        [],
        1,
      );
    });
  });

  describe('updateMiCampaign', () => {
    const campaignId = 1;
    const updateDto: UpdateCampaignsDto = {
      titulo: 'Nuevo título',
    };

    it('debe actualizar una campaña exitosamente', async () => {
      organizacionService.getOrganizacionByUsuario.mockResolvedValue(
        mockOrganizacionEntity,
      );
      organizacionService.updateCampaign.mockResolvedValue(
        mockCampaignResponse,
      );

      const result = await controller.updateMiCampaign(
        campaignId,
        mockReq,
        updateDto,
        undefined,
      );

      expect(result).toEqual(mockCampaignResponse);
      expect(organizacionService.updateCampaign).toHaveBeenCalledWith(
        1,
        campaignId,
        updateDto,
        1,
        undefined,
      );
    });
  });

  describe('getMisDonaciones', () => {
    const mockDonacionesResponse: PaginatedOrganizationDonationsResponseDto = {
      items: [],
      total: 0,
    };

    it('debe obtener las donaciones de la organización paginadas', async () => {
      organizacionService.getOrganizacionByUsuario.mockResolvedValue(
        mockOrganizacionEntity,
      );
      organizacionService.getDonaciones.mockResolvedValue(
        mockDonacionesResponse,
      );

      const result = await controller.getMisDonaciones(mockReq, 1, 10, '');

      expect(result).toEqual(mockDonacionesResponse);
      expect(organizacionService.getDonaciones).toHaveBeenCalledWith(
        1,
        1,
        10,
        '',
      );
    });
  });

  describe('actualizarEstadoDonación', () => {
    const donationId = 1;
    const dto: UpdateDonacionEstadoDto = {
      estado: DonacionEstado.APROBADA,
    };

    it('debe actualizar el estado de una donación a APROBADA', async () => {
      organizacionService.confirmarDonacion.mockResolvedValue(
        mockDonacionResponse,
      );

      const result = await controller.actualizarEstadoDonación(
        donationId,
        dto,
        mockReq,
      );

      expect(result).toEqual(mockDonacionResponse);
      expect(organizacionService.confirmarDonacion).toHaveBeenCalledWith(
        1,
        dto,
        1,
      );
    });
  });

  describe('updateMiPerfil', () => {
    const updateDto: UpdateOrganizacionDto = {
      descripcion: 'Nueva descripción',
    };

    it('debe actualizar el perfil de la organización exitosamente', async () => {
      const expectedResponse = {
        ...mockOrganizacionResponse,
        descripcion: 'Nueva descripción',
      };

      organizacionService.update.mockResolvedValue(expectedResponse);

      const result = await controller.updateMiPerfil(mockReq, updateDto);

      expect(result).toEqual(expectedResponse);
      expect(organizacionService.update).toHaveBeenCalledWith(updateDto, 1);
    });
  });

  describe('findPaginated (Admin)', () => {
    const mockPaginatedResponse = {
      items: [mockOrganizacionResponse],
      total: 1,
    };

    it('debe obtener organizaciones paginadas', async () => {
      organizacionService.findPaginated.mockResolvedValue(
        mockPaginatedResponse,
      );

      const result = await controller.findPaginated(1, 10, '');

      expect(result).toEqual(mockPaginatedResponse);
      expect(organizacionService.findPaginated).toHaveBeenCalledWith(1, 10, '');
    });
  });

  describe('update (Admin)', () => {
    const updateDto: UpdateOrganizacionDto = {
      descripcion: 'Nueva descripción admin',
    };

    it('debe actualizar una organización como admin', async () => {
      const expectedResponse = {
        ...mockOrganizacionResponse,
        descripcion: 'Nueva descripción admin',
      };

      organizacionService.update.mockResolvedValue(expectedResponse);

      const result = await controller.update(1, updateDto);

      expect(result).toEqual(expectedResponse);
      expect(organizacionService.update).toHaveBeenCalledWith(updateDto, 1);
    });
  });

  describe('delete (Admin)', () => {
    it('debe deshabilitar una organización exitosamente', async () => {
      organizacionService.delete.mockResolvedValue(undefined);

      await controller.delete(1);

      expect(organizacionService.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('restore (Admin)', () => {
    it('debe restaurar una organización exitosamente', async () => {
      organizacionService.restore.mockResolvedValue(undefined);

      await controller.restore(1);

      expect(organizacionService.restore).toHaveBeenCalledWith(1);
    });
  });
});
