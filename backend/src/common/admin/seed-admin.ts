import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { Cuenta, RolCuenta } from '../../Entities/cuenta.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

async function seedAdmin() {
  try {
    const app = await NestFactory.create(AppModule);
    const cuentaRepository = app.get<Repository<Cuenta>>('CuentaRepository');

    const adminCorreo = process.env.ADMIN_EMAIL || 'admin@solid_app.com';
    const adminClave = process.env.ADMIN_PASSWORD || 'SolidSystem';

    const adminExistente = await cuentaRepository.findOne({
      where: { correo: adminCorreo },
    });

    if (adminExistente) {
      console.log('Admin ya existe');
      await app.close();
      return;
    }

    const claveHasheada = await bcrypt.hash(adminClave, 10);

    const admin = cuentaRepository.create({
      correo: adminCorreo,
      clave: claveHasheada,
      role: RolCuenta.ADMIN,
    });

    await cuentaRepository.save(admin);
    console.log(`Admin creado: ${adminCorreo}`);
    await app.close();
  } catch (error) {
    console.error('Error al crear admin:', error);
    process.exit(1);
  }
}

void seedAdmin();
