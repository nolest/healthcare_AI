import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AbnormalRangesService } from './abnormal-ranges.service';
import { AbnormalRangesController } from './abnormal-ranges.controller';
import { AbnormalRange, AbnormalRangeSchema } from '../schemas/abnormal-range.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AbnormalRange.name, schema: AbnormalRangeSchema }
    ])
  ],
  controllers: [AbnormalRangesController],
  providers: [AbnormalRangesService],
  exports: [AbnormalRangesService]
})
export class AbnormalRangesModule {} 