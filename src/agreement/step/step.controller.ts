import { Body, Controller, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ApiProperty, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/auth.guard";
import { RequestType } from "types/types";
import { Step } from "../dtos/edit-steps-dto";
import { ImagesDto } from "../dtos/images-dto";
import { AgreementGuard } from "../guards/agreement.guard";
import { StepService } from "./step.service";
import { StepGuard } from "./guards/step.guard";
import { EditStepDto } from "./dtos/edit-step-dto";

@ApiTags("Agreement Step API")
@Controller("/agreement/step")
export class StepController {
    constructor(private readonly stepService: StepService) { }

    @Post('/addPhotos/:id')
    @UseGuards(AuthGuard, StepGuard)
    async addStepPhotos(
        @Body() imageDto: ImagesDto,
        @Req() request: RequestType
    ) {
        return await this.stepService.addStepImages(request.step, imageDto.images, request.user.id);
    }


    @ApiProperty({ title: "Редактирование шага" })
    @Put("/:id/edit/:stepId")
    @UseGuards(AuthGuard, AgreementGuard)
    async editStep(
        @Param("stepId") stepId: number,
        @Req() request: RequestType,
        @Body() stepDto: EditStepDto
    ) {
        return await this.stepService.editStep(request.agreement, stepId, stepDto, request.user.id)
    }


    @Post('/:id/add/')
    @UseGuards(AuthGuard, AgreementGuard)
    async addStep(
        @Req() request: RequestType,
        @Body() stepDto: Step
    ) {
        return await this.stepService.addStep(stepDto, request.agreement)
    }
}