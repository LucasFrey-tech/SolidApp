import { Module } from '@nestjs/common';
import { CompaniesController } from './company.controller';
import { CompaniesService } from './company.service';
import { Company } from '../../Entities/companies.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class UserModule {}
