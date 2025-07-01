import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiagnosisReportsService } from './diagnosis-reports.service';
import { DiagnosisReportsController } from './diagnosis-reports.controller';
import { DiagnosisReport, DiagnosisReportSchema } from '../schemas/diagnosis-report.schema';
import { Measurement, MeasurementSchema } from '../schemas/measurement.schema';
import { CovidAssessment, CovidAssessmentSchema } from '../schemas/covid-assessment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DiagnosisReport.name, schema: DiagnosisReportSchema },
      { name: Measurement.name, schema: MeasurementSchema },
      { name: CovidAssessment.name, schema: CovidAssessmentSchema },
    ]),
  ],
  controllers: [DiagnosisReportsController],
  providers: [DiagnosisReportsService],
  exports: [DiagnosisReportsService],
})
export class DiagnosisReportsModule {} 