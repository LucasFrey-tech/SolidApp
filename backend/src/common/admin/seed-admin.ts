import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { Usuario, Rol } from '../../Entities/usuario.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

async function seedAdmin() {
  try {
    const app = await NestFactory.create(AppModule);
    const usuarioRepository = app.get<Repository<Usuario>>('UsuarioRepository');

    const adminCorreo = process.env.ADMIN_EMAIL || 'admin@solid_app.com';
    const adminClave = process.env.ADMIN_PASSWORD || 'SolidSystem';

    const adminExistente = await usuarioRepository.findOne({
      where: { correo: adminCorreo },
    });

    if (adminExistente) {
      console.log('Admin ya existe');
      await app.close();
      return;
    }

    const claveHasheada = await bcrypt.hash(adminClave, 10);

    const admin = usuarioRepository.create({
      correo: adminCorreo,
      clave: claveHasheada,
      rol: Rol.ADMIN,
    });

    await usuarioRepository.save(admin);
    console.log(`Admin creado: ${adminCorreo}`);
    await app.close();
  } catch (error) {
    console.error('Error al crear admin:', error);
    process.exit(1);
  }
}

void seedAdmin();
