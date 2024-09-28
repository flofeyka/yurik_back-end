import { Body, Controller, Delete, HttpStatus, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ApiBadRequestResponse, ApiNotFoundResponse, ApiProperty, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/auth.guard";
import { RequestType } from "types/types";
import { Step } from "../dtos/edit-steps-dto";
import { ImagesDto } from "../dtos/images-dto";
import { AgreementGuard } from "../guards/agreement.guard";
import { StepService } from "./step.service";
import { StepGuard } from "./guards/step.guard";
import { EditStepDto } from "./dtos/edit-step-dto";
import { UUID } from "crypto";

@ApiTags("Agreement Step API")
@Controller("/agreement/step")
export class StepController {
    constructor(private readonly stepService: StepService) { }

    @ApiProperty({ title: "Добавление фотографий к шагу " })
    @ApiResponse({
        status: HttpStatus.OK, example: {
            "id": "d8abb59e-5fa3-4e75-b02b-e23fa7c843ba",
            "title": "Закупка материалов",
            "user": {
                "id": 10,
                "firstName": "Данил",
                "lastName": "Баширов",
                "middleName": "Владленович",
                "email": "danilbashirov0@vk.com",
                "status": "Заказчик",
                "inviteStatus": "Подтвердил"
            },
            "images": [
                "http://localhost:3000/api/images/picture/1aad9b7b-771a-4a37-823c-8de2dd4a8f02.jpg",
                "http://localhost:3000/api/images/picture/356d2593-16f7-4242-9e12-e30e954812ac.jpg",
                "http://localhost:3000/api/images/picture/f090d598-a785-4a95-b3c5-3b2504d897df.jpg",
                "http://localhost:3000/api/images/picture/d458e39b-9721-4f22-95fe-067d1597a817.jpg",
                "http://localhost:3000/api/images/picture/6677b140-981d-42c9-995c-759bbc924568.jpg"
            ],
            "payment": null,
            "isComplete": "false",
            "start": "2024-09-26",
            "end": "2024-09-28"
        }
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
    ) {
        return await this.stepService.addStepImages(request.step, imageDto.images, request.user.id);
    }

    @ApiProperty({ title: "Отмена этапа" })
    @ApiResponse({
        status: HttpStatus.OK, example: {
            "id": "d5ba443a-a952-4cb0-8021-093eaf534a71",
            "title": "Оплата",
            "user": {
                "id": 10,
                "firstName": "Данил",
                "lastName": "Баширов",
                "middleName": "Владленович",
                "email": "danilbashirov0@vk.com",
                "status": "Заказчик",
                "inviteStatus": "Подтвердил"
            },
            "images": [],
            "payment": {
                "price": 123451
            },
            "status": "Отклонён",
            "start": "2024-09-26",
            "end": "2024-09-28"
        }
    })
    @Delete("/cancel/:id")
    @UseGuards(AuthGuard, StepGuard)
    async cancelStep(@Req() request: RequestType) {
        return await this.stepService.cancelStep(request.step);
    }

    @ApiProperty({ title: "Удаление этапа"})
    @ApiResponse({
        status: HttpStatus.OK, example: {
            success: true,
            message: "Этап был успешно удален"
        }
    })
    @UseGuards(AuthGuard, AgreementGuard)
    @Delete("/:id/delete/:stepId")
    async deleteStep(@Req() request: RequestType, @Param("stepId") stepId: UUID) {
        return await this.stepService.deleteStep(request.agreement, stepId);
    }



    @ApiProperty({ title: "Редактирование шага" })
    @ApiResponse({
        status: HttpStatus.OK, example: {
            "id": "a35e4321-fb8c-498b-9bf0-e1ef6915ed71",
            "title": "Закупка материаловss",
            "user": {
                "id": 10,
                "firstName": "Данил",
                "lastName": "Баширов",
                "middleName": "Владленович",
                "email": "danilbashirov0@vk.com",
                "status": "Заказчик",
                "inviteStatus": "Подтвердил"
            },
            "images": [],
            "payment": null,
            "isComplete": "Ожидает",
            "start": "2024-09-27",
            "end": "2024-09-28"
        }
    })
    @Put("/:id/edit/:stepId")
    @UseGuards(AuthGuard, AgreementGuard)
    async editStep(
        @Param("stepId") stepId: UUID,
        @Req() request: RequestType,
        @Body() stepDto: EditStepDto
    ) {
        return await this.stepService.editStep(request.agreement, stepId, stepDto, request.user.id)
    }


    @Post('/:id/add/')
    @ApiResponse({
        status: HttpStatus.OK, example: {
            "id": "d5ba443a-a952-4cb0-8021-093eaf534a71",
            "title": "Оплата",
            "status": "Ожидает",
            "payment": {
                "price": 123451
            },
            "comment": "Заказчик обязуется оплатить положенную сумму в установленные договором и этапом сроками.",
            "start": "2024-09-26",
            "end": "2024-09-28",
            "user": {
                "id": "866f1429-8432-4d40-9582-a30be8547b26",
                "status": "Заказчик",
                "inviteStatus": "Подтвердил",
                "user": {
                    "id": 10,
                    "firstName": "Данил",
                    "lastName": "Баширов",
                    "middleName": "Владленович",
                    "phoneNumber": "79953020846",
                    "BirthDate": "2001-04-23",
                    "email": "danilbashirov0@vk.com",
                    "imageUrl": null,
                    "image": {
                        "id": 20,
                        "name": "01dc8cdc-c24b-4938-8a65-30b4a7787cbf.png"
                    },
                    "telegram_account": {
                        "id": "fbe86449-e9d0-48d4-bcd4-76cd2d9796e9",
                        "telegramID": "5539208376"
                    },
                    "personalData": {
                        "id": "8ccb7729-d116-4d8c-8745-bc9d06501faf",
                        "authority": "УМВД ПО ТЮМЕНСКОЙ ОБЛАСТИ",
                        "passportDate": "2001-11-09T19:00:00.000Z",
                        "serial": "1734",
                        "number": "552543",
                        "address": "Г. Тюмень, улица Мориса Тореза, 1, 1",
                        "TIN": "12345672901"
                    }
                }
            },
            "images": []
        }
    })
    @UseGuards(AuthGuard, AgreementGuard)
    async addStep(
        @Req() request: RequestType,
        @Body() stepDto: Step
    ) {
        return await this.stepService.addStep(stepDto, request.agreement)
    }
}