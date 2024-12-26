import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestType } from 'types/types';
import { Lawyer } from './lawyer.entity';

@Injectable()
export class LawyerGuard implements CanActivate {
  constructor(
    @InjectRepository(Lawyer)
    private readonly lawyerRepository: Repository<Lawyer>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestType = context.switchToHttp().getRequest();

    const lawyerFound = await this.lawyerRepository.findOne({
      where: {
        user: {
          id: request.user.id,
        },
      },
      relations: {
        user: true,
        agreements: true,
      },
    });

    if (!lawyerFound) {
      throw new BadRequestException(
        'Вы не являетесь юристом, чтобы совершить данное действие',
      );
    }

    request.lawyer = lawyerFound;
    return true;
  }
}
