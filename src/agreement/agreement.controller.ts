import { Body, Controller, Delete, Get, Param, Post, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { AgreementService } from "./agreement.service";
import { CreateAgreementDto } from "./dtos/create-agreement-dto";
import { AuthGuard } from "../auth/auth.guard";
import { RequestType } from "../../types/types";
import { AgreementConfirmDto } from "./dtos/agreement-confirm-dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { InviteUserDto } from "./dtos/invite-user-dto";
import { AgreementDto } from "./dtos/agreement-dto";
import { SmsGuard } from "src/sms/sms.guard";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import {v4 as uuidv4} from "uuid";
import { Observable, of } from "rxjs";
import path from "path";
import { AgreementGuard } from "./guards/agreement.guard";
import { Agreement } from "./entities/agreement.entity";
import { LawyerGuard } from "./guards/agreement.lawyer.guard";

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

  @ApiOperation({ summary: "Отправка договора юристу"})
  @Post("/:id/lawyer/send")
  @UseGuards(AuthGuard, AgreementGuard)
  async sendAgreementLawyer(@Req() request: RequestType) {
    return this.agreementService.sendToLawyer(request.user.id, request.agreement);
  }

  @ApiOperation({ summary: "Взять договор в работу(Юрист) "})
  @Post("/:id/lawyer/take")
  @UseGuards(AuthGuard, LawyerGuard)
  async takeLawyerAgreement(@Req() request: RequestType, @Param("id") id: number) {
    return this.agreementService.takeLawyerAgreement(request.lawyer, id);
  }

  @ApiOperation( {summary: "Стать юристом(Тестовая версия для фронт-енд разработчика)"} )
  @Post("/lawyer/become")
  @UseGuards(AuthGuard)
  async createLawyer(@Req() request: RequestType) {
    return this.agreementService.createLawyer(request.user.id);
  } 

  @ApiOperation({ summary: "Получение списка договоров, ищущих юриста"})
  @ApiResponse({example: [AgreementDto]})
  @Get("/lawyer/get")
  @UseGuards(AuthGuard, LawyerGuard)
  async getLawyerAgreements() {
    return this.agreementService.getLawyerAgreements();
  }

  @ApiOperation({ summary: "Создание договора" })
  @Post("/create")
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard, SmsGuard)
  async createAgreement(@Body() agreementDto: CreateAgreementDto, @Req() request: RequestType) {
    return this.agreementService.createAgreement(request.user.id, agreementDto);
  }

  @Post("/addPhotos")
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: "./uploads/images",
      filename: (req, file, cb) => {
        console.log(file.originalname);
        const filename: string = path.parse(file.originalname).name.replace(/\s/g, "") + uuidv4();
        console.log(filename);
        const extension: string = path.parse(file.originalname).ext;

        cb(null, `${filename}${extension}`);
      }

    })
  }))
  @UseGuards(AuthGuard)
  addAgreementPhotos(@UploadedFile() files: Express.Multer.File): Observable<Object> {
    console.log(files)
    return of({imagePath: files.path});
  }

  @Post("/step/addPhotos")
  @UseInterceptors(FilesInterceptor('file', 10))
  @UseGuards(AuthGuard)
  async addAgreementStepPhotos(@UploadedFiles() files: Express.Multer.File[]) {
    console.log(files);
  }


  @ApiOperation({ summary: "Подтверждение участия в договоре" })
  @Post("/confirm/:id")
  @UseGuards(AuthGuard, SmsGuard, AgreementGuard)
  async confirmAgreement(@Req() request: RequestType, @Param("id") id: number, @Body() agreementDto: AgreementConfirmDto): Promise<{
    isConfirmed: boolean;
    message: string;
  }> {
    return this.agreementService.confirmAgreement(request.user.id, request.agreement, agreementDto.password);
  }

  @ApiOperation({ summary: "Отказ в участии в договоре" })
  @Delete("/decline/:id")
  @UseGuards(AuthGuard, Agreement)
  async declineAgreement(@Req() request: RequestType, @Param("id") id: number): Promise<{
    isDeclined: boolean,
    message: string
  }> {
    return this.agreementService.declineAgreement(request.user.id, request.agreement);
  }

  @ApiOperation({ summary: "Приглашение нового участника в договор до его подписания" })
  @Post("/invite/:id/:memberId")
  @UseGuards(AuthGuard, Agreement)
  async inviteMember(@Req() request: RequestType, @Param("agreementId") agreementId: number, @Param("memberId") memberId: number, @Body() inviteDto: InviteUserDto): Promise<{
    isInvited: boolean;
    message: string;
    agreement: AgreementDto
  }> {
    return this.agreementService.inviteNewMember(request.user.id, memberId, inviteDto.status, request.agreement);
  }

  @ApiOperation({ summary: "Включение договора в работу." })
  @Post("/enable/:id")
  @UseGuards(AuthGuard, Agreement)
  async enableAgreement(@Req() request: RequestType, @Param("agreementId") id: number): Promise<{
    message: string;
    agreement: AgreementDto
  }> {
    return this.agreementService.enableAgreementAtWork(request.user.id, request.agreement);
  }
}
