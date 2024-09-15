import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { AgreementService } from "./agreement.service";
import { CreateAgreementDto } from "./dtos/create-agreement-dto";
import { AuthGuard } from "../auth/auth.guard";
import { RequestType } from "../../types/types";
import { AgreementConfirmDto } from "./dtos/agreement-confirm-dto";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { InviteUserDto } from "./dtos/invite-user-dto";
import { AgreementDto } from "./dtos/agreement-dto";
import { SmsGuard } from "src/sms/sms.guard";

@ApiTags("Agreement API")
@Controller("agreement")
export class AgreementController {
  constructor(private readonly agreementService: AgreementService) {
  }

  @ApiOperation({ summary: "Получение списка пользовательских договоров" })
  @Get("/")
  @UseGuards(AuthGuard)
  async getAgreements(@Req() request: RequestType): Promise<AgreementDto[]> {
    return this.agreementService.getAgreements(request.user.id);
  }

  @ApiOperation({ summary: "Создание договора" })
  @Post("/create")
  @UseGuards(AuthGuard, SmsGuard)
  async createAgreement(@Body() agreementDto: CreateAgreementDto, @Req() request: RequestType) {
    return this.agreementService.createAgreement(request.user.id, agreementDto);
  }

  @ApiOperation({ summary: "Подтверждение участия в договоре" })
  @Post("/confirm/:id")
  @UseGuards(AuthGuard, SmsGuard)
  async confirmAgreement(@Req() request: RequestType, @Param("id") id: number, @Body() agreementDto: AgreementConfirmDto): Promise<{
    isConfirmed: boolean;
    message: string
  }> {
    return this.agreementService.confirmAgreement(request.user.id, id, agreementDto.password);
  }

  @ApiOperation({ summary: "Отказ в участии в договоре" })
  @Delete("/decline/:id")
  @UseGuards(AuthGuard)
  async declineAgreement(@Req() request: RequestType, @Param("id") id: number): Promise<{
    isDeclined: boolean,
    message: string
  }> {
    return this.agreementService.declineAgreement(request.user.id, id);
  }

  @ApiOperation({ summary: "Приглашение нового участника в договор до его подписания" })
  @Post("/invite/:agreementId/:memberId")
  @UseGuards(AuthGuard)
  async inviteMember(@Req() request: RequestType, @Param("agreementId") agreementId: number, @Param("memberId") memberId: number, @Body() inviteDto: InviteUserDto): Promise<{
    isInvited: boolean;
    message: string;
    agreement: AgreementDto
  }> {
    return this.agreementService.inviteNewMember(request.user.id, memberId, inviteDto.status, agreementId);
  }

  @ApiOperation({ summary: "Включение договора в работу." })
  @Post("/enable/:agreementId")
  @UseGuards(AuthGuard)
  async enableAgreement(@Req() request: RequestType, @Param("agreementId") id: number): Promise<{
    message: string;
    agreement: AgreementDto
  }> {
    return this.agreementService.enableAgreementAtWork(request.user.id, id);
  }
}
