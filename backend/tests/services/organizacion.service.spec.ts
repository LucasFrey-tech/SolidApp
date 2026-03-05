import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';

import { PerfilOrganizacionService } from '../../src/Modules/organization/organizacion.service';
import { PerfilOrganizacion } from '../../src/Entities/perfil_organizacion.entity';
import { Cuenta, RolCuenta } from '../../src/Entities/cuenta.entity';
import { CampaignsService } from '../../src/Modules/campaign/campaign.service';
import { DonacionService } from '../../src/Modules/donation/donacion.service';
import { CuentaService } from '../../src/Modules/cuenta/cuenta.service';

import { CreateCampaignsDto } from '../../src/Modules/campaign/dto/create_campaigns.dto';
import { UpdateCampaignsDto } from '../../src/Modules/campaign/dto/update_campaigns.dto';
import { UpdateDonacionEstadoDto } from '../../src/Modules/donation/dto/update_donation_estado.dto';
import { UpdateCredencialesDto } from '../../src/Modules/user/dto/panelUsuario.dto';
import { CreateOrganizacionDto } from '../../src/Modules/organization/dto/create_organization.dto';
import { UpdateOrganizacionDto } from '../../src/Modules/organization/dto/update_organizacion.dto';
import { ResponseCampaignsDetailPaginatedDto } from '../../src/Modules/campaign/dto/response_campaign_paginated.dto';
import { PaginatedOrganizationDonationsResponseDto } from '../../src/Modules/donation/dto/response_donation_paginatedByOrganizacion.dto';
import { ResponseCampaignsDto } from '../../src/Modules/campaign/dto/response_campaigns.dto';
import { ResponseDonationDto } from '../../src/Modules/donation/dto/response_donation.dto';
import { DonacionEstado } from '../../src/Modules/donation/enum';

