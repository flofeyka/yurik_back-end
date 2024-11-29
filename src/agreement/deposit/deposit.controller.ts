import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AgreementDepositService } from './deposit.service';
import { RequestType } from 'types/types';
import { AuthGuard } from 'src/auth/auth.guard';
import { Deposit } from './deposit.entity';
import { UUID } from 'crypto';

@Controller('/agreement/deposit')
export class AgreementDepositController {
  constructor(private readonly depositService: AgreementDepositService) {}
  @Post('/add/:count')
  async addAgreements(@Param('count') count: number) {
    return await this.depositService.addAgreements(Number(count));
  }

  @Post('/')
  @UseGuards(AuthGuard)
  async createDeposit(@Req() request: RequestType): Promise<Deposit> {
    return await this.depositService.createDeposit(request.user.id);
  }

  @Get('/my')
  @UseGuards(AuthGuard)
  async getDeposit(@Req() request: RequestType): Promise<Deposit> {
    console.log(request.user.id);
    return await this.depositService.getUserDeposit(request.user.id);
  }
}
