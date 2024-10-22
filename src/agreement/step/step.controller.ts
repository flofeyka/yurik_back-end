import { Body, Controller, Delete, HttpStatus, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiOperation, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UUID } from "crypto";
import { AuthGuard } from "src/auth/auth.guard";
import { RequestType } from "types/types";
import { AgreementDto, AgreementStepDto } from "../dtos/agreement-dto";
import { Step } from "../dtos/edit-steps-dto";
import { ImagesDto } from "../dtos/images-dto";
import { AgreementGuard } from "../guards/agreement.guard";
import { ChangeOrder } from "./dtos/change-order-dto";
import { EditStepDto } from "./dtos/edit-step-dto";
import { StepGuard } from "./guards/step.guard";
import { StepService } from "./step.service";

@ApiTags("Agreement Step API")
@Controller("/agreement/step")
export class StepController {
    constructor(private readonly stepService: StepService) { }

    @Post('/:id/add/')
    @ApiResponse({ status: HttpStatus.OK, type: AgreementStepDto })
    @UseGuards(AuthGuard, AgreementGuard)
    async addStep(
        @Req() request: RequestType,
        @Body() stepDto: Step
    ): Promise<AgreementStepDto> {
        return await this.stepService.addStep(stepDto, request.agreement)
    }

    @ApiProperty({ title: "Редактирование шага" })
    @ApiResponse({ status: HttpStatus.OK, type: AgreementStepDto })
    @Put("/:id/edit/:stepId")
    @UseGuards(AuthGuard, AgreementGuard)
    async editStep(
        @Param("stepId") stepId: UUID,
        @Req() request: RequestType,
        @Body() stepDto: EditStepDto
    ): Promise<AgreementStepDto> {
        return await this.stepService.editStep(request.agreement, stepId, stepDto, request.user.id)
    }

    @ApiProperty({ title: "Завершение этапа " })
    @ApiResponse({ status: HttpStatus.OK, type: AgreementStepDto })
    @UseGuards(AuthGuard, StepGuard)
    @Put("/:id/complete")
    async completeStep(
        @Req() request: RequestType
    ): Promise<AgreementStepDto> {
        return await this.stepService.completeStep(request.step, request.user.id)
    }

    @ApiProperty({ title: "Отмена этапа" })
    @ApiResponse({ status: HttpStatus.OK, type: AgreementStepDto })
    @Delete("/cancel/:id")
    @UseGuards(AuthGuard, StepGuard)
    async cancelStep(@Req() request: RequestType): Promise<AgreementStepDto> {
        return await this.stepService.cancelStep(request.step);
    }

    @ApiProperty({ title: "Удаление этапа" })
    @ApiResponse({
        status: HttpStatus.OK, example: {
            success: true,
            message: "Этап был успешно удален"
        }
    })
    @UseGuards(AuthGuard, AgreementGuard)
    @Delete("/:id/delete/:stepId")
    async deleteStep(@Req() request: RequestType, @Param("stepId") stepId: UUID): Promise<{
        success: boolean;
        message: string;
    }> {
        return await this.stepService.deleteStep(request.agreement, stepId);
    }

    @ApiOperation({
        summary: "Изменение последовательности шагов"
    })
    @ApiResponse({
        status: HttpStatus.OK, type: AgreementDto
    })
    @ApiBadRequestResponse({
        example: [
            {
                "message": "Количество этапов в запросе не совпадает с количеством этапов в договоре.",
                "error": "Bad Request",
                "statusCode": 400
            },
            {
                "message": "Вы не можете изменить порядок этапов, так как договор был подписан.",
                "error": "Bad Request",
                "statusCode": 400
            },
            {
                "message": "Вы не можете изменить порядок этапов в договоре, так как не являетесь его инициатором.",
                "error": "Bad Request",
                "statusCode": 400
            }
        ]
    })
    @ApiNotFoundResponse({
        example: {
            "message": "Этап с id b2164a80-e6a2-4424-ab17-197552c11f3c не найден.",
            "error": "Not Found",
            "statusCode": 404
        }
    })
    @UseGuards(AuthGuard, AgreementGuard)
    @Put("/change-order")
    async changeOrder(@Req() request: RequestType, @Body() stepsDto: ChangeOrder): Promise<AgreementDto> {
        return this.stepService.changeStepsOrder(request.agreement, stepsDto, request.user.id);
    }

    @ApiProperty({ title: "Взять этап в работу" })
    @ApiResponse({
        status: HttpStatus.OK, type: AgreementStepDto
    })
    @Post("/:agreementId/take/:stepId")
    @UseGuards(AuthGuard, StepGuard, AgreementGuard)
    async takeStep(@Req() request: RequestType) {
        return await this.stepService.takeStep(request.step, request.agreement);
    }

    @ApiProperty({ title: "Добавление фотографий к шагу " })
    @ApiResponse({
        status: HttpStatus.OK, type: AgreementStepDto
    })
    @ApiNotFoundResponse({
        example: {
            "message": "Фотография с названием 6677b140-981d-42c9-995c-759bbc924568.jpg не существует",
            "error": "Not Found",
            "statusCode": 404
        }
    })
    @Post('/addPhotos/:id')
    @UseGuards(AuthGuard, StepGuard)
    async addStepPhotos(
        @Body() imageDto: ImagesDto,
        @Req() request: RequestType
    ): Promise<AgreementStepDto> {
        return await this.stepService.addStepImages(request.step, imageDto.images, request.user.id);
    }
}