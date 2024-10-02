import { Image } from '../image.entity';

export class ImageDto {
  id: string;
  name: string;
  userId: number;
  imgUrl: string;

  constructor(model: Image) {
    this.id = model?.id;
    this.name = model?.name;
    this.userId = model?.user?.id;
    this.imgUrl = model?.name && `${process.env.API_URL}/images/picture/${model?.name}`;
  }
}
