import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { BadRequestException, Controller, Delete, Get, NotFoundException, Post, Req, UseGuards } from "@nestjs/common";
import { PatternService } from "./pattern.service";
import { AgreementDto } from "../dtos/agreement-dto";
import { AgreementGuard } from "../guards/agreement.guard";
import { AuthGuard } from "../../auth/auth.guard";
import { RequestType } from "../../../types/types";
import { AgreementsListDto } from "../dtos/agreements-list-dto";

@ApiTags("Шаблоны договора")
@Controller("/agreement/pattern")
export class AgreementPatternController {
  constructor(private readonly patternService: PatternService) {
  }


  @ApiOperation({ summary: "Добавить договор в список шаблонов" })
  @ApiOkResponse({ example: AgreementDto })
  @ApiBadRequestResponse({ example: new BadRequestException("Этот договор уже является шаблоном").getResponse() })
  @UseGuards(AuthGuard, AgreementGuard)
  @Post("/:id")
  addPatternAgreement(@Req() request: RequestType): Promise<AgreementDto> {
    return this.patternService.addPattern(request.agreement, request.user.id);
  }

  @ApiOperation({ summary: "Удалить договор из списка шаблонов" })
  @ApiOkResponse({ example: true })
  @ApiBadRequestResponse({ example: new NotFoundException("Договор не был найден в списке шаблонов").getResponse() })
  @UseGuards(AuthGuard, AgreementGuard)
  @Delete("/:id")
  deletePatternAgreement(@Req() request: RequestType): Promise<boolean> {
    return this.patternService.deletePattern(request.agreement, request.user.id);
  }

  @ApiOperation({ summary: "Получение списка шаблонных договоров" })
  @ApiOkResponse({ type: [AgreementDto] })
  @UseGuards(AuthGuard)
  @Get("/all")
  getPatternAgreements(@Req() request: RequestType): Promise<AgreementsListDto[]> {
    return this.patternService.getPatternList(request.user.id);
  }
};