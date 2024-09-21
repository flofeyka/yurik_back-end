import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { Image } from "./image.entity";
import { UserService } from "../user/user.service";
import { User } from "../user/entities/user.entity";

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image) private readonly imagesRepository: Repository<Image>,
    private readonly userService: UserService) {
  }


  async getImageByName(name: string): Promise<Image> {
    return await this.imagesRepository.findOne({
      where: { name }, relations: {
        user: true
      }
    });
  }

  async deleteImage(name: string): Promise<boolean> {
    const deleteResult: DeleteResult = await this.imagesRepository.delete({ name });
    if (!deleteResult) {
      throw new BadRequestException("Не удалось удалить фотографию.");
    }

    return true;
  }

  async addImage(name: string, userId: number): Promise<Image> {
    const user: User = await this.userService.findUser(userId);
    return await this.imagesRepository.save({ name, user });
  }
}