import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MeasurementDiagnosesService } from './measurement-diagnoses.service';
import { MeasurementDiagnosesController } from './measurement-diagnoses.controller';
import { MeasurementDiagnosis, MeasurementDiagnosisSchema } from '../schemas/measurement-diagnosis.schema';
import { Measurement, MeasurementSchema } from '../schemas/measurement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MeasurementDiagnosis.name, schema: MeasurementDiagnosisSchema },
      { name: Measurement.name, schema: MeasurementSchema }
    ])
  ],
  controllers: [MeasurementDiagnosesController],
  providers: [MeasurementDiagnosesService],
  exports: [MeasurementDiagnosesService]
})
export class MeasurementDiagnosesModule {} 