import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InsertResult, Repository } from "typeorm";
import { v4 as uuid } from "uuid";
import { User } from "../user/entities/user.entity";
import { UserService } from "../user/user.service";
import { AgreementDto, AgreementStepDto } from "./dtos/agreement-dto";
import { CreateAgreementDto } from "./dtos/create-agreement-dto";
import { Agreement, Step } from "./entities/agreement.entity";
import { AgreementMember } from "./entities/agreement.member.entity";
import { AgreementStep } from "./entities/agreement.step.entity";
import { Lawyer } from "./entities/agreement.lawyer.entity";
import { AppService } from "src/app.service";
import { ImagesService } from "../images/images.service";
import { ImageDto } from "../images/dtos/ImageDto";
import { AgreementsListDto } from "./dtos/agreements-list-dto";
import { EditAgreementDto } from "./dtos/edit-agreement-dto";
import { EditStepsDto } from "./dtos/edit-steps-dto";

@Injectable()
export class AgreementService {
  constructor(
    @InjectRepository(Agreement) private readonly agreementRepository: Repository<Agreement>,
    @InjectRepository(AgreementMember) private readonly memberRepository: Repository<AgreementMember>,
    @InjectRepository(AgreementStep) private readonly stepRepository: Repository<AgreementStep>,
    @InjectRepository(Lawyer) private readonly lawyerRepository: Repository<Lawyer>,
    private readonly userService: UserService,
    private readonly appService: AppService,
    private readonly imagesService: ImagesService
  ) {
  }


  async getAgreements(userId: number): Promise<AgreementsListDto[]> {
    const agreements: Agreement[] = await this.agreementRepository.find({
      where: {
        members: {
          user: {
            id: userId
          }
        }
      }, relations: {
        members: {
          user: true
        },
        steps: {
          user: {
            user: true
          }
        }
      }
    });

    console.log(agreements[0].steps[0].user);

    return agreements.map((agreement: Agreement) => new AgreementsListDto(agreement));

  }

  async editAgreement(agreement: Agreement, editDealDto: EditAgreementDto): Promise<AgreementDto> {
    const agreementSaved: Agreement =  await this.agreementRepository.save({
      ...agreement,
      ...editDealDto
    });


    return new AgreementDto(agreementSaved);
  }

  async sendToLawyer(userId: number, agreement: Agreement) {
    if (agreement.initiator.user.id !== userId) {
      throw new BadRequestException("Вы не можете пригласить юриста в договор, так как не являетесь его инициатором.");
    }

    if (agreement.status === "Отклонён") {
      throw new BadRequestException("Вы не можете пригласить юриста в отклоненный договор");
    }

    if (agreement.status === "У юриста") {
      throw new BadRequestException("Договор уже находится на рассмотрении у юриста.");
    }

    if (agreement.status === "В поиске юриста") {
      throw new BadRequestException("Договор уже в списке очереди у юриста.");
    }

    await this.agreementRepository.save({
      ...agreement,
      status: "В поиске юриста"
    });

    return true;
  }

  async getLawyerAgreements(): Promise<AgreementDto[]> {
    const agreements: Agreement[] = await this.agreementRepository.find({
      where: {
        status: "В поиске юриста"
      },
      relations: {
        members: {
          user: true
        },
        steps: {
          user: true
        }
      }
    });

    return agreements.map((agreement: Agreement) => new AgreementDto(agreement));
  }

  async addStepImages(id: number, images: string[]): Promise<AgreementStepDto> {
    const step: AgreementStep = await this.stepRepository.findOne({ where: { id: id } });
    if (!step) {
      throw new NotFoundException(`Этап с id ${id} не был найден`);
    }

    const imagesFound: ImageDto[] = await Promise.all(images.map(async (image: string) => {
      const imageFound: ImageDto = await this.imagesService.getImageByName(image);
      if (!imageFound) {
        throw new NotFoundException(`Фотография с названием ${image} не существует`);
      }

      return imageFound;
    }));
    const stepSaved = await this.stepRepository.save({
      ...step,
      images: imagesFound
    });

    return new AgreementStepDto(stepSaved);
  }

  async takeLawyerAgreement(lawyer: Lawyer, agreementId: number): Promise<{ message: string; success: boolean }> {
    const agreement: Agreement = await this.agreementRepository.findOne({
      where: {
        id: agreementId
      },
      relations: {
        members: {
          user: true
        }
      }
    });

    if (agreement.members.find((member: AgreementMember) => member.user.id === lawyer.user.id)) {
      throw new BadRequestException("Вы не можете взять данный договор в работу т.к. вы являетесь его стороной");
    }

    if (agreement.status !== "В поиске юриста") {
      throw new BadRequestException("Вы не можете взять договор в работу, так как он не искал юриста.");
    }

    await this.lawyerRepository.save({
      ...lawyer,
      agreements: [...lawyer.agreements, agreement]
    });

    await this.agreementRepository.update({
      id: agreementId
    }, {
      status: "У юриста",
      lawyer: lawyer
    });

    return {
      message: "Вы успешно взяли договор в работу.",
      success: true
    };
  }

  async createLawyer(userId: number): Promise<Lawyer> {
    const user: User = await this.userService.findUser(userId);

    const lawyer: Lawyer = await this.lawyerRepository.findOne({
      where: {
        user: {
          id: userId
        }
      }
    });

    if (lawyer) {
      throw new BadRequestException("Вы уже являетесь юристом.");
    }

    return await this.lawyerRepository.save({ user });
  }

  async createAgreement(userId: number, agreementDto: CreateAgreementDto): Promise<AgreementDto> {
    
    const agreementCreated: InsertResult = await this.agreementRepository.createQueryBuilder().insert().into(Agreement).values({
      ...agreementDto
    }).execute();

    const agreementFound = await this.findAgreement(agreementCreated.identifiers[0].id);

    const initiatorAdded = await this.addMember({
      userId,
      status: agreementDto.initiatorStatus
    }, agreementFound)

    const memberUpdated = await this.agreementRepository.save({...agreementFound,
      members: [initiatorAdded],
      initiator: initiatorAdded
    });

    return new AgreementDto(memberUpdated);

  }

  async confirmAgreement(userId: number, agreement: Agreement): Promise<{
    isConfirmed: boolean;
    message: string
  }> {
    const member: AgreementMember = this.findMember(agreement, userId);
    if (member.inviteStatus === "Подтвердил") {
      throw new BadRequestException("Вы уже подтвердили свое участие в договоре");
    }

    await this.agreementRepository.save({
      ...agreement,
      members: [...agreement.members.map((member: AgreementMember) => {
        return { ...member, inviteStatus: member.user.id === userId ? "Подтвердил" : member.inviteStatus };
      })]
    });

    return {
      isConfirmed: true,
      message: "Вы успешно подтвердили участие в договоре"
    };
  }

  async declineAgreement(userId: number, agreement: Agreement): Promise<{ isDeclined: boolean; message: string }> {
    if (agreement.status === "В работе" && agreement.initiator.user.id !== userId) {
      throw new BadRequestException("Вы не можете разорвать договор если вы не являетесь его инициатором");
    }

    await this.agreementRepository.save({
      ...agreement,
      members: [...agreement.members.map((member: AgreementMember) => {
        return { ...member, inviteStatus: member.user.id === userId ? "Отклонил" : member.inviteStatus };
      })],
      status: agreement.status === "В работе" ? "Отклонён" : agreement.status
    });

    return {
      isDeclined: true,
      message: "Вы успешно отклонили участие в договоре"
    };
  }

