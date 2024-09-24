import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { UUID } from 'crypto';
import { RequestType } from '../../../types/types';
import { ImageDto } from '../dtos/ImageDto';
import { ImagesService } from '../images.service';
import { Image } from '../image.entity';

export class ImageGuard implements CanActivate {
  constructor(private readonly imageService: ImagesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: RequestType = context.switchToHttp().getRequest();

      const name: UUID =
        request.body.name || request.params.name || request.query.name;
      const imageFound: Image = await this.imageService.getImageByName(name);

      if (!imageFound) {
        throw new NotFoundException(
          'Фотография с таким именем не была найдена',
        );
      }

      if (imageFound.user.id !== request.user.id) {
        throw new BadRequestException(
          'Вы не являетесь владельцем данной фотографии, чтобы совершать это действие',
        );
      }

      return true;
    } catch (e) {
      return false;
    }
  }
}
