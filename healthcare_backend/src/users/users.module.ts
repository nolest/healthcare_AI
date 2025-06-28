import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from '../schemas/user.schema';
import { Measurement, MeasurementSchema } from '../schemas/measurement.schema';
import { ImageUrlService } from '../services/image-url.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Measurement.name, schema: MeasurementSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, ImageUrlService],
  exports: [UsersService],
})
export class UsersModule {} 