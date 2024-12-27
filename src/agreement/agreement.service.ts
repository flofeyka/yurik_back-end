import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppService } from 'src/app.service';
import { ChatService } from 'src/chat/chat.service';
import { GigachatService } from 'src/gigachat/gigachat.service';
import { PdfService } from 'src/pdf/pdf.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { DeleteResult, InsertResult, Repository } from 'typeorm';
import { Image } from '../images/image.entity';
import { ImagesService } from '../images/images.service';
import { Deposit } from './deposit/deposit.entity';
import { AgreementDepositService } from './deposit/deposit.service';
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
    private readonly httpService: HttpService,
    private readonly depositService: AgreementDepositService,
    @InjectRepository(AgreementStep)
    private readonly stepRepository: Repository<AgreementStep>,
    private readonly appService: AppService,
    @InjectRepository(Deposit) private readonly depositRepository: Repository<Deposit>
  ) {}

  async createAgreement(
    userId: number,
    agreementDto: CreateAgreementDto,
  ): Promise<AgreementDto> {
    const depositFound: Deposit =
      await this.depositService.getUserDeposit(userId);
    if (!depositFound) {
      throw new NotFoundException('Создайте договорный счет, чтобы продолжить');
    }

    if (depositFound.count < 1) {
      throw new BadRequestException(
        'Недостаточно средств на счете. Пополните договорный счёт.',
      );
    }

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

    depositFound.discount = 0;
    depositFound.count = depositFound.count - 1;
    await this.depositRepository.save(depositFound);

    const initiatorAdded: AgreementMember = await this.memberService.addMember(
      {
        userId,
        status: agreementDto.initiatorStatus,
      },
      agreementFound,
    );

    agreementFound.members = [initiatorAdded];
    agreementFound.initiator = initiatorAdded;
    const user: User = await this.userService.findUser(userId);
    agreementFound.chat = await this.chatService.addChat([user], agreementFound.title,);
    const memberUpdated: Agreement = await this.agreementRepository.save(agreementFound);

    return new AgreementDto(memberUpdated, userId);
  }

  async getAgreements(
    userId: number,
    type:
      | 'Активный'
      | 'Расторгнут'
      | 'У юриста'
      | 'В поиске юриста'
      | 'Требуется действие'
      | 'Черновик'
      | 'Выполнен',
  ): Promise<AgreementsListDto[]> {
    const member = await this.memberRepository.find({
      where: {
        user: {
          id: userId,
        },
        agreement: {
          status: type,
        },
      },
      relations: {
        agreement: {
          members: {
            user: {
              image: true,
            },
          },
          chat: true,
        },
      },
    });

    return member
      .map((data) => data.agreement)
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())
      .map(
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
        if (editDealDto.dealText.text.length > 150) {
          throw new BadRequestException(
            'Длина договора не может быть больше 150 символов',
          );
        }

        const message = await this.gigachatService.sendMessage({
          model: 'GigaChat-Pro',
          messages: [
            {
              role: 'user',
              content: `Составьте официальный договор на тему «${agreement.title}» с описанием «${editDealDto.dealText.text}» Договор должен быть полностью оформлен как официальный документ, без лишних комментариев или примеров.
                Инструкции:
                Используйте предоставленные данные о заказчике, испонителе и перечене работ для заполнения всех необходимых разделов договора.
                Написан в официально-деловом стиле.
                Договор не предполагает содержание приложений. 
                Структурируйте договор с учетом стандартных разделов: преамбула, предмет договора, права и обязанности сторон, сроки выполнения работ, порядок расчетов, ответственность сторон, порядок разрешения споров, заключительные положения и прочее.
                Включите данные сторон, этапы выполнения работ, условия оплаты и другие важные детали.
                Включите пункт ,что договор подписывается в приложении и считается действительным без физической подписи сторон. 
                Исключить раздел подписи сторон.
                Форматируйте текст с отступами и абзацами для удобства чтения.
                Заполнить все поля в договоре, нельзя оставлять их пустыми.
                Данные для договора: \n
                Дата начала договора: ${new Date(agreement.start).getUTCDate() + '.' + (new Date(agreement.start).getUTCMonth() + 1) + '.' + new Date(agreement.start).getUTCFullYear()}\n
                Дата окончания договора: ${new Date(agreement.end).getUTCDate() + '.' + (new Date(agreement.end).getUTCMonth() + 1) + '.' + new Date(agreement.end).getUTCFullYear()}\n
              ${agreement.members
                .map(
                  (member: AgreementMember): string => `${member.status}:\n
                  ФИО: ${member.user.lastName} ${member.user.firstName} ${member.user.middleName}, 
                  паспортные данные: \n
                  Серия: ${member.user.personalData.serial}\n
                  Номер: ${member.user.personalData.number}\n
                  Дата рождения: ${member.user.BirthDate}\n
                  Адрес прописки: ${member.user.personalData.address}\n
                  Дата выдачи паспорта: ${member.user.personalData.passportDate}\n
                  Место выдачи: ${member.user.personalData.authority}\n
                  ИНН: ${member.user.personalData.TIN}\n
              `,
                )
                .join(', ')}\n
                        Перечень работ: ${agreement.steps
                          .map(
                            (
                              step: AgreementStep,
                            ): string => `Этап: ${step.title}\n
                            Дата начала этапа: ${new Date(step.start).getUTCDate() + '.' + (new Date(step.start).getUTCMonth() + 1) + '.' + new Date(step.start).getUTCFullYear()}\n
                            Дата конца этапа: ${new Date(step.end).getUTCDate() + '.' + (new Date(step.end).getUTCMonth() + 1) + '.' + new Date(step.end).getUTCFullYear()}\n
                            Оплата за этап: ${step.payment && step.payment?.price > 0 ? `${step.payment.price}` : 'отсутствует'}\n
                            Описание: ${step.comment}\n 
                            `,
                          )
                          .join(', ')}\n
                          Дата заключения договора ${new Date(Date.now()).getUTCDate() + '.' + (new Date(Date.now()).getUTCMonth() + 1) + '.' + new Date(Date.now()).getUTCFullYear()}\n
                          Вставитьте данные персональные данные заказчика и исполнителя вначале договора.
            Пришлите мне сам текст договора без лишних комментариев, примечаний и нижних полей.\n
            `,
            },
          ],
        });
        agreement.text = message.content;
      } else {
        agreement.text = editDealDto.dealText.text;
      }

      agreement.is_edited = true;
      agreement.pdf = await this.pdfService.convertMarkdownToPdf(
        agreement.text,
        user,
      );
      agreement.text = agreement.text.replace('*', '');
      agreement.text = agreement.text.replace('**', '');
      agreement.text = agreement.text.replace('#', '');
      agreement.text = agreement.text.replace('##', '');
      agreement.text = agreement.text.replace('###', '');
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
        (member: AgreementMember) => member.inviteStatus === 'Подтвердил',
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
      relations: {
        user: {
          telegram_account: true,
        },
      },
    });

    memberFound.inviteStatus = 'Подтвердил';

    await this.memberRepository.save(memberFound);
    if (
      agreement.members.filter(
        (member: AgreementMember) => member.inviteStatus === 'Подтвердил',
      ).length === 1
    ) {
      agreement.status = 'Активный';
      await this.appService.sendNotification(
        `<b>${memberFound.user.firstName} ${memberFound.user.lastName}</b> подписал договор <b>«${agreement.title}»</b>. Договор утвержден обеими сторонами и вступил в силу.`,
        agreement.members.find(
          (member: AgreementMember) => member.user.id !== userId,
        ).user.telegram_account.telegramID,
      );
      const step = await this.stepRepository.findOne({
        where: {
          order: 1,
          agreement: {
            id: agreement.id,
          },
        },
      });
      step.status = 'В процессе';
      await this.stepRepository.save(step);
    } else {
      await this.httpService.axiosRef.post(
        'https://bot.yurkitgbot.ru/send/agreement/approve',
        {
          agreement_id: agreement.id,
        },
      );
      agreement.status = 'Требуется действие';
    }
    await this.agreementRepository.save(agreement);
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
      agreement.status === 'Активный' &&
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
      status:
        agreement.status === 'Активный' ||
        agreement.status === 'Требуется действие'
          ? 'Расторгнут'
          : agreement.status,
    });

    return {
      isDeclined: true,
      message: 'Вы успешно отклонили участие в договоре',
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

    if (agreement.status !== 'Активный') {
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
      status: 'Выполнен',
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

    const anotherMember = agreement.members.find(
      (member) => member.user.id !== userId,
    );

    if (agreement.status !== 'Активный') {
      throw new BadRequestException('Договор не находится в работе.');
    }

    const steps = await this.stepRepository.find({
      where: {
        agreement: {
          id: agreement.id,
        },
      },
    });

    steps.forEach((step: AgreementStep) => {
      if (step.status !== 'Завершён') {
        step.status = 'Отклонён';
        this.stepRepository.save(step);
      }
    });

    agreement.status = 'Расторгнут';
    const agreementSaved: Agreement =
      await this.agreementRepository.save(agreement);
    agreementSaved.steps = steps;
    await this.chatService
      .deleteMember(agreement.chat.id, userId, agreement.initiator.user.id)
      .catch((e) => console.log(e));
    await this.appService.sendNotification(
      `${agreement.initiator.user.firstName} ${agreement.initiator.user.lastName} расторгнул договор ${agreement.title}`,
      anotherMember.user.telegram_account.telegramID,
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
          user: {
            personalData: true,
            telegram_account: true,
          },
        },
        steps: {
          images: {
            image: true,
          },
        },
        chat: true,
        pdf: true,
      },
    });

    if (!agreementFound) {
      throw new NotFoundException('Договор с этим идентификатором не найден');
    }

    return agreementFound;
  }
}
