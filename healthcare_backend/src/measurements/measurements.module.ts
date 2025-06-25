import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MeasurementsService } from './measurements.service';
import { MeasurementsController } from './measurements.controller';
import { Measurement, MeasurementSchema } from '../schemas/measurement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Measurement.name, schema: MeasurementSchema }]),
  ],
  controllers: [MeasurementsController],
  providers: [MeasurementsService],
  exports: [MeasurementsService],
})
export class MeasurementsModule {} 