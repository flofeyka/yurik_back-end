import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppService } from 'src/app.service';
import { LegalInformationDto } from 'src/user/dtos/legal-information-dto';
import { PersonalData } from 'src/user/entities/user.personal_data';
import { InsertResult, Repository } from 'typeorm';
import { ImageDto } from '../images/dtos/ImageDto';
import { ImagesService } from '../images/images.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { AgreementDto, AgreementStepDto } from './dtos/agreement-dto';
import { AgreementsListDto } from './dtos/agreements-list-dto';
import { CreateAgreementDto } from './dtos/create-agreement-dto';
import { EditAgreementDto } from './dtos/edit-agreement-dto';
import { EditStepsDto, Step, StepDto } from './dtos/edit-steps-dto';
import { AgreementImage } from './entities/agreement-image.entity';
import { Agreement } from './entities/agreement.entity';
import { Lawyer } from './lawyer/lawyer.entity';
import { AgreementMember } from './members/member.entity';
import { AgreementStep } from './step/entities/step.entity';
import { MemberService } from './members/member.service';

@Injectable()
export class AgreementService {
  constructor(
    @InjectRepository(Agreement)
    private readonly agreementRepository: Repository<Agreement>,
    @InjectRepository(AgreementMember) private readonly memberRepository: Repository<AgreementMember>,
    private readonly imagesService: ImagesService,
    @InjectRepository(AgreementImage) private readonly agreementImageRepository: Repository<AgreementImage>,
    private readonly memberService: MemberService,
  ) { }


  async getAgreements(userId: number, type: | 'В работе'
    | 'Отклонён'
    | 'У юриста'
    | 'В поиске юриста'
    | 'В процессе подтверждения'
    | 'Черновик'
    | 'Завершён'): Promise<AgreementsListDto[]> {
    const agreements: Agreement[] = await this.agreementRepository.find({
      where: {
        members: {
          user: {
            id: userId,
          },
        },
        status: type
      },
      relations: {
        members: {
          user: {
            image: {
              user: true
            }
          }
        }
      }
    });

    console.log(agreements[0]);


    return agreements.map(
      (agreement: Agreement) => new AgreementsListDto(agreement),
    );
  }

  async getAgreement(agreement: Agreement, userId: number): Promise<AgreementDto> {
    return new AgreementDto(agreement, userId);
  }

  async editAgreement(
    agreement: Agreement,
    editDealDto: EditAgreementDto,
    userId: number
  ): Promise<AgreementDto> {
    const agreementSaved: Agreement = await this.agreementRepository.save({
      ...agreement,
      ...editDealDto
    });

    return new AgreementDto(agreementSaved, userId);
  }

  async addAgreementPhotos(agreement: Agreement, images: string[], userId): Promise<AgreementDto> {
    if (agreement.images.length + images.length > 10) {
      throw new BadRequestException("Соглашение может иметь не более 10 фотографий.");
    }
    const imagesFound: AgreementImage[] = await Promise.all(
      images.map(async (image: string) => {
        if (agreement.images.find(i => image === i.image.name)) {
          throw new BadRequestException("Фотография уже была добавлена.");
        }
        const imageFound =
          await this.imagesService.getImageByName(image);
        if (!imageFound) {
          throw new NotFoundException(
            `Фотография с названием ${image} не существует`,
          );
        }
        const agreementImage = await this.agreementImageRepository.createQueryBuilder().insert().into(AgreementImage).values({
          agreement: agreement,
          image: imageFound,
        }).execute();
        return await this.agreementImageRepository.findOne({
          where: {
            id: agreementImage.identifiers[0].id,
          },
        });
      }));

    const agreementSaved: Agreement = await this.agreementRepository.save({
      ...agreement,
      images: [...imagesFound, ...agreement.images]
    });

    return new AgreementDto(agreementSaved, userId);
  }

  async createAgreement(
    userId: number,
    agreementDto: CreateAgreementDto,
  ): Promise<AgreementDto> {
    const agreementCreated: InsertResult = await this.agreementRepository
      .createQueryBuilder()
      .insert()
      .into(Agreement)
      .values({
        ...agreementDto
      })
      .execute();

    const agreementFound = await this.findAgreement(
      agreementCreated.identifiers[0].id,
    );

    const initiatorAdded = await this.memberService.addMember(
      {
        userId,
        status: agreementDto.initiatorStatus
      },
      agreementFound,
      agreementDto.personalData,
      "Подтвердил"
    );

    const memberUpdated = await this.agreementRepository.save({
      ...agreementFound,
      members: [initiatorAdded],
      initiator: initiatorAdded,
    });

    return new AgreementDto(memberUpdated, userId);
  }

  async confirmAgreement(
    userId: number,
    agreement: Agreement,
  ): Promise<{
    isConfirmed: boolean;
    message: string;
  }> {
    const member: AgreementMember = this.memberService.findMember(agreement, userId);
    if (member.inviteStatus === 'Подтвердил') {
      throw new BadRequestException(
        'Вы уже подтвердили свое участие в договоре',
      );
    }

    const memberFound: AgreementMember = await this.memberRepository.findOne({
      where: {
        id: member.id
      }
    });

    memberFound.inviteStatus = 'Подтвердил';

    await this.memberRepository.save(memberFound)


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
        ...agreement.members.map((member: AgreementMember) => {
          return {
            ...member,
            inviteStatus:
              member.user.id === userId ? 'Отклонил' : member.inviteStatus,
          };
        }),
      ],
      status: agreement.status === 'В работе' ? 'Отклонён' : agreement.status,
    });

    return {
      isDeclined: true,
      message: 'Вы успешно отклонили участие в договоре',
    };
  }

  async findAgreement(id: number): Promise<Agreement> {
    const agreementFound: Agreement = await this.agreementRepository.findOne({
      where: {
        id
      }, relations: {
        images: true,
        members: {
          user: true
        },
        steps: {
          images: {
            image: true
          }
        }
      }
    });

    if (!agreementFound) {
      throw new NotFoundException('Договор с этим идентификатором не найден');
    }

    return agreementFound;
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

    const agreementAtWork: Agreement = await this.agreementRepository.save({
      ...agreement,
      status: 'В работе',
    });

    return {
      message: 'Договор был успешно включён в работу.',
      agreement: new AgreementDto(agreementAtWork, userId),
    };
  }
}
