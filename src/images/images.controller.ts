import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { RequestType } from '../../types/types';
import { AuthGuard } from '../auth/auth.guard';
import { ImageDto } from './dtos/ImageDto';
import { ImageGuard } from './guards/image.guard';
import { ImagesService } from './images.service';

@ApiTags('Images API')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) { }

  @ApiOperation({ summary: "Загрузить фотографию в систему" })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        files: {
          type: 'file',
          format: 'image',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: [
      {
        "filePath": "http://localhost:3000/api/images/picture/c9cc3ef3-11ec-48b5-82ef-c0f88285d8e2.jpg",
        "fileName": "c9cc3ef3-11ec-48b5-82ef-c0f88285d8e2.jpg",
        "image": {
          "id": 45,
          "name": "c9cc3ef3-11ec-48b5-82ef-c0f88285d8e2.jpg",
          "userId": 10,
          "imgUrl": "http://localhost:3000/api/images/picture/c9cc3ef3-11ec-48b5-82ef-c0f88285d8e2.jpg"
        }
      }
    ]
  })
  @Post('/upload')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FilesInterceptor('file', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file: Express.Multer.File, cb) => {
          const fileExtension: string = file.originalname.split('.')[1];
          const newFileName: string = uuid() + '.' + fileExtension;

          cb(null, newFileName);
        },
      }),
      fileFilter: (req, file: Express.Multer.File, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(null, false);
        }

        cb(null, true);
      },
    }),
  )
  async uploadPhotos(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() request: RequestType,
  ): Promise<any> {
    if (!files) {
      throw new BadRequestException('Ошибка валидации картинок');
    }

    return await Promise.all(
      files.map(async (file: Express.Multer.File) => {
        const image: ImageDto = await this.imagesService.addImage(
          file.filename,
          request.user.id,
        );
        return {
          filePath: `${request.protocol}://${request.get('Host')}/api/images/picture/${file.filename}`,
          fileName: file.filename,
          image,
        };
      }),
    );
  }

  @ApiOperation({ summary: 'Получение самой фотографии.' })
  @Get('/picture/:filename')
  async getPicture(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    res.sendFile(filename, { root: './uploads' });
  }

  @ApiOperation({ summary: 'Получение обьекта фотографии по имени' })
  @ApiResponse({
    example: {
      "id": 45,
      "name": "c9cc3ef3-11ec-48b5-82ef-c0f88285d8e2.jpg",
      "user": {
        "id": 10,
        "firstName": "Данил",
        "lastName": "Баширов",
      }
    }
  })
  @Get('/:name')
  async getPhotoByName(@Param('name') name: string) {
    return await this.imagesService.getImageByName(name);
  }

  @ApiOperation({ summary: 'Удаление фотографии по имени' })
  @ApiResponse({ status: HttpStatus.OK, example: true})
  @Delete('/:name')
  @UseGuards(AuthGuard, ImageGuard)
  async deletePhoto(@Param('name') name: string) {
    return await this.imagesService.deleteImage(name);
  }
}
