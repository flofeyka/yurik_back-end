import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AgreementDto } from '../dtos/agreement-dto';
import { Agreement } from '../entities/agreement.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AgreementMember } from './member.entity';
import { InsertResult, Repository } from 'typeorm';
import { AgreementStep } from '../step/entities/step.entity';
import { Lawyer } from '../lawyer/lawyer.entity';
import { UserService } from 'src/user/user.service';
import { ImagesService } from 'src/images/images.service';
import { AgreementImage } from '../entities/agreement-image.entity';
import { PersonalData } from 'src/user/entities/user.personal_data';
import { User } from 'src/user/entities/user.entity';
import { AppService } from 'src/app.service';
import { LegalInformationDto } from 'src/user/dtos/legal-information-dto';
import { AgreementService } from '../agreement.service';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Agreement)
    private readonly agreementRepository: Repository<Agreement>,
    @InjectRepository(AgreementMember)
    private readonly memberRepository: Repository<AgreementMember>,
    private readonly appService: AppService,
    private readonly userService: UserService,
    private readonly chatService: ChatService,
  ) {}

  async inviteNewMember(
    initiatorId: number,
    memberId: number,
    status: 'Заказчик' | 'Исполнитель',
    agreement: Agreement,
  ): Promise<{ isInvited: boolean; message: string; agreement: AgreementDto }> {
    // if (initiatorId === memberId) {
    //     throw new BadRequestException('Вы не можете добавить себя в договор.');
    // }
    if (
      agreement.members.filter(
        (member: AgreementMember): boolean =>
          member.inviteStatus === 'Подтвердил',
      ).length > 1
    ) {
      throw new BadRequestException('Договор перенасыщен.');
    }

    if (
      agreement.members.find(
        (member: AgreementMember): boolean => member.status === status,
      )
    ) {
      throw new BadRequestException(
        `${status} уже есть в договоре. Пожалуйста, выберете новый статус`,
      );
    }
    if (agreement.status === 'Активный') {
      throw new BadRequestException(
        'Вы не можете добавить нового участника в уже подписанный договор.',
      );
    }

    const initiator = await this.userService.findUser(initiatorId);
    const found: AgreementMember = agreement.members.find(
      (member) => member.user.id === memberId,
    );

    if (found && initiator.id === found.user.id) {
      throw new BadRequestException('Вы уже состоите в этом договоре');
    }

    if (found && found.inviteStatus === 'Отклонил') {
      throw new BadRequestException(
        'Участник уже отказался от участия в договоре',
      );
    }

    if (found) {
      throw new BadRequestException('Участник уже состоит в договоре');
    }
    const newMember = await this.addMember(
      {
        userId: memberId,
        status,
      },
      agreement,
    );

    agreement.members.push(newMember);
    await this.agreementRepository.save(agreement);

    // await this.appService.sendDealNotification(newMember.user.telegram_account.telegramID, initiator.telegram_account.telegramID, newMember.user.firstName, "initiator", agreement.id);
    await this.chatService.addMember(agreement.chat.id, memberId, {
      id: initiator.id,
      isAdmin: initiator.role === 'Админ',
    });
    return {
      isInvited: true,
      message: 'Пользователь был успешно приглашен к договору',
      agreement: new AgreementDto(agreement, initiatorId),
    };
  }

  async deleteMember(
    agreement: Agreement,
    memberId: number,
    userId: number,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    if (agreement.initiator.user.id !== userId) {
      throw new BadRequestException('Вы не можете удалить инициатора договора');
    }
    if (agreement.members.length < 2) {
      throw new BadRequestException(
        'Вы не можете удалить последнего участника',
      );
    }
    const member: AgreementMember = this.findMember(agreement, memberId);
    if (member.user.id === userId) {
      throw new BadGatewayException('Вы не можете удалить себя из договора');
    }
    const deleted = await this.memberRepository.delete(member);
    if (deleted.affected !== 1) {
      throw new BadGatewayException('Не удалось удалить участника.');
    }
    await this.chatService.deleteMember(agreement.chat.id, memberId, userId);
    return {
      success: true,
      message: 'Участник был успешно удален',
    };
  }

  async addMember(
    member: {
      userId: number;
      status: 'Заказчик' | 'Исполнитель';
    },
    agreement: Agreement,
    inviteStatus: 'Приглашен' | 'Подтвердил' | 'Отклонил' = 'Приглашен',
  ): Promise<AgreementMember> {
    const user: User = await this.userService.findUser(member.userId);
    const isMemberAlreadyInAgreement: AgreementMember | undefined =
      agreement.members.find(
        (memberItem: AgreementMember) => memberItem.user.id === user.id,
      );

    if (isMemberAlreadyInAgreement) {
      throw new BadRequestException('Участник уже состоит в договоре');
    }

    const memberCreated: InsertResult = await this.memberRepository
      .createQueryBuilder()
      .insert()
      .into(AgreementMember)
      .values([
        {
          ...member,
          inviteStatus: inviteStatus,
          agreement,
          user,
        },
      ])
      .execute();

    const memberFound: AgreementMember = await this.memberRepository.findOne({
      where: { id: memberCreated.identifiers[0].id },
      relations: {
        user: {
          telegram_account: true,
        },
      },
    });
    await this.agreementRepository.save({
      ...agreement,
      members: [...agreement.members, memberFound],
    });

    return memberFound;
  }

  findMember(agreement: Agreement, userId: number): AgreementMember {
    const member: AgreementMember = agreement.members.find(
      (member: AgreementMember) => member.user.id === Number(userId),
    );
    if (!member) {
      throw new NotFoundException(
        `Пользователь с id ${userId} не найден в списке участников договора`,
      );
    }

    return member;
  }
}
