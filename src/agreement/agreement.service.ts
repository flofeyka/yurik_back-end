import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateAgreementDto } from "./dtos/create-agreement-dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Agreement, Member, MemberData, MemberEntity, Step } from "./entities/agreement.entity";
import { InsertResult, Repository } from "typeorm";
import { UserService } from "../user/user.service";
import * as bcrypt from "bcryptjs";
import { User } from "../user/user.entity";
import { AgreementDto } from "./dtos/agreement-dto";

@Injectable()
export class AgreementService {
  constructor(@InjectRepository(Agreement) private readonly agreementRepository: Repository<Agreement>, private readonly userService: UserService) {
  }


  async createAgreement(userId: number, agreementDto: CreateAgreementDto): Promise<AgreementDto> {
    const userData: User = await this.userService.findUser(userId);

    const passwordConfirmed: boolean = await bcrypt.compare(agreementDto.password || "123", userData.password);

    if (!passwordConfirmed) {
      throw new BadRequestException("Неправильный пароль");
    }

    for (let i of agreementDto.members) {
      const member: User = await this.userService.findUser(i.id);
      if (!member) {
        throw new NotFoundException(`Пользователь с айди ${i.id} не найден в системе.`);
      }
    }

    for (let i of agreementDto.steps) {
      const memberFound: Member = agreementDto.members.find((member: Member) => member.id === i.responsible || member.id === userId);
      if (!memberFound) {
        throw new BadRequestException(`Человек c ответственный за этап "${i.title}" не найден в списке участников.`);
      }
    }

    if (agreementDto.members.find((member: Member) => member.id === userId)) {
      throw new BadRequestException("Нельзя заключить договор с самим собой.");
    }

    //Здесь должно быть условие проверки корректности даты.

    const agreementCreated: InsertResult = await this.agreementRepository.createQueryBuilder().insert().into(Agreement).values(
      [{
        ...agreementDto,
        initiator: userId,
        members: [
          {
            id: userId,
            status: agreementDto.initiatorStatus,
            inviteStatus: "Confirmed"
          },
          ...agreementDto.members.map((member: Member) => {
            return { ...member, inviteStatus: "Invited" as "Confirmed" | "Invited" | "Declined" };
          })
        ]
      }]).execute();

    //Прикрепление договора к модели юзера

    if (!agreementCreated) {
      throw new BadGatewayException("Не удалось создать договор.");
    }

    const agreementFound = await this.findAgreement(agreementCreated.identifiers[0].id);

    return new AgreementDto({
      ...agreementFound,
      members: await this.getMembersData(agreementFound),
      steps: await this.getStepsData(agreementFound)
    });

    // const steps = ["Данные каждого этапа и пользовательские данные(Аватарка, ФИО/Название компании)"]
    // return = new AgreementDto({...newAgreement, ...steps});

  }

  async sendCode(userId: number, agreementId: number): Promise<{ isSent: boolean; message: string }> {
    const agreementFound: Agreement = await this.findAgreement(agreementId);

    const member: MemberEntity = this.findMember(agreementFound, userId);

    if (!member) {
      throw new BadRequestException("Вы не являетесь участником данного договора.");
    }

    if (member.inviteStatus === "Confirmed") {
      throw new BadRequestException("Вы уже подтвердили участие в данном договоре.");
    }

    await this.agreementRepository.save({
      ...agreementFound,
      members: [...agreementFound.members.map((member: MemberEntity) => {
        if (member.id === userId) {
          return { ...member, code: this.getRandomCodeValue(100000, 999999) };
        }
        return { ...member };
      })]
    });

    //После получения доступа к СМС сервису настроить отправку СМС-сообщений

    return {
      isSent: true,
      message: "СМС-код был успешно отправлен"
    };
  }

  async confirmAgreement(userId: number, agreementId: number, password: string): Promise<{
    isConfirmed: boolean;
    message: string
  }> {
    const user = await this.userService.findUser(userId);
    const agreementFound: Agreement = await this.findAgreement(agreementId);

    const member: MemberEntity = this.findMember(agreementFound, userId);
    if (member.inviteStatus === "Confirmed") {
      throw new BadRequestException("Вы уже подтвердили свое участие в договоре");
    }

    const passwordCompared: boolean = await bcrypt.compare(password, user.password);
    if (!passwordCompared) {
      throw new BadRequestException("Неправильный пароль");
    }

    // if (member.code !== code) {
    //   throw new BadRequestException("Неправильный код из СМС");
    // }

    await this.agreementRepository.save({
      ...agreementFound,
      members: [...agreementFound.members.map((member: MemberEntity) => {
        return { ...member, isConfirmed: member.id === userId };
      })]
    });

    return {
      isConfirmed: true,
      message: "Вы успешно подтвердили участие в договоре"
    };
  }

