import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { DiagnosesModule } from './diagnoses/diagnoses.module';
import { CovidAssessmentsModule } from './covid-assessments/covid-assessments.module';
import { UsersModule } from './users/users.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(databaseConfig.uri),
    AuthModule,
    MeasurementsModule,
    DiagnosesModule,
    CovidAssessmentsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
