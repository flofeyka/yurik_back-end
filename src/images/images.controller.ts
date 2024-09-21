import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { Response } from "express";
import { v4 as uuid } from "uuid";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ImagesService } from "./images.service";
import { AuthGuard } from "../auth/auth.guard";
import { ImageGuard } from "./guards/image.guard";
import { RequestType } from "../../types/types";
import { Image } from "./image.entity";


@ApiTags("Images API")
@Controller("images")
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {
  }

  @Post("/upload")
  @UseGuards(AuthGuard)
  @UseInterceptors(FilesInterceptor("file", 10, {
    storage: diskStorage({
      destination: "./uploads",
      filename: (req, file: Express.Multer.File, cb) => {
        const fileExtension: string = file.originalname.split(".")[1];
        const newFileName: string = uuid() + "." + fileExtension;

        cb(null, newFileName);

      }
    }),
    fileFilter: (req, file: Express.Multer.File, cb) => {
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(null, false);
      }

      cb(null, true);
    }
  }))
  async uploadPhotos(@UploadedFiles() files: Express.Multer.File[], @Req() request: RequestType): Promise<any> {
    if (!files) {
      throw new BadRequestException("Ошибка валидации картинок");
    }


    return await Promise.all(files.map(async (file: Express.Multer.File) => {
      const image: Image = await this.imagesService.addImage(file.filename, request.user.id);
      return {
        filePath: `${request.protocol}://${request.get("Host")}/api/images/picture/${file.filename}`,
        fileName: file.filename,
        image
      };
    }));
  }


  @Get("/picture/:filename")
  async getPicture(@Param("filename") filename: string, @Res() res: Response): Promise<void> {
    res.sendFile(filename, { root: "./uploads" });
  }


  @ApiOperation({ summary: "Получение фотографии по имени" })
  @Get("/:name")
  async getPhotoByName(@Param("name") name: string) {
    return await this.imagesService.getImageByName(name);
  }

  @ApiOperation({ summary: "Удаление фотографии по имени" })
  @Delete("/:name")
  @UseGuards(AuthGuard, ImageGuard)
  async deletePhoto(@Param("name") name: string) {
    return await this.imagesService.deleteImage(name);
  }
}
