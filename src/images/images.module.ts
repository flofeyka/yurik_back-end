import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { Image } from './image.entity';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { forwardRef, Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([Image]), forwardRef(() => UserModule)],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
