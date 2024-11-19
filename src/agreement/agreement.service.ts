import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatService } from 'src/chat/chat.service';
import { GigachatService } from 'src/gigachat/gigachat.service';
import { PdfService } from 'src/pdf/pdf.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { DeleteResult, InsertResult, Repository } from 'typeorm';
import { Image } from '../images/image.entity';
import { ImagesService } from '../images/images.service';
import { AgreementDto } from './dtos/agreement-dto';
import { AgreementsListDto } from './dtos/agreements-list-dto';
import { CreateAgreementDto } from './dtos/create-agreement-dto';
import { EditAgreementDto } from './dtos/edit-agreement-dto';
import { AgreementImage } from './entities/agreement-image.entity';
import { Agreement } from './entities/agreement.entity';
import { AgreementMember } from './members/member.entity';
import { MemberService } from './members/member.service';
import { AgreementStep } from './step/entities/step.entity';

@Injectable()
export class AgreementService {
  constructor(
    @InjectRepository(Agreement)
    private readonly agreementRepository: Repository<Agreement>,
    @InjectRepository(AgreementMember)
    private readonly memberRepository: Repository<AgreementMember>,
    private readonly imagesService: ImagesService,
    @InjectRepository(AgreementImage)
    private readonly agreementImageRepository: Repository<AgreementImage>,
    private readonly memberService: MemberService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly gigachatService: GigachatService,
    private readonly userService: UserService,
    private readonly pdfService: PdfService,
  ) {}

  async createAgreement(
    userId: number,
    agreementDto: CreateAgreementDto,
  ): Promise<AgreementDto> {
    const agreementCreated: InsertResult = await this.agreementRepository
      .createQueryBuilder()
      .insert()
      .into(Agreement)
      .values({
        ...agreementDto,
      })
      .execute();

    const agreementFound: Agreement = await this.findAgreement(
      agreementCreated.identifiers[0].id,
    );

    const initiatorAdded: AgreementMember = await this.memberService.addMember(
      {
        userId,
        status: agreementDto.initiatorStatus,
      },
      agreementFound,

      'Подтвердил',
    );

    (agreementFound.members = [initiatorAdded]),
      (agreementFound.initiator = initiatorAdded);
    const user: User = await this.userService.findUser(userId);
    agreementFound.chat = await this.chatService.addChat([user]);
    const memberUpdated: Agreement =
      await this.agreementRepository.save(agreementFound);

    return new AgreementDto(memberUpdated, userId);
  }

  async getAgreements(
    userId: number,
    type:
      | 'В работе'
      | 'Отклонён'
      | 'У юриста'
      | 'В поиске юриста'
      | 'В процессе подтверждения'
      | 'Черновик'
      | 'Завершён',
  ): Promise<AgreementsListDto[]> {
    const agreements: Agreement[] = await this.agreementRepository.find({
      where: {
        members: {
          user: {
            id: userId,
          },
        },
        status: type,
      },
      relations: {
        members: {
          user: {
            image: {
              user: true,
            },
          },
        },
      },
    });

    return agreements.map(
      (agreement: Agreement): AgreementsListDto =>
        new AgreementsListDto(agreement),
    );
  }

  async getAgreement(
    agreement: Agreement,
    userId: number,
  ): Promise<AgreementDto> {
    return new AgreementDto(agreement, userId);
  }

  async editAgreement(
    agreement: Agreement,
    editDealDto: EditAgreementDto,
    userId: number,
  ): Promise<AgreementDto> {
    if (agreement.status !== 'Черновик') {
      throw new BadRequestException(
        'Вы не можете отредактировать этот договор, т.к. он уже был утвержден и подписан.',
      );
    }

    if (agreement.initiator.user.id !== userId) {
      throw new BadRequestException(
        'Вы не можете редактировать данный договор, т.к. не являетесь его инициатором. Обратитесь к инициатору в чате договора.',
      );
    }

    agreement.is_edited = false;

    if (editDealDto.dealText?.text) {
      const user: User = await this.userService.findUser(userId);

      if (editDealDto.dealText.generate) {
        const message: any = await this.gigachatService.sendMessage({
          model: 'GigaChat',
          messages: [
            {
              role: 'user',
              content: `Cоставь текст договора по следующему описанию.
            Какие данные я могу предоставить ${agreement.members
              .map((member: AgreementMember): string => {
                return `Участник договора ${member.status}: ${member.user.lastName} ${member.user.firstName} ${member.user.middleName}, паспортные данные \n
              Серия: ${member.user.personalData.serial}\n
              Номер: ${member.user.personalData.number}\n
              Дата рождения: ${member.user.BirthDate}\n
              Адрес прописки: ${member.user.personalData.address}\n
              Дата выдачи паспорта: ${member.user.personalData.passportDate}\n
              Место выдачи: ${member.user.personalData.authority}\n
              ИНН: ${member.user.personalData.TIN}\n
              `;
              })
              .join(', ')}\n
                        Все этапы договора: ${agreement.steps
                          .map((step: AgreementStep): string => {
                            return `Этап: ${step.title}\n
              Дата начала этапа: ${step.start}\n
              Дата окончания этапа: ${step.end}\n
              Ответственный за этап: ${step.user.user.lastName} ${step.user.user.firstName} ${step.user.user.middleName}, паспортные данные \n
              Серия: ${step.user.user.personalData.serial}\n
              Номер: ${step.user.user.personalData.number}\n
              Дата рождения: ${step.user.user.BirthDate}\n
              Адрес прописки: ${step.user.user.personalData.address}\n
              Дата выдачи паспорта: ${step.user.user.personalData.passportDate}\n
              Место выдачи: ${step.user.user.personalData.authority}\n
              ИНН: ${step.user.user.personalData.TIN}\n
              Статус ответственного за этап: ${step.user.status}\n
              Является ли этап платежным: ${step.payment ? 'Да' : 'Нет'}\n
              Описание: ${step.comment}\n
              `;
                          })
                          .join(', ')}\n
            Дата начала договора: ${agreement.start}\n
            Дата окончания договора: ${agreement.end}\n
            Только направь мне ответ в формате Markdown и без какого-либо комментария. Составь полный текст договора с подписями и данными сторон. Составляй без лишних разговоров, как есть. Сгенерируй Markdown-разметку c отступами.\n
            ${editDealDto.dealText.text}
            `,
            },
          ],
        });

        const checkout: any = await this.gigachatService.sendMessage({
          model: 'GigaChat',
          messages: [
            {
              role: 'assistant',
              content: message.content,
            },
            {
              role: 'user',
              content:
                'Допиши договор полностью. Составляй без лишних разговоров, как есть. Сгенерируй Markdown-разметку c отступами.\n',
            },
          ],
        });

        agreement.text = checkout.content.replace(/\n/g, '<br/>');
        agreement.text = agreement.text.replace('```', '');
      } else {
        agreement.text = editDealDto.dealText.text;
      }

      agreement.is_edited = true;
      agreement.pdf = await this.pdfService.convertMarkdownToPdf(
        agreement.text,
        user,
      );
    }

    const agreementSaved: Agreement = await this.agreementRepository.save({
      ...agreement,
      ...editDealDto,
      text: agreement.text,
    });

    return new AgreementDto(agreementSaved, userId);
  }

  async deleteAgreement(
    agreement: Agreement,
    userId: number,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    if (agreement.initiator.user.id !== userId) {
      throw new BadRequestException(
        'Вы не являетесь инициатором договора, чтобы его удалить.',
      );
    }

    if (agreement.status !== 'Черновик') {
      throw new BadRequestException(
        'Договор нельзя удалить, так как он уже был подписан',
      );
    }

    const deleteResult: DeleteResult = await this.agreementRepository.delete({
      id: agreement.id,
    });
    if (deleteResult.affected !== 1) {
      throw new BadRequestException('Не удалось удалить договор');
    }

    return {
      success: true,
      message: 'Договор был успешно удален',
    };
  }

  async confirmAgreement(
    userId: number,
    agreement: Agreement,
  ): Promise<{
    isConfirmed: boolean;
    message: string;
  }> {
    const member: AgreementMember = this.memberService.findMember(
      agreement,
      userId,
    );
    if (member.inviteStatus === 'Подтвердил') {
      throw new BadRequestException(
        'Вы уже подтвердили свое участие в договоре',
      );
    }

    if (
      agreement.members.filter(
        (member: AgreementMember) => member.inviteStatus === 'Приглашен',
      ).length > 1
    ) {
      throw new BadRequestException(
        'В договоре может быть только два подтвержденных участника.',
      );
    }

    const memberFound: AgreementMember = await this.memberRepository.findOne({
      where: {
        id: member.id,
      },
    });

    memberFound.inviteStatus = 'Подтвердил';

    await this.memberRepository.save(memberFound);

    return {
      isConfirmed: true,
      message: 'Вы успешно подтвердили участие в договоре',
    };
  }

  async declineAgreement(
    userId: number,
    agreement: Agreement,
  ): Promise<{ isDeclined: boolean; message: string }> {
    if (
      agreement.status === 'В работе' &&
      agreement.initiator.user.id !== userId
    ) {
      throw new BadRequestException(
        'Вы не можете разорвать договор если вы не являетесь его инициатором',
      );
    }

    await this.agreementRepository.save({
      ...agreement,
      members: [
        ...agreement.members.map(
          (
            member: AgreementMember,
          ): {
            inviteStatus: 'Приглашен' | 'Подтвердил' | 'Отклонил';
          } => {
            return {
              ...member,
              inviteStatus:
                member.user.id === userId ? 'Отклонил' : member.inviteStatus,
            };
          },
        ),
      ],
      status: agreement.status === 'В работе' ? 'Отклонён' : agreement.status,
    });

    return {
      isDeclined: true,
      message: 'Вы успешно отклонили участие в договоре',
    };
  }

