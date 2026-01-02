import { Module } from '@nestjs/common';
import { OrganizationsController } from './organization.controller';
import { OrganizationsService } from './organization.service';
import { Organizations } from '../../Entities/organizations.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Organizations])],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationModule {}