  async findAgreement(id: number): Promise<Agreement> {
    const agreementFound: Agreement = await this.agreementRepository.findOneBy({ id });

    if (!agreementFound) {
      throw new NotFoundException("Договор с этим идентификатором не найден");
    }

    return agreementFound;
  }

  async enableAgreementAtWork(userId: number, agreement: Agreement): Promise<{
    message: string;
    agreement: AgreementDto
  }> {
    const member: AgreementMember = this.findMember(agreement, userId);
    if (agreement.initiator.user.id !== member.user.id) {
      throw new BadRequestException("Вы не можете включить договор в работу, так как вы не являетесь его инициатором.");
    }

    if (!agreement.members.every((member: AgreementMember) => member.inviteStatus === "Приглашен")) {
      throw new BadRequestException("Участие в договоре ещё не было подтверждено всеми участниками. Пожалуйста, свяжитесь с ними.");
    }

    const agreementAtWork: Agreement = await this.agreementRepository.save({
      ...agreement,
      status: "В работе"
    });


    return {
      message: "Договор был успешно включён в работу.",
      agreement: new AgreementDto({ ...agreementAtWork })
    };

  }

  async inviteNewMember(initiatorId: number, memberId: number, status: "Заказчик" | "Подрядчик", agreement: Agreement):
    Promise<{ isInvited: boolean; message: string; agreement: AgreementDto }> {
    if (agreement.members.length > 1) {
      throw new BadRequestException("Договор уже перенасыщен.");
    }
    if (agreement.status === "В работе") {
      throw new BadRequestException("Вы не можете добавить нового участника в уже подписанный договор.");
    }

    this.findMember(agreement, initiatorId);
    const found: AgreementMember = agreement.members.find((member) => member.user.id === memberId);

    if (found && found.inviteStatus === "Отклонил") {
      throw new BadRequestException("Участник уже отказался от участия в договоре");
    }

    if (found) {
      throw new BadRequestException("Участник уже состоит в договоре");
    }


    agreement.members.push(await this.addMember({
      userId: memberId,
      status
    }, agreement));

    return {
      isInvited: true,
      message: "Пользователь был успешно приглашен к договору",
      agreement: new AgreementDto(agreement)
    };
  }

  async editStep(stepsDto: EditStepsDto) {
    const steps = Promise.all(stepsDto.steps.map(async (step) => {
      const stepFound = await this.stepRepository.findOne({
        where: {
          id: step?.id
      }
    });
    }));
  }

  async addStep(step: Step, agreement: Agreement): Promise<AgreementStep> {
    const member: AgreementMember = await this.memberRepository.findOne({
      where: {
        agreement: {
          id: agreement.id
        }
      }, relations: {
        user: true,
        agreement: true
      }
    });


    const stepCreated: InsertResult = await this.memberRepository.createQueryBuilder().insert().into(AgreementStep).values([{
      ...step,
      user: member
    }]).execute();

    return await this.stepRepository.findOne({
      where: { id: stepCreated.identifiers[0].id }, relations: {
        user: {
          user: true
        }
      }
    });


  }

  async addMember(member: {
    userId: number;
    status: "Заказчик" | "Подрядчик"
  }, agreement: Agreement): Promise<AgreementMember> {
    const user: User = await this.userService.findUser(member.userId);

    const agreementCreated: InsertResult = await this.memberRepository.createQueryBuilder().insert().into(AgreementMember).values([{
      ...member,
      inviteStatus: "Приглашен",
      agreement,
      user
    }]).execute();

    return await this.memberRepository.findOne({
      where: { id: agreementCreated.identifiers[0].id }, relations: {
        user: {
          telegram_account: true
        }
      }
    });
  }


  private findMember(agreement: Agreement, userId: number): AgreementMember {
    const member: AgreementMember = agreement.members.find((member: AgreementMember) => member.user.id === userId);
    if (!member) {
      throw new NotFoundException(`Пользователь с id ${userId} не найден в списке участников договора`);
    }

    return member;
  }
}
