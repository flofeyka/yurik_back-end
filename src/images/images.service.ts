import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { ImageDto } from './dtos/ImageDto';
import { Image } from './image.entity';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imagesRepository: Repository<Image>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async getImageByName(name: string): Promise<Image> {
    const image: Image = await this.imagesRepository.findOne({
      where: { name },
      relations: {
        user: true,
      },
    });

    return image;
  }

  async deleteImage(name: string): Promise<boolean> {
    const deleteResult: DeleteResult = await this.imagesRepository.delete({
      name,
    });
    if (!deleteResult) {
      throw new BadRequestException('Не удалось удалить фотографию.');
    }

    return true;
  }

  async addImage(name: string, userId: number): Promise<ImageDto> {
    const user: User = await this.userService.findUser(userId);
    const imageAdded: Image = await this.imagesRepository.save({ name, user });

    return new ImageDto(imageAdded);
  }
}
