import { Module } from '@nestjs/common';
import { OrganizationsController } from './organization.controller';
import { OrganizationsService } from './organization.service';
import { Organizations } from '../../Entities/organizations.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Campaigns } from '../../Entities/campaigns.entity';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '2h' },
    }),
    TypeOrmModule.forFeature([Organizations, Campaigns]),
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationModule {}
