import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateAgreementDto } from "./dtos/create-agreement-dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Agreement } from "./entities/agreement.entity";
import { Repository } from "typeorm";

@Injectable()
export class AgreementService {
  constructor(@InjectRepository(Agreement) private readonly agreementRepository: Repository<Agreement>) {
  }

  async createAgreement(userId: number, agreementDto: CreateAgreementDto) {
    for (let i of agreementDto.members) {
      const member = await this.agreementRepository.findOneBy({ id: i.id });
      if (!member) {
        throw new NotFoundException(`Пользователь с айди ${i.id} не найден в системе.`);
      }
    }

    for (let i of agreementDto.steps) {
      const steps = agreementDto.members.find(member => member.id === i.responsible || member.id === userId);
      if (!steps) {
        throw new BadRequestException(`Человек c ответственный за этап "${i.title}" не найден в списке участников.`);
      }
    }

    if (agreementDto.members.find(member => member.id === userId).status === "client") {
      throw new BadRequestException("Нельзя заключить договор с самим собой.");
    }

    //Здесь должно быть условие проверки корректности даты.

    const agreementCreated = await this.agreementRepository.createQueryBuilder().insert().into(Agreement).values(
      {
        ...agreementDto,
        members: [
          {
            id: userId,
            status: agreementDto.initiator,
            isConfirmed: false
          },
          ...agreementDto.members.map(member => {
            return {
              ...member, isConfirm: false
            };
        }),
      ]}).execute();

    if (!agreementCreated) {
      throw new BadGatewayException("Не удалось создать договор.");
    }

    // const steps = ["Данные каждого этапа и пользовательские данные(Аватарка, ФИО/Название компании)"]
    // return = new AgreementDto({...newAgreement, ...steps});

    return await this.agreementRepository.findOneBy({ id: agreementCreated.identifiers[0].id });


  }
}
