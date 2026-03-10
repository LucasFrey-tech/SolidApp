import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { Rol } from '../../Entities/usuario.entity';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from '../../Modules/user/usuario.service';

async function seedAdmin() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usuarioService = app.get(UsuarioService);

    const adminCorreo = process.env.ADMIN_EMAIL || 'admin@solid_app.com';
    const adminClave = process.env.ADMIN_PASSWORD || 'SolidSystem';

    const adminExistente = await usuarioService.findByEmail(adminCorreo);

    if (adminExistente) {
      console.log('Admin ya existe');
      await app.close();
      return;
    }

    const claveHasheada = await bcrypt.hash(adminClave, 10);

    const admin = await usuarioService.create({
      correo: adminCorreo,
      clave: claveHasheada,
      documento: '',
      nombre: '',
      apellido: '',
      rol: Rol.ADMIN,
    });

    console.log(`Admin creado: ${JSON.stringify(admin, null, 2)}`);
    await app.close();
  } catch (error) {
    console.error('Error al crear admin:', error);
    process.exit(1);
  }
}

void seedAdmin();
