import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InsertResult, Repository } from "typeorm";
import { v4 as uuid } from "uuid";
import { User } from "../user/entities/user.entity";
import { UserService } from "../user/user.service";
import { AgreementDto } from "./dtos/agreement-dto";
import { CreateAgreementDto } from "./dtos/create-agreement-dto";
import { Agreement, Step } from "./entities/agreement.entity";
import { AgreementMember } from "./entities/agreement.member.entity";
import { AgreementStep } from "./entities/agreement.step.entity";
import { Lawyer } from "./entities/agreement.lawyer.entity";
import { HttpService } from "@nestjs/axios";
import { AppService } from "src/app.service";

@Injectable()
export class AgreementService {
  constructor(
    @InjectRepository(Agreement) private readonly agreementRepository: Repository<Agreement>,
    @InjectRepository(AgreementMember) private readonly memberRepository: Repository<AgreementMember>,
    @InjectRepository(AgreementStep) private readonly stepRepository: Repository<AgreementStep>,
    @InjectRepository(Lawyer) private readonly lawyerRepository: Repository<Lawyer>,
    private readonly userService: UserService,
    private readonly appService: AppService
  ) {
  }


  async getAgreements(userId: number): Promise<AgreementDto[]> {
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
            user: true,
          }
        }
      }
    });

    console.log(agreements[0].steps[0].user);

    return agreements.map((agreement: Agreement) => new AgreementDto(agreement));

  }

  async sendToLawyer(userId: number, agreement: Agreement) {
    if(agreement.initiator !== userId) {
      throw new BadRequestException("Вы не можете пригласить юриста в договор, так как не являетесь его инициатором.")
    }

    if(agreement.status === "Declined")  {
      throw new BadRequestException("Вы не можете пригласить юриста в отклоненный договор");
    }

    if(agreement.status === "At a lawyer") {
      throw new BadRequestException("Договор уже находится на рассмотрении у юриста.");
    }

    if(agreement.status === "Looking for a lawyer") {
      throw new BadRequestException("Договор уже в списке очереди у юриста.")
    }

    await this.agreementRepository.save({
      ...agreement,
      status: "Looking for a lawyer"
    });

    return true;
  }

  async getLawyerAgreements() {
    const agreements: Agreement[] = await this.agreementRepository.find({
      where: {
        status: "Looking for a lawyer"
      },
      relations: {
        members: {
          user: true,
        },
        steps: {
          user: true
        }
      }
    })

    return agreements.map((agreement: Agreement) => new AgreementDto(agreement));
  }

  async takeLawyerAgreement(lawyer: Lawyer, agreementId: number) {
    const agreement: Agreement = await this.agreementRepository.findOne({
      where: {
        id: agreementId
      },
      relations: {
        members: {
          user: true
        },
      }
    })

    if(agreement.members.find((member: AgreementMember) => member.user.id === lawyer.user.id)) {
      throw new BadRequestException("Вы не можете взять данный договор в работу т.к. вы являетесь его стороной");
    }

    if(agreement.lawyer && agreement.status === "At a lawyer") {
      throw new BadRequestException("Вы не можете принять договор, так как он уже находится на рассмотрении у юриста.");
    }

    if(agreement.status !== "Looking for a lawyer") {
      throw new BadRequestException("Вы не можете взять договор в работу, так как он не искал юриста.");
    }

    await this.lawyerRepository.save({
      ...lawyer,
      agreements: [...lawyer.agreements, agreement]
    });

    await this.agreementRepository.update({
      id: agreementId
    }, {
      status: "At a lawyer",
      lawyer: lawyer
    });

    return {
      message: "Вы успешно взяли договор в работу.",
      success: true
    }
  }

  async createLawyer(userId: number) {
    const user = await this.userService.findUser(userId);

    const lawyer = await this.lawyerRepository.findOne({
      where: {
        user: {
          id: userId
        }
      }
    })

    if(lawyer) {
      throw new BadRequestException("Вы уже являетесь юристом.");
    }

    return await this.lawyerRepository.save({user});
  }

  async createAgreement(userId: number, agreementDto: CreateAgreementDto) {
    if(new Date(agreementDto.end) < new Date(agreementDto.start)) {
      throw new BadRequestException("Дата окончания договора не может быть меньше даты начала.");
    }
    
    if(new Date(agreementDto.start) < new Date(Date.now() - 1000 * 60 * 60 * 24)) {
      throw new BadRequestException("Дата начала договора не может быть меньше текущей даты.");
    }
    
    for (let i of agreementDto.members) {
      const member: User = await this.userService.findUser(i.userId);
      if (!member) {
        throw new NotFoundException(`Пользователь с айди ${i.userId} не найден в системе.`);
      }
    }
    
    for (let i of agreementDto.steps) {
      const memberFound = agreementDto.members.find((member) => member.userId === i.userId);
      if (!memberFound && i.userId !== userId) {
        throw new BadRequestException(`Человек c ответственный за этап "${i.title}" не найден в списке участников.`);
      }
      
      if(new Date(i.end) < new Date(i.start)) {
        throw new BadRequestException(`Ошибка в этапе "${i.title}". Дата окончания этапа не может быть раньше даты начала.`)
      }
      
      if(new Date(i.start) < new Date(Date.now() - 1000 * 60 * 60 * 24)) {
        throw new BadRequestException(`Ошибка в этапе "${i.title}". Дата начала этапа не может быть раньше текущей даты.`);
      }
    }
    
    if (agreementDto.members.find((member) => member.userId === userId)) {
      throw new BadRequestException("Нельзя заключить договор с самим собой.");
    }
    
    
    agreementDto.members.push({
      userId: userId,
      status: agreementDto.initiatorStatus
    });
    
    const agreement = this.agreementRepository.create({
      ...agreementDto,
      initiator: userId,
    });


    const agreementCreated = await this.agreementRepository.save({
      ...agreement,
      members: await Promise.all(agreementDto.members.map(async (member) => await this.addMember(member, agreement))),
      steps: await Promise.all(agreementDto.steps.map(async (step) => await this.addStep(step, agreement))),
    });

    Promise.all(agreementCreated.members.map(async (member: AgreementMember) => await this.appService.sendNotification(`${agreementCreated.members.find(member => member.user.id === agreementCreated.initiator).user.firstName} пригласил Вас в "${agreementCreated.title}`, member.user.telegram_account.telegramID)));

    return agreementCreated;

  }

  async confirmAgreement(userId: number, agreement: Agreement, password: string): Promise<{
    isConfirmed: boolean;
    message: string
  }> {
    const member = this.findMember(agreement, userId);
    if (member.inviteStatus === "Confirmed") {
      throw new BadRequestException("Вы уже подтвердили свое участие в договоре");
    }

    await this.agreementRepository.save({
      ...agreement,
      members: [...agreement.members.map((member) => {
        return { ...member, inviteStatus: member.user.id === userId ? "Confirmed" : member.inviteStatus };
      })]
    });

    return {
      isConfirmed: true,
      message: "Вы успешно подтвердили участие в договоре"
    };
  }

  async declineAgreement(userId: number, agreement: Agreement): Promise<{ isDeclined: boolean; message: string }> {
    if (agreement.status === "At work" && agreement.initiator !== userId) {
      throw new BadRequestException("Вы не можете разорвать договор если вы не являетесь его инициатором");
    }

    await this.agreementRepository.save({
      ...agreement,
      members: [...agreement.members.map((member: AgreementMember) => {
        return { ...member, inviteStatus: member.user.id === userId ? "Declined" : member.inviteStatus };
      })]
    });

    return {
      isDeclined: true,
      message: "Вы успешно отклонили участие в договоре"
    };
  }

  async findAgreement(id: number): Promise<Agreement> {
    const agreementFound = await this.agreementRepository.findOne({ where: {id}, relations: {
      members: {
        user: true,
      },
      steps: {
        user: {
          user: true
        }
      },
      lawyer: {
        user: true
      }
    }});

    if (!agreementFound) {
      throw new NotFoundException("Договор с этим идентификатором не найден");
    }
    return agreementFound;
  }

  async enableAgreementAtWork(userId: number, agreement: Agreement): Promise<{
    message: string;
    agreement: AgreementDto
  }> {
    const member = this.findMember(agreement, userId);
    if (agreement.initiator !== member.user.id) {
      throw new BadRequestException("Вы не можете включить договор в работу, так как вы не являетесь его инициатором.");
    }

    if (!agreement.members.every((member: AgreementMember) => member.inviteStatus === "Confirmed")) {
      throw new BadRequestException("Участие в договоре ещё не было подтверждено всеми участниками. Пожалуйста, свяжитесь с ними.");
    }

    const agreementAtWork: Agreement = await this.agreementRepository.save({
      ...agreement,
      status: "At work"
    });


    return {
      message: "Договор был успешно включён в работу.",
      agreement: new AgreementDto({ ...agreementAtWork })
    };

  }

  async inviteNewMember(initiatorId: number, memberId: number, status: "client" | "contractor", agreement: Agreement): 
  Promise<{isInvited: boolean; message: string; agreement: AgreementDto}> {
    if (agreement.status === "At work") {
      throw new BadRequestException("Вы не можете добавить нового участника в уже подписанный договор.");
    }

    this.findMember(agreement, initiatorId);
    const found = agreement.members.find((member) => member.user.id === memberId);
    
    if(found && found.inviteStatus === "Declined") {
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

  async addStep(step: Step, agreement: Agreement): Promise<AgreementStep> {
    const member: AgreementMember = await this.memberRepository.findOne({
      where: {agreement: {
        id: agreement.id
      }}, relations: {
        user: true,
        agreement: true
      }
    });


    const stepCreated: InsertResult = await this.memberRepository.createQueryBuilder().insert().into(AgreementStep).values([{
      id: uuid(),
      ...step,
      user: member,
    }]).execute();

    return await this.stepRepository.findOne({ where: { id: stepCreated.identifiers[0].id }, relations: {
      user: {
        user: true
      }
    } });


  }

  async addMember(member: { userId: number; status: "client" | "contractor" }, agreement: Agreement): Promise<AgreementMember> {
    const user: User = await this.userService.findUser(member.userId);

    const agreementCreated: InsertResult = await this.memberRepository.createQueryBuilder().insert().into(AgreementMember).values([{
      ...member,
      inviteStatus: "Invited",
      id: uuid(),
      agreement,
      user,
    }]).execute();

    return await this.memberRepository.findOne({ where: { id: agreementCreated.identifiers[0].id }, relations: {
      user: true
    }});
  }


  private findMember(agreement: Agreement, userId: number): AgreementMember {
    const member: AgreementMember = agreement.members.find((member) => member.user.id === userId);
    if (!member) {
      throw new NotFoundException(`Пользователь с id ${userId} не найден в списке участников договора`);
    }

    return member;
  }
}
