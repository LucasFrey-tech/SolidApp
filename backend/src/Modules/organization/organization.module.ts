import { Module } from '@nestjs/common';
import { OrganizationsController } from './organization.controller';
import { OrganizationsService } from './organization.service';
import { Organization } from '../../Entities/organizations.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Organization])],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationModule {}
