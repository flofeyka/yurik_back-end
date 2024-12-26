import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppService } from 'src/app.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { AgreementDto } from '../dtos/agreement-dto';
import { Agreement } from '../entities/agreement.entity';
import { AgreementMember } from '../members/member.entity';

@Injectable()
export class LawyerService {
  constructor(
    @InjectRepository(AgreementMember) private readonly memberRepository: Repository<AgreementMember>,
    @InjectRepository(Agreement) private readonly agreementRepository: Repository<Agreement>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly userService: UserService,
    private readonly appService: AppService,
  ) {}

  async sendRandomLawyer(userId: number, agreement: Agreement) {
    if (agreement.initiator.user.id !== userId) {
      throw new BadRequestException(
        'Вы не можете пригласить юриста в договор, так как не являетесь его инициатором.',
      );
    }

    if (agreement.status === 'Расторгнут') {
      throw new BadRequestException(
        'Вы не можете пригласить юриста в отклоненный договор',
      );
    }

    if (agreement.status === 'У юриста') {
      throw new BadRequestException(
        'Договор уже находится на рассмотрении у юриста.',
      );
    }

    if (agreement.status === 'В поиске юриста') {
      throw new BadRequestException('Договор уже в списке очереди у юриста.');
    }

    const randomLawyer = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.telegram_account', 'telegram_account')
      .where('user.role = :role', { role: 'Юрист' })
      .andWhere('user.id != :id', { id: userId })
      .andWhere('user.id NOT IN (:...memberIds)', {
        memberIds: agreement.members.map((member) => member.user.id),
      })
      .orderBy('RANDOM()')
      .getOne();

    if (!randomLawyer) {
      throw new BadRequestException('Нет свободных юристов');
    }

    const { firstName, lastName, middleName } = agreement.initiator.user;

    const newMember = await this.memberRepository.save({
      agreement,
      user: randomLawyer,
      status: "Юрист",
      inviteStatus: "Подтвердил"
    })

    await this.appService.sendNotification(
      `<b>${lastName} ${firstName} ${middleName}</b> обратился за юридической помощью по договору ${agreement.title}`,
      randomLawyer.telegram_account.telegramID,
    );


  
    agreement.status = 'У юриста';
    agreement.members = [...agreement.members, newMember];
    await this.agreementRepository.save(agreement);

    return {
      success: true,
      message: 'Случайный юрист успешно получил новый договор',
    };
  }

  async sendToLawyer(userId: number, agreement: Agreement) {
    if (agreement.initiator.user.id !== userId) {
      throw new BadRequestException(
        'Вы не можете пригласить юриста в договор, так как не являетесь его инициатором.',
      );
    }

    if (agreement.status === 'Расторгнут') {
      throw new BadRequestException(
        'Вы не можете пригласить юриста в отклоненный договор',
      );
    }

    if (agreement.status === 'У юриста') {
      throw new BadRequestException(
        'Договор уже находится на рассмотрении у юриста.',
      );
    }

    if (agreement.status === 'В поиске юриста') {
      throw new BadRequestException('Договор уже в списке очереди у юриста.');
    }

    await this.agreementRepository.save({
      ...agreement,
      status: 'В поиске юриста',
    });

    return true;
  }

  async getLawyerAgreements(role: "Юрист" | "Пользователь" | "Админ", user_id: number): Promise<AgreementDto[]> {
    if(role !== "Юрист" && role !== "Админ") {
      throw new BadGatewayException("Вы не являетесь администратором или юристом, чтобы совершить это действие")
    }
    const agreements: Agreement[] = await this.agreementRepository.find({
      where: {
        status: 'В поиске юриста',
      },
      relations: {
        members: {
          user: true,
        },
        steps: {
          user: true,
        },
      },
    });

    return agreements.map(
      (agreement: Agreement) => new AgreementDto(agreement, user_id),
    );
  }

  async takeLawyerAgreement(
    role: "Админ" | "Пользователь" | "Юрист",
    user_id: number,
    agreementId: number,
  ): Promise<{ message: string; success: boolean }> {
    const agreement: Agreement = await this.agreementRepository.findOne({
      where: {
        id: agreementId,
      },
      relations: {
        members: {
          user: true,
        },
      },
    });

    if (
      agreement.members.find(
        (member: AgreementMember) => member.user.id === user_id,
      )
    ) {
      throw new BadRequestException(
        'Вы не можете взять данный договор в работу т.к. вы являетесь его стороной',
      );
    }

    if (agreement.status !== 'В поиске юриста') {
      throw new BadRequestException(
        'Вы не можете взять договор в работу, так как он не искал юриста.',
      );
    }

    const user = await this.userService.findUser(user_id);

    const newMember = await this.memberRepository.save({
      agreement,
      user,
      status: "Юрист"
    })
    

    agreement.status = "У юриста";
    agreement.members = [...agreement.members, newMember];
    await this.agreementRepository.save(agreement);

    return {
      message: 'Вы успешно взяли договор в работу.',
      success: true,
    };
  }
}