  async declineAgreement(userId: number, agreementId: number): Promise<{ isDeclined: boolean; message: string }> {
    const agreementFound: Agreement = await this.findAgreement(agreementId);

    const member: MemberEntity = this.findMember(agreementFound, userId);

    if (agreementFound.status === "At work" && agreementFound.initiator !== member.id) {
      throw new BadRequestException("Вы не можете разорвать договор если вы не являетесь его инициатором");
    }

    const memberDeleted: Array<MemberEntity> = agreementFound.members.filter(member => member.id !== userId);

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
    const agreementFound = await this.agreementRepository.findOneBy({ id });
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
    const member: MemberEntity | undefined = this.findMember(agreement, userId);
    if (agreement.initiator !== member.id) {
      throw new BadRequestException("Вы не можете включить договор в работу, так как вы не являетесь его инициатором.");
    }

    if (!agreement.members.every(member => member.inviteStatus === "Confirmed")) {
      throw new BadRequestException("Участие в договоре ещё не было подтверждено всеми участниками. Пожалуйста, свяжитесь с ними.");
    }

    const agreementAtWork: Agreement = await this.agreementRepository.save({
      ...agreement,
      status: "At work"
    });

    return {
      message: "Договор был успешно включён в работу.",
      agreement: new AgreementDto({ ...agreementAtWork, members: await this.getMembersData(agreementAtWork), steps: await this.getStepsData(agreementAtWork) })
    };

  }

  async inviteNewMember(initiatorId: number, memberId: number, status: "client" | "contractor", agreementId: number) {
    const agreement: Agreement = await this.findAgreement(agreementId);

    if (agreement.status === "At work") {
      throw new BadRequestException("Вы не можете добавить нового участника в уже подписанный договор.");
    }

    this.findMember(agreement, initiatorId);
    const found = agreement.members.find((member: MemberEntity) => member.id === memberId);

    if(found) {
      throw new BadRequestException("Участник уже состоит в договоре");
    }

    const user: User = await this.userService.findUser(memberId);

    const agreementSaved: Agreement = await this.agreementRepository.save({
      ...agreement,
      members: [...agreement.members, {
        id: user.id,
        status,
        inviteStatus: "Invited"
      }]
    });

    return {
      isInvited: true,
      message: "Пользователь был успешно приглашен к договору",
      agreement: new AgreementDto({
        ...agreementSaved,
        members: await this.getMembersData(agreementSaved),
        steps: await this.getStepsData(agreementSaved)
      })
    };
  }

  async getMembersData(agreement: Agreement): Promise<Array<MemberData>> {
    return await Promise.all(agreement.members.map(async (member: MemberEntity) => {
      const memberData: User = await this.userService.findUser(member.id);

      return {
        id: member.id,
        fullName: {
          firstName: memberData.firstName,
          lastName: memberData.lastName,
          middleName: memberData.middleName
        },
        status: member.status,
        inviteStatus: member.inviteStatus,
        email: memberData.email,
        usersImage: memberData.imageUrl
      };
    }));
  }

  async getStepsData(agreement: Agreement) {
    return Promise.all(agreement.steps.map(async (step: Step) => {
      const stepUserData: User = await this.userService.findUser(step.responsible);

      return {
        userData: {
          id: stepUserData.id,
          fullName: {
            firstName: stepUserData.firstName,
            lastName: stepUserData.lastName,
            middleName: stepUserData.middleName
          },
          email: stepUserData.email,
          image: stepUserData.imageUrl
        },
        ...step
      };
    }));
  }

  private findMember(agreement: Agreement, userId: number): MemberEntity {
    const member = agreement.members.find((member: MemberEntity) => member.id === userId);
    if (!member) {
      throw new NotFoundException(`Пользователь с id ${userId} не найден в списке участников договора`);
    }

    return member;
  }

  public getRandomCodeValue(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
