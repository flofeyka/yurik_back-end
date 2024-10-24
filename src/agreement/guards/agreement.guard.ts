import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { RequestType } from 'types/types';
import { AgreementService } from '../agreement.service';
import { Agreement } from '../entities/agreement.entity';
import { AgreementMember } from '../members/member.entity';

@Injectable()
export class AgreementGuard implements CanActivate {
  constructor(private readonly agreementService: AgreementService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestType = context.switchToHttp().getRequest();

    const id = request.body.agreementId || request.params.agreementId ||  request.params.id || request.body.id || request.query.id;

    const agreementFound: Agreement | null =
      await this.agreementService.findAgreement(Number(id));

    if (!agreementFound) {
      throw new BadRequestException(`Договор с данным id ${id} не был найден`);
    }

    const memberFound: AgreementMember | undefined =
      agreementFound.members.find(
        (member: AgreementMember) => member.user.id === request.user.id,
      );
    if (!memberFound && agreementFound.lawyer?.user.id !== request.user.id) {
      throw new BadRequestException(
        'Вы не являетесь действующим участником или юристом данного договора чтобы совершить это действие',
      );
    }

    request.agreement = agreementFound;
    return true;
  }
}
