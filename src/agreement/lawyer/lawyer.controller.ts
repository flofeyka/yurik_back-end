import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AgreementGuard } from '../guards/agreement.guard';
import { RequestType } from 'types/types';
import { AgreementDto } from '../dtos/agreement-dto';
import { LawyerService } from './lawyer.service';
import { AuthGuard } from 'src/auth/auth.guard';

@ApiTags('Lawyer API')
@Controller('/agreement/lawyer')
export class LawyerController {
  constructor(private readonly lawyerService: LawyerService) {}

  //Доделать документашку для всех.
  @ApiOperation({ summary: 'Получение списка договоров, ищущих юриста' })
  @ApiResponse({ example: [AgreementDto] })
  @Get('/lawyer/get')
  @UseGuards(AuthGuard)
  async getLawyerAgreements(@Req() request: RequestType) {
    return this.lawyerService.getLawyerAgreements(request.user.role, request.user.id);
  }

  @ApiOperation({ summary: 'Отправка договора юристу' })
  @Post('/:id/send')
  @UseGuards(AuthGuard, AgreementGuard)
  async sendAgreementLawyer(@Req() request: RequestType) {
    return this.lawyerService.sendToLawyer(request.user.id, request.agreement);
  }

  @ApiOperation({ summary: 'Взять договор в работу(Юрист) ' })
  @Post('/:id/lawyer/take')
  @UseGuards(AuthGuard)
  async takeLawyerAgreement(
    @Req() request: RequestType,
    @Param('id') id: number,
  ) {
    return this.lawyerService.takeLawyerAgreement(request.user.role, request.user.id, id);
  }

  @ApiOperation({ summary: "Отправить договор случайному юристу "})
  @Post('/:id/random')
  @UseGuards(AuthGuard, AgreementGuard)
  async randomLawyer(@Req() request: RequestType) {
    return await this.lawyerService.sendRandomLawyer(request.user.id, request.agreement);
  }
}
