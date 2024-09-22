import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { Image } from "./image.entity";
import { UserService } from "../user/user.service";
import { User } from "../user/entities/user.entity";
import { ImageDto } from "./dtos/ImageDto";

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image) private readonly imagesRepository: Repository<Image>,
    private readonly userService: UserService) {
  }


  async getImageByName(name: string): Promise<ImageDto> {
    const image: Image = await this.imagesRepository.findOne({
      where: { name }, relations: {
        user: true
      }
    });

    return new ImageDto(image);
  }

  async deleteImage(name: string): Promise<boolean> {
    const deleteResult: DeleteResult = await this.imagesRepository.delete({ name });
    if (!deleteResult) {
      throw new BadRequestException("Не удалось удалить фотографию.");
    }

    return true;
  }

  async addImage(name: string, userId: number): Promise<ImageDto> {
    const user: User = await this.userService.findUser(userId);
    const imageAdded: Image = await this.imagesRepository.save({ name, user });

    return new ImageDto(imageAdded);
  }
}