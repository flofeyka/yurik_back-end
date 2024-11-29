import { Injectable, NotFoundException } from '@nestjs/common';
import { InsertResult, Repository } from 'typeorm';
import { Deposit } from './deposit.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entities/user.entity';
import { UUID } from 'crypto';

@Injectable()
export class AgreementDepositService {
  constructor(
    @InjectRepository(Deposit)
    private readonly depositRepository: Repository<Deposit>,
    private readonly userService: UserService,
  ) {}

  async createDeposit(userId: number): Promise<Deposit> {
    const userFound: User = await this.userService.findUser(userId);
    const depositExists = await this.getUserDeposit(userFound.id);
    if (depositExists) {
      throw new NotFoundException('Договорный счёт уже создан');
    }
    const depositInsert: InsertResult = await this.depositRepository
      .createQueryBuilder()
      .insert()
      .into(Deposit)
      .values([
        {
          owner: {
            id: userFound.id,
          },
        },
      ])
      .execute();
    return await this.findDeposit(depositInsert.identifiers[0].id);
  }

  async getUserDeposit(id: number): Promise<Deposit> {
    return await this.depositRepository.findOne({
      where: {
        owner: {
          id,
        },
      },
    });
  }

  async findDeposit(id: UUID): Promise<Deposit> {
    const depositFound: Deposit = await this.depositRepository.findOne({
      where: { id },
    });
    if (!depositFound) {
      throw new NotFoundException('Договорный счёт не найден');
    }

    return depositFound;
  }

  async addAgreements(count: number): Promise<number> {
    if (count % 10 === 0) {
      return 949 * (count / 10);
    } else {
      return count * 149;
    }
  }
}
