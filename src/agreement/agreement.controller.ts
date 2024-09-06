import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { AgreementService } from "./agreement.service";
import { CreateAgreementDto } from "./dtos/create-agreement-dto";
import { AuthGuard } from "../auth/auth.guard";
import { RequestType } from "../../types/types";

@Controller('agreement')
export class AgreementController {
  constructor(private readonly agreementService: AgreementService) {}

  @UseGuards(AuthGuard)
  @Post('/create')
  async createAgreement(@Body() agreementDto: CreateAgreementDto, @Req() request: RequestType) {
    return this.agreementService.createAgreement(request.user.id, agreementDto);
  }
}
