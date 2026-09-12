import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ServicesModule } from './services/services.module';
import { AvailabilityModule } from './availability/availability.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { CustomerAuthModule } from './customer-auth/customer-auth.module';
import { UploadModule } from './upload/upload.module';
import { MailModule } from './mail/mail.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module'; // ✅ NOVO

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');

        if (!jwtSecret) {
          throw new Error('JWT_SECRET não definido no ambiente.');
        }

        return {
          secret: jwtSecret,
          signOptions: { expiresIn: '7d' },
        };
      },
    }),

    PrismaModule,
    ServicesModule,
    AvailabilityModule,
    AppointmentsModule,
    CustomerAuthModule,
    UploadModule,
    MailModule,
    AdminAuthModule, // ✅ NOVO
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
