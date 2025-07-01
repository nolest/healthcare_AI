import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CovidDiagnosesService } from './covid-diagnoses.service';
import { CovidDiagnosesController } from './covid-diagnoses.controller';
import { CovidDiagnosis, CovidDiagnosisSchema } from '../schemas/covid-diagnosis.schema';
import { CovidAssessment, CovidAssessmentSchema } from '../schemas/covid-assessment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CovidDiagnosis.name, schema: CovidDiagnosisSchema },
      { name: CovidAssessment.name, schema: CovidAssessmentSchema },
    ]),
  ],
  controllers: [CovidDiagnosesController],
  providers: [CovidDiagnosesService],
  exports: [CovidDiagnosesService],
})
export class CovidDiagnosesModule {} 