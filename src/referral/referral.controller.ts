import { Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { ReferralService } from "./referral.service";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { RequestType } from "../../types/types";
import { RefDto } from "./dtos/ref-output-dto";

@ApiTags('Referrals API')
@Controller('/referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @ApiOperation({summary: "Создание реферальной ссылке"})
  @ApiOkResponse({type: [RefDto]})
  @UseGuards(AuthGuard)
  @Post("/")
  async createRef(@Req() request: RequestType): Promise<RefDto> {
    return await this.referralService.createRef(request.user.id)
  }

  @ApiOperation({summary: "Получение рефералок и тех, кто ими воспользовались"})
  @ApiOkResponse({type: RefDto})
  @UseGuards(AuthGuard)
  @Get("/")
  async getUserRefs(@Req() request: RequestType): Promise<RefDto[]> {
    return await this.referralService.getUserRefs(request.user.id)
  }



}