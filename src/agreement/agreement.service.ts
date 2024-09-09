import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateAgreementDto } from "./dtos/create-agreement-dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Agreement, Member, MemberEntity } from "./entities/agreement.entity";
import { InsertResult, Repository } from "typeorm";
import { UserService } from "../user/user.service";
import * as bcrypt from "bcryptjs";
import { User } from "../user/user.entity";

@Injectable()
export class AgreementService {
  constructor(@InjectRepository(Agreement) private readonly agreementRepository: Repository<Agreement>, private readonly userService: UserService) {
  }


  async createAgreement(userId: number, agreementDto: CreateAgreementDto): Promise<Agreement> {
    const userData: User = await this.userService.findUser(userId);

    const passwordConfirmed: boolean = await bcrypt.compare(agreementDto.password || "123", userData.password);

    if (!passwordConfirmed) {
      throw new BadRequestException("Неправильный пароль");
    }

    for (let i of agreementDto.members) {
      const member: Agreement = await this.findAgreement(i.id);
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

    if (agreementDto.members.find(member => member.id === userId).status === "client") {
      throw new BadRequestException("Нельзя заключить договор с самим собой.");
    }


    //Здесь должно быть условие проверки корректности даты.

    const agreementCreated: InsertResult = await this.agreementRepository.createQueryBuilder().insert().into(Agreement).values(
      [{
        ...agreementDto,
        members: [
          {
            id: userId,
            status: agreementDto.initiator,
            isConfirmed: false
          },
          ...agreementDto.members.map(member => {
            return {
              ...member, isConfirmed: false
            };
          })
        ]
      }]).execute();

    //Прикрепление договора к модели юзера

    if (!agreementCreated) {
      throw new BadGatewayException("Не удалось создать договор.");
    }

    // const steps = ["Данные каждого этапа и пользовательские данные(Аватарка, ФИО/Название компании)"]
    // return = new AgreementDto({...newAgreement, ...steps});

    return await this.findAgreement(agreementCreated.identifiers[0].id);
  }

  async sendCode(userId: number, agreementId: number): Promise<boolean> {
    const agreementFound: Agreement = await this.findAgreement(agreementId);

    const member: MemberEntity = this.findMember(agreementFound, userId);

    if (!member) {
      throw new BadRequestException("Вы не являетесь участником данного договора.");
    }

    if (member.isConfirmed) {
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

    return true;
  }

  async confirmAgreement(userId: number, agreementId: number, code: number): Promise<boolean> {
    const agreementFound: Agreement = await this.findAgreement(agreementId);
    if (!agreementFound) {
      throw new NotFoundException("Договор с этим идентификатором не найден");
    }

    const member: MemberEntity = this.findMember(agreementFound, userId);
    if (!member) {
      throw new NotFoundException("Вы не являетесь участником договора");
    }

    if (member.isConfirmed) {
      throw new BadRequestException("Вы уже подтвердили свое участие в договоре");
    }

    if (member.code !== code) {
      throw new BadRequestException("Неправильный код из СМС");
    }

    await this.agreementRepository.save({
      ...agreementFound,
      members: [...agreementFound.members.map((member: MemberEntity) => {
        return { ...member, isConfirmed: member.id === userId };
      })],
      isConfirmByAllMembers: agreementFound.members.every((member: MemberEntity) => member.isConfirmed === true)
    });

    return true;
  }

  async declineAgreement(userId: number, agreementId: number): Promise<boolean> {
    const agreementFound: Agreement = await this.findAgreement(agreementId);

    if (!agreementFound) {
      throw new NotFoundException("Договор не был найден");
    }

    const member: MemberEntity = this.findMember(agreementFound, userId);

    if (!member) {
      throw new BadRequestException("Вы не являетесь участником договора");
    }

    if (agreementFound.status === "At work" && agreementFound.initiator !== member.status) {
      throw new BadRequestException("Вы не можете разорвать договор если вы не являетесь его инициатором");
    }

    const memberDeleted: Array<MemberEntity> = agreementFound.members.filter(member => member.id !== userId);

    await this.agreementRepository.save({
      ...agreementFound,
      members: memberDeleted,
      status: memberDeleted.length < 2 || memberDeleted.every(member => member.status === "client") ? "Declined" : "In confirm process"
    });

    return true;
  }

  async findAgreement(id: number): Promise<Agreement> {
    const agreementFound = await this.agreementRepository.findOneBy({ id });
    if (!agreementFound) {
      throw new NotFoundException("Договор с этим идентификатором не найден");
    }
    return agreementFound;
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
