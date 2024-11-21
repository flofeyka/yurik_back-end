import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { Agent } from 'https';
import { Image } from 'src/images/image.entity';
import { InsertResult, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ImagesService } from '../images/images.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { CreateDialogDto } from './dtos/create-dialog-dto';
import { DialogsDto } from './dtos/dialogs-dto';
import { GigaChatDialog } from './entities/dialog.entity';
import { GigaChatMessage } from './entities/message.entity';

@Injectable()
export class GigachatService {
  constructor(
    @InjectRepository(GigaChatMessage)
    private readonly messagesRepository: Repository<GigaChatMessage>,
    @InjectRepository(GigaChatDialog)
    private readonly dialogsRepository: Repository<GigaChatDialog>,
    private readonly userService: UserService,
    private readonly httpService: HttpService,
    private readonly imagesService: ImagesService,
  ) { }

  async getDialogs(userId: number): Promise<DialogsDto[]> {
    const dialogsFound: GigaChatDialog[] = await this.dialogsRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: {
        messages: true,
        image: true,
      },
    });

    return dialogsFound.map((dialog: GigaChatDialog) => new DialogsDto(dialog));
  }

  async getMessages(id: UUID) {
    return await this.dialogsRepository.findOne({
      where: { id },
      relations: {
        messages: true,
      },
    });
  }

  async getToken() {
    const requestUID = uuidv4();

    try {
      const response = await this.httpService.axiosRef.post(
        'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
        {
          scope: process.env.GIGACHAT_CLIENT_SCOPE,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GIGACHAT_CLIENT_SECRET}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            RqUID: requestUID,
          },
          httpsAgent: new Agent({
            rejectUnauthorized: false,
          }),
        },
      );

      return response.data;
    } catch (e) {
      console.log(e);
    }
  }

  async sendToGigaChat({
    message,
    dialog_id,
  }: {
    message: string;
    dialog_id: UUID;
  }): Promise<{
    content: string;
    dialog: UUID;
    role: 'assistant';
  }> {
    const dialogFound: GigaChatDialog = await this.dialogsRepository.findOne({
      where: {
        id: dialog_id,
      },
      relations: {
        messages: true,
      },
    });

    if (!dialogFound) {
      throw new BadRequestException('Диалог с этим id не был найден');
    }
    const payload = {
      model: 'GigaChat',
      messages: [
        ...dialogFound.messages.map((message: GigaChatMessage) => {
          return {
            role: message.role,
            content: message.content,
          };
        }),
        {
          role: 'user',
          content: message,
        },
      ],
    };

    try {

      const newMessage = await this.sendMessage(payload);

      const userMessage: GigaChatMessage = await this.messagesRepository.save({
        content: message,
        dialog: dialogFound,
        role: 'user'
      });
      const assistantMessage: GigaChatMessage =
        await this.messagesRepository.save({
          content: newMessage.content,
          dialog: dialogFound,
          role: 'assistant',
        });
      await this.dialogsRepository.save({
        ...dialogFound,
        messages: [...dialogFound.messages, userMessage, assistantMessage],
      });
      return newMessage;
    } catch (e) {
      console.log(e);
    }
  }

  public async sendMessage(payload) {
    const requestAccessToken = await this.getToken();
    console.log(payload.messages[0].content);

    const response = await this.httpService.axiosRef.post(
      'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
      payload && JSON.stringify(payload),
      {
        headers: {
          Authorization: `Bearer ${requestAccessToken.access_token}`,
        },
        httpsAgent: new Agent({
          rejectUnauthorized: false,
        }),
        responseType: 'json',
      },
    ).catch((e) => {
      console.log(e)
      throw new BadRequestException("Не удалось отправить сообщение");
    });


    return {...response.data.choices[0].message, type: "Gigachat"};
  }

  async createNewDialog(
    userId: number,
    createDialogDto: CreateDialogDto,
  ): Promise<DialogsDto> {
    const user: User = await this.userService.findUser(userId);
    const image: Image | null = createDialogDto.image
      ? await this.imagesService.getImageByName(createDialogDto.image)
      : null;
    const newDialog: InsertResult = await this.dialogsRepository
      .createQueryBuilder()
      .insert()
      .values([
        {
          ...createDialogDto,
          user,
          image,
        },
      ])
      .execute().catch((e: Error) => {
        throw new BadRequestException("Вы не можете сделать картинку ")
      }) ;

    const dialog: GigaChatDialog = await this.dialogsRepository.findOne({
      where: { id: newDialog.identifiers[0].id },
      relations: {
        messages: true,
        image: true,
      },
    });

    return new DialogsDto(dialog);
  }
}
