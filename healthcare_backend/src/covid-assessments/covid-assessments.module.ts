import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CovidAssessmentsController } from './covid-assessments.controller';
import { CovidAssessmentsService } from './covid-assessments.service';
import { CovidAssessment, CovidAssessmentSchema } from '../schemas/covid-assessment.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CovidAssessment.name, schema: CovidAssessmentSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CovidAssessmentsController],
  providers: [CovidAssessmentsService],
  exports: [CovidAssessmentsService],
})
export class CovidAssessmentsModule {} 