import { forwardRef, Module } from "@nestjs/common";
import { ImagesController } from './images.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Image } from "./image.entity";
import { ImagesService } from "./images.service";
import { UserModule } from "../user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([Image]), forwardRef(() => UserModule)],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService]
})
export class ImagesModule {}
