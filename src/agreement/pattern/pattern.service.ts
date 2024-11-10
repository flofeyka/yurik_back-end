import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "../../user/entities/user.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Agreement } from "../entities/agreement.entity";
import { AgreementDto } from "../dtos/agreement-dto";
import { UserService } from "../../user/user.service";
import { AgreementsListDto } from "../dtos/agreements-list-dto";

@Injectable()
export class PatternService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly userService: UserService
  ) {
  }

  async addPattern(agreement: Agreement, userId: number): Promise<AgreementDto> {
    const user: User = await this.userService.findUser(userId);
    if (user.agreement_patterns?.find((item: Agreement): boolean => item.id === agreement.id)) {
      throw new BadRequestException("Этот договор уже является шаблоном");
    }

    user.agreement_patterns = [...user?.agreement_patterns || [], agreement];
    await this.userRepository.save(user);
    return new AgreementDto(agreement, userId);
  }

  async deletePattern(agreement: Agreement, userId: number): Promise<boolean> {
    const user: User = await this.userService.findUser(userId);
    if (!user.agreement_patterns.find((item: Agreement): boolean => item.id === agreement.id)) {
      throw new NotFoundException("Договор не был найден в списке шаблонов");
    }

    user.agreement_patterns = user.agreement_patterns.filter((item: Agreement): boolean => item.id !== agreement.id);
    await this.userRepository.save(user);
    return true;
  }

  async getPatternList(userId: number): Promise<AgreementsListDto[]> {
    const user: User = await this.userService.findUser(userId);
    console.log(user);
    return user.agreement_patterns.map((agreement: Agreement): AgreementsListDto => new AgreementsListDto(agreement));
  }
}