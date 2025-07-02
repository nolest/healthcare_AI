import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { DiagnosesModule } from './diagnoses/diagnoses.module';
import { CovidAssessmentsModule } from './covid-assessments/covid-assessments.module';
import { CovidDiagnosesModule } from './covid-diagnoses/covid-diagnoses.module';
import { MeasurementDiagnosesModule } from './measurement-diagnoses/measurement-diagnoses.module';
import { UsersModule } from './users/users.module';
import { AbnormalRangesModule } from './abnormal-ranges/abnormal-ranges.module';
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
    CovidDiagnosesModule,
    MeasurementDiagnosesModule,
    UsersModule,
    AbnormalRangesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
