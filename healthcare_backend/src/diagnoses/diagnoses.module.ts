import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiagnosesController } from './diagnoses.controller';
import { DiagnosesService } from './diagnoses.service';
import { Diagnosis, DiagnosisSchema } from '../schemas/diagnosis.schema';
import { Measurement, MeasurementSchema } from '../schemas/measurement.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Diagnosis.name, schema: DiagnosisSchema },
      { name: Measurement.name, schema: MeasurementSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [DiagnosesController],
  providers: [DiagnosesService],
  exports: [DiagnosesService],
})
export class DiagnosesModule {} 