import { Body, Controller, Delete, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { AgreementService } from "./agreement.service";
import { CreateAgreementDto } from "./dtos/create-agreement-dto";
import { AuthGuard } from "../auth/auth.guard";
import { RequestType } from "../../types/types";
import { AgreementConfirmDto } from "./dtos/agreement-confirm-dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Agreement API")
@Controller('agreement')
export class AgreementController {
  constructor(private readonly agreementService: AgreementService) {}

  @ApiOperation({summary: "Создание договора"})
  @Post('/create')
  @UseGuards(AuthGuard)
  async createAgreement(@Body() agreementDto: CreateAgreementDto, @Req() request: RequestType) {
    return this.agreementService.createAgreement(request.user.id, agreementDto);
  }

  @ApiOperation({summary: "Подтверждение участия в договоре"})
  @Post('/confirm/:id')
  @UseGuards(AuthGuard)
  async confirmAgreement(@Req() request: RequestType, @Param("id") id: number, @Body() agreementDto: AgreementConfirmDto): Promise<boolean> {
    return this.agreementService.confirmAgreement(request.user.id, id, agreementDto.code);
  }

  @ApiOperation({summary: "Отказ в участии в договоре"})
  @Delete('/decline/:id')
  @UseGuards(AuthGuard)
  async declineAgreement(@Req() request: RequestType, @Param("id") id: number): Promise<boolean> {
    return this.agreementService.declineAgreement(request.user.id, id);
  }
}
