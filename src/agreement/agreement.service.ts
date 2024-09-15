import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { InsertResult, Repository } from "typeorm";
import { v4 as uuid } from "uuid";
import { User } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { AgreementDto } from "./dtos/agreement-dto";
import { CreateAgreementDto } from "./dtos/create-agreement-dto";
import { Agreement, Step } from "./entities/agreement.entity";
import { AgreementMember } from "./entities/agreement.member.entity";
import { AgreementStep } from "./entities/agreement.step.entity";

@Injectable()
export class AgreementService {
  constructor(
    @InjectRepository(Agreement) private readonly agreementRepository: Repository<Agreement>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(AgreementMember) private readonly memberRepository: Repository<AgreementMember>,
    @InjectRepository(AgreementStep) private readonly stepRepository: Repository<AgreementStep>,
    private readonly userService: UserService,
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
            user: true
          }
        }
      }
    });

    return await Promise.all(agreements.map(async (agreement: Agreement) => new AgreementDto(agreement)));
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
    
    //Здесь должно быть условие проверки корректности даты.

    const agreement = this.agreementRepository.create({
      ...agreementDto,
      initiator: userId,
    });


    return await this.agreementRepository.save({
      ...agreement,
      members: await Promise.all(agreementDto.members.map(async (member) => await this.addMember(member, agreement))),
      steps: await Promise.all(agreementDto.steps.map(async (step) => await this.addStep(step, agreement))),
    })

  }

  async confirmAgreement(userId: number, agreementId: number, password: string): Promise<{
    isConfirmed: boolean;
    message: string
  }> {
    const user = await this.userService.findUser(userId);
    const agreementFound: Agreement = await this.findAgreement(agreementId);

    const member = this.findMember(agreementFound, userId);
    if (member.inviteStatus === "Confirmed") {
      throw new BadRequestException("Вы уже подтвердили свое участие в договоре");
    }

    await this.agreementRepository.save({
      ...agreementFound,
      members: [...agreementFound.members.map((member) => {
        return { ...member, inviteStatus: member.user.id === userId ? "Confirmed" : member.inviteStatus };
      })]
    });

    return {
      isConfirmed: true,
      message: "Вы успешно подтвердили участие в договоре"
    };
  }

  async declineAgreement(userId: number, agreementId: number): Promise<{ isDeclined: boolean; message: string }> {
    const agreementFound: Agreement = await this.findAgreement(agreementId);

    const member = this.findMember(agreementFound, userId);

    if (agreementFound.status === "At work" && agreementFound.initiator !== member.user.id) {
      throw new BadRequestException("Вы не можете разорвать договор если вы не являетесь его инициатором");
    }

    const memberDeleted = agreementFound.members.filter(member => member.user.id !== userId);

    await this.agreementRepository.save({
      ...agreementFound,
      members: memberDeleted,
      status: memberDeleted.length < 2 || memberDeleted.every(member => member.status === "client") ? "Declined" : "In confirm process"
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
      }
    }});

    if (!agreementFound) {
      throw new NotFoundException("Договор с этим идентификатором не найден");
    }
    return agreementFound;
  }

  async enableAgreementAtWork(userId: number, agreementId: number): Promise<{
    message: string;
    agreement: AgreementDto
  }> {
    const agreement: Agreement = await this.findAgreement(agreementId);
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

  async inviteNewMember(initiatorId: number, memberId: number, status: "client" | "contractor", agreementId: number) {
    const agreement: Agreement = await this.findAgreement(agreementId);

    if (agreement.status === "At work") {
      throw new BadRequestException("Вы не можете добавить нового участника в уже подписанный договор.");
    }

    this.findMember(agreement, initiatorId);
    const found = agreement.members.find((member) => member.user.id === memberId);

    if (found) {
      throw new BadRequestException("Участник уже состоит в договоре");
    }

    const user: User = await this.userService.findUser(memberId);

    agreement.members.push(await this.addMember({
      userId: memberId,
      status
    }, agreement));

    console.log(agreement);

    return {
      isInvited: true,
      message: "Пользователь был успешно приглашен к договору",
      agreement
    };
  }

  async addStep(step: Step, agreement: Agreement): Promise<AgreementStep> {
    const member: AgreementMember = await this.memberRepository.findOne({
      where: {agreement: agreement}, relations: {
        user: true
      }
    });


    const stepCreated: InsertResult = await this.memberRepository.createQueryBuilder().insert().into(AgreementStep).values([{
      ...step,
      id: uuid(),
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
      inviteStatus: "Invited",
      id: uuid(),
      agreement,
      user,
      ...member,
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
