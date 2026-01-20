import { Module } from '@nestjs/common';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { Usuario } from '../../Entities/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonMulterModule } from '../../common/multer/multer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    CommonMulterModule, //Files upload module
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UserModule {}