  async enableAgreementAtWork(
    userId: number,
    agreement: Agreement,
  ): Promise<{
    message: string;
    agreement: AgreementDto;
  }> {
    if (agreement.initiator.user.id !== userId) {
      throw new BadRequestException(
        'Вы не можете включить договор в работу, так как вы не являетесь его инициатором.',
      );
    }
    agreement.status = 'В работе';
    const agreementAtWork: Agreement =
      await this.agreementRepository.save(agreement);

    return {
      message: 'Договор был успешно включён в работу.',
      agreement: new AgreementDto(agreementAtWork, userId),
    };
  }

  async completeAgreement(
    agreement: Agreement,
    userId: number,
  ): Promise<AgreementDto> {
    if (agreement.initiator.user.id !== userId) {
      throw new BadRequestException(
        'Вы не можете завершить договор, так как вы не являетесь его инициатором.',
      );
    }

    if (agreement.status !== 'В работе') {
      throw new BadRequestException('Договор не находится в работе.');
    }

    if (
      agreement.steps.find(
        (step: AgreementStep): boolean =>
          step.status === 'В процессе' || step.status == 'Ожидает',
      )
    ) {
      throw new BadRequestException('Не все шаги завершены.');
    }

    if (
      agreement.steps.every(
        (step: AgreementStep): boolean => step.status === 'Отклонён',
      )
    ) {
      throw new BadRequestException(
        'Вы не можете завершить договор, так как все шаги отклонены. Пожалуйста, отклоните договор.',
      );
    }

    const agreementSaved: Agreement = await this.agreementRepository.save({
      ...agreement,
      status: 'Завершён',
    });

    return new AgreementDto(agreementSaved, userId);
  }

  async rejectAgreement(
    agreement: Agreement,
    userId: number,
  ): Promise<AgreementDto> {
    if (agreement.initiator.user.id !== userId) {
      throw new BadRequestException(
        'Вы не можете отклонить договор, так как вы не являетесь его инициатором.',
      );
    }

    if (agreement.status !== 'В работе') {
      throw new BadRequestException('Договор не находится в работе.');
    }

    if (
      !agreement.steps.find((step: AgreementStep) => step.status === 'Отклонён')
    ) {
      throw new BadRequestException(
        'Чтобы разорвать договор должен быть отклонён хотя бы один шаг ',
      );
    }

    agreement.status = 'Отклонён';
    const agreementSaved: Agreement =
      await this.agreementRepository.save(agreement);
    await this.chatService.deleteMember(
      agreement.chat.id,
      userId,
      agreement.initiator.user.id,
    );
    return new AgreementDto(agreementSaved, userId);
  }

  async addAgreementPhotos(
    agreement: Agreement,
    images: string[],
    userId: number,
  ): Promise<AgreementDto> {
    if (agreement.images.length + images.length > 10) {
      throw new BadRequestException(
        'Соглашение может иметь не более 10 фотографий.',
      );
    }
    const imagesFound: AgreementImage[] = await Promise.all(
      images.map(async (image: string): Promise<AgreementImage> => {
        if (
          agreement.images.find(
            (i: AgreementImage): boolean => image === i.image.name,
          )
        ) {
          throw new BadRequestException('Фотография уже была добавлена.');
        }
        const imageFound: Image =
          await this.imagesService.getImageByName(image);
        if (!imageFound) {
          throw new NotFoundException(
            `Фотография с названием ${image} не существует`,
          );
        }
        const agreementImage: InsertResult = await this.agreementImageRepository
          .createQueryBuilder()
          .insert()
          .into(AgreementImage)
          .values({
            agreement: agreement,
            image: imageFound,
          })
          .execute();
        return await this.agreementImageRepository.findOne({
          where: {
            id: agreementImage.identifiers[0].id,
          },
        });
      }),
    );

    const agreementSaved: Agreement = await this.agreementRepository.save({
      ...agreement,
      images: [...imagesFound, ...agreement.images],
    });

    return new AgreementDto(agreementSaved, userId);
  }

  async findAgreement(id: number): Promise<Agreement> {
    const agreementFound: Agreement = await this.agreementRepository.findOne({
      where: {
        id,
      },
      relations: {
        images: true,
        members: {
          user: true,
        },
        steps: {
          images: {
            image: true,
          },
        },
        chat: true,
      },
    });

    if (!agreementFound) {
      throw new NotFoundException('Договор с этим идентификатором не найден');
    }

    return agreementFound;
  }
}