describe('PerfilOrganizacionService', () => {
  let service: PerfilOrganizacionService;
  let repository: DeepMockProxy<Repository<PerfilOrganizacion>>;
  let campaignService: DeepMockProxy<CampaignsService>;
  let donacionService: DeepMockProxy<DonacionService>;
  let cuentaService: DeepMockProxy<CuentaService>;
  let queryBuilder: DeepMockProxy<SelectQueryBuilder<PerfilOrganizacion>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerfilOrganizacionService,
        {
          provide: getRepositoryToken(PerfilOrganizacion),
          useValue: mockDeep<Repository<PerfilOrganizacion>>(),
        },
        { provide: CampaignsService, useValue: mockDeep<CampaignsService>() },
        { provide: DonacionService, useValue: mockDeep<DonacionService>() },
        { provide: CuentaService, useValue: mockDeep<CuentaService>() },
      ],
    }).compile();

    service = module.get(PerfilOrganizacionService);
    repository = module.get(getRepositoryToken(PerfilOrganizacion));
    campaignService = module.get(CampaignsService);
    donacionService = module.get(DonacionService);
    cuentaService = module.get(CuentaService);

    queryBuilder = mockDeep<SelectQueryBuilder<PerfilOrganizacion>>();
  });

  afterEach(() => jest.clearAllMocks());

  const buildCuenta = (): Cuenta => ({
    id: 1,
    correo: 'org@mail.com',
    clave: 'hashed',
    role: RolCuenta.ORGANIZACION,
    calle: '',
    numero: '',
    codigo_postal: '',
    ciudad: '',
    provincia: '',
    prefijo: '',
    telefono: '',
    deshabilitado: false,
    verificada: true,
    fecha_registro: new Date(),
    ultimo_cambio: new Date(),
    ultima_conexion: new Date(),
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });

  const buildOrganizacion = (): PerfilOrganizacion => ({
    id: 1,
    cuit: '30-12345678-9',
    razon_social: 'Fundacion Legal',
    nombre_organizacion: 'Fundacion Esperanza',
    descripcion: 'Desc',
    verificada: false,
    web: 'https://org.com',
    cuenta: buildCuenta(),
    campaigns: [],
  });

  describe('findPaginated', () => {
    it('findPaginated debe retornar datos paginados', async () => {
      const org = buildOrganizacion();

      repository.createQueryBuilder.mockReturnValue(queryBuilder);
      queryBuilder.leftJoinAndSelect.mockReturnValue(queryBuilder);
      queryBuilder.andWhere.mockReturnValue(queryBuilder);
      queryBuilder.skip.mockReturnValue(queryBuilder);
      queryBuilder.take.mockReturnValue(queryBuilder);
      queryBuilder.orderBy.mockReturnValue(queryBuilder);
      queryBuilder.getManyAndCount.mockResolvedValue([[org], 1]);

      const result = await service.findPaginated(1, 10, 'Fun');

      expect(result.total).toBe(1);
      expect(result.items[0].id).toBe(1);
    });
  });

  describe('findOne', () => {
    it('findOne debe retornar organización', async () => {
      repository.findOne.mockResolvedValue(buildOrganizacion());

      const result = await service.findOne(1);

      expect(result.id).toBe(1);
    });

    it('findOne debe lanzar NotFoundException', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCuentaId', () => {
    it('findByCuentaId debe retornar perfil', async () => {
      repository.findOne.mockResolvedValue(buildOrganizacion());

      const result = await service.findByCuentaId(1);

      expect(result.id).toBe(1);
    });

    it('findByCuentaId debe lanzar NotFoundException', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findByCuentaId(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getCampaigns', () => {
    it('getCampaigns debe delegar correctamente', async () => {
      const response: ResponseCampaignsDetailPaginatedDto = {
        items: [],
        total: 0,
      };
      campaignService.findCampaignsPaginated.mockResolvedValue(response);

      const result = await service.getCampaigns(1, 1, 10);

      expect(result).toBe(response);
    });
  });

  describe('getDonaciones', () => {
    it('getDonaciones debe delegar correctamente', async () => {
      const response: PaginatedOrganizationDonationsResponseDto = {
        items: [],
        total: 0,
      };
      donacionService.findAllPaginatedByOrganizacion.mockResolvedValue(
        response,
      );

      const result = await service.getDonaciones(1, 1, 10);

      expect(result).toBe(response);
    });
  });

  describe('confirmarDonacion', () => {
    it('confirmarDonacion debe delegar correctamente', async () => {
      const dto: UpdateDonacionEstadoDto = { estado: 1 };

      const response: ResponseDonationDto = {
        id: 1,
        titulo: 'Donación de alimentos',
        detalle: 'Arroz y fideos',
        tipo: 'ALIMENTO',
        cantidad: 10,
        estado: DonacionEstado.APROBADA,
        puntos: 500,
        campaignId: 3,
        userId: 12,
        fecha_registro: new Date(),
        imagen: 'imagen.jpg',
      };

      donacionService.confirmarDonacion.mockResolvedValue(response);

      const result = await service.confirmarDonacion(1, dto);

      expect(result).toBe(response);
      expect(donacionService.confirmarDonacion).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('createCampaign', () => {
    it('createCampaign debe delegar correctamente', async () => {
      const dto: CreateCampaignsDto = {
        titulo: 'Campaña',
        descripcion: 'Desc',
        fecha_Inicio: new Date(),
        fecha_Fin: new Date(),
        objetivo: 1000,
        puntos: 10,
      };

      const response = {} as ResponseCampaignsDto;
      campaignService.create.mockResolvedValue(response);

      const result = await service.createCampaign(1, dto, []);

      expect(result).toBe(response);
    });
  });

  describe('updateCampaing', () => {
    it('updateCampaign debe delegar correctamente', async () => {
      const dto: UpdateCampaignsDto = { titulo: 'Nueva' };
      const response = {} as ResponseCampaignsDto;

      campaignService.update.mockResolvedValue(response);

      const result = await service.updateCampaign(1, dto);

      expect(result).toBe(response);
    });
  });

  describe('updateCredenciales', () => {
    it('updateCredenciales debe delegar correctamente', async () => {
      const dto: UpdateCredencialesDto = { correo: 'nuevo@mail.com' };

      cuentaService.updateCredenciales.mockResolvedValue();

      await service.updateCredenciales(1, dto);

      expect(cuentaService.updateCredenciales).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('create', () => {
    it('create debe crear organización', async () => {
      const dto: CreateOrganizacionDto = {
        cuit_organizacion: '30-12345678-9',
        razon_social: 'Fundacion Legal',
        nombre_organizacion: 'Fundacion',
        web: 'https://org.com',
      };

      repository.findOne.mockResolvedValueOnce(null);
      repository.findOne.mockResolvedValueOnce(null);
      repository.create.mockReturnValue(buildOrganizacion());
      repository.save.mockResolvedValue(buildOrganizacion());

      const result = await service.create(dto, 1);

      expect(result.id).toBe(1);
    });

    it('create debe lanzar ConflictException si perfil existe', async () => {
      repository.findOne.mockResolvedValue(buildOrganizacion());

      await expect(
        service.create({} as CreateOrganizacionDto, 1),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('update debe actualizar organización', async () => {
      const org = buildOrganizacion();
      repository.findOne.mockResolvedValue(org);
      repository.save.mockResolvedValue(org);

      const dto: UpdateOrganizacionDto = { descripcion: 'Nueva desc' };

      const result = await service.update(1, dto);

      expect(result.descripcion).toBe('Nueva desc');
    });

    it('update debe lanzar NotFoundException', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update(99, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('verify', () => {
    it('verify debe marcar como verificada', async () => {
      const org = buildOrganizacion();
      repository.findOne.mockResolvedValue(org);
      repository.save.mockResolvedValue(org);

      const result = await service.verify(1);

      expect(result.verificada).toBe(true);
    });
  });

  describe('delete', () => {
    it('delete debe deshabilitar cuenta', async () => {
      repository.findOne.mockResolvedValue(buildOrganizacion());

      await service.delete(1);

      expect(cuentaService.deshabilitar).toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('restore debe habilitar cuenta', async () => {
      repository.findOne.mockResolvedValue(buildOrganizacion());

      await service.restore(1);

      expect(cuentaService.habilitar).toHaveBeenCalled();
    });
  });
});
