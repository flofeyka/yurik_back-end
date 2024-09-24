import { HttpService } from "@nestjs/axios";
import { BadRequestException, Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { Agent } from "https";
import { GigaChatMessage } from "./entities/message.entity";
import { InsertResult, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { GigaChatDialog } from "./entities/dialog.entity";
import { UUID } from "crypto";
import { UserService } from "../user/user.service";
import { User } from "../user/entities/user.entity";
import { DialogsDto } from "./dtos/dialogs-dto";
import { CreateDialogDto } from "./dtos/create-dialog-dto";
import { Image } from "../images/image.entity";
import { ImagesService } from "../images/images.service";
import { ImageDto } from "../images/dtos/ImageDto";

@Injectable()
export class GigachatService {
  constructor(
    @InjectRepository(GigaChatMessage) private readonly messagesRepository: Repository<GigaChatMessage>,
    @InjectRepository(GigaChatDialog) private readonly dialogsRepository: Repository<GigaChatDialog>,
    private readonly userService: UserService,
    private readonly httpService: HttpService,
    private readonly imagesService: ImagesService
  ) {
  }

  async getDialogs(userId: number): Promise<DialogsDto[]> {
    const dialogsFound: GigaChatDialog[] = await this.dialogsRepository.find({
      where: {
        user: {
          id: userId
        }
      }, relations: {
        messages: true,
        image: true
      }
    });

    return dialogsFound.map((dialog: GigaChatDialog) => new DialogsDto(dialog));
  }

  async getMessages(id: UUID) {
    return await this.dialogsRepository.findOne({where: {id}, relations: {
      messages: true
    }})
  }

  async getToken() {
    const requestUID = uuidv4();

    try {
      const response = await this.httpService.axiosRef.post("https://ngw.devices.sberbank.ru:9443/api/v2/oauth", {
        scope: process.env.GIGACHAT_CLIENT_SCOPE
      }, {
        headers: {
          "Authorization": `Bearer ${process.env.GIGACHAT_CLIENT_SECRET}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "RqUID": requestUID
        },
        httpsAgent: new Agent({
          rejectUnauthorized: false
        })
      });


      return response.data;
    } catch (e) {
      console.log(e);
    }

  }

  async sendToGigaChat({ message, dialog_id }: { message: string; dialog_id: UUID }): Promise<{
    content: string,
    dialog: UUID,
    role: "assistant"
  }> {
    const dialogFound: GigaChatDialog = await this.dialogsRepository.findOne({
      where: {
        id: dialog_id
      },
      relations: {
        messages: true
      }
    });


    if (!dialogFound) {
      throw new BadRequestException("Диалог с этим id не был найден");
    }

    const requestAccessToken = await this.getToken();

    const payload = {
      model: "GigaChat",
      messages: [
        ...dialogFound.messages.map((message: GigaChatMessage) => {
          return {
            role: message.role,
            content: message.content
          };
        }),
        {
          role: "user",
          content: message
        }
      ]
    };

    try {
      const response = await this.httpService.axiosRef.post(
        "https://gigachat.devices.sberbank.ru/api/v1/chat/completions",
        JSON.stringify(payload),
        {
          headers: {
            Authorization: `Bearer ${requestAccessToken.access_token}`
          },
          httpsAgent: new Agent({
            rejectUnauthorized: false
          }),
          responseType: "json"
        }
      );

      const newMessage = response.data.choices[0].message;

      const userMessage: GigaChatMessage = await this.messagesRepository.save({
        content: message,
        dialog: dialogFound,
        role: "user"
      });
      const assistantMessage: GigaChatMessage = await this.messagesRepository.save({
        content: newMessage.content,
        dialog: dialogFound,
        role: "assistant"
      });
      await this.dialogsRepository.save({
        ...dialogFound,
        messages: [...dialogFound.messages, userMessage, assistantMessage]
      });
      return newMessage;

    } catch (e) {
      console.log(e);
    }
  }

  async createNewDialog(userId: number, createDialogDto: CreateDialogDto): Promise<DialogsDto> {
    const user: User = await this.userService.findUser(userId);
    const image: ImageDto | null = createDialogDto.image ? await this.imagesService.getImageByName(createDialogDto.image) : null;
    const newDialog: InsertResult = await this.dialogsRepository.createQueryBuilder().insert().values([{
      ...createDialogDto,
      user,
      image
    }]).execute();

    const dialog: GigaChatDialog = await this.dialogsRepository.findOne({
      where: { id: newDialog.identifiers[0].id }, relations: {
        messages: true,
        image: true
      }
    });

    return new DialogsDto(dialog);
  }
}
