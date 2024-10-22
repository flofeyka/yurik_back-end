import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Image } from "src/images/image.entity";
import { ImagesService } from "src/images/images.service";
import { DeleteResult, InsertResult, Repository, UpdateResult } from "typeorm";
import { AgreementDto, AgreementStepDto } from "../dtos/agreement-dto";
import { Step, StepDto } from "../dtos/edit-steps-dto";
import { Agreement } from "../entities/agreement.entity";
import { AgreementMember } from "../members/member.entity";
import { MemberService } from "../members/member.service";
import { EditStepDto } from "./dtos/edit-step-dto";
import { StepImage } from "./entities/step-image.entity";
import { AgreementStep } from "./entities/step.entity";
import { UUID } from "crypto";
import { ChangeOrder } from "./dtos/change-order-dto";

@Injectable()
export class StepService {
    constructor(
        @InjectRepository(Agreement) private readonly agreementRepository: Repository<Agreement>,
        @InjectRepository(AgreementMember) private readonly memberRepository: Repository<AgreementMember>,
        @InjectRepository(AgreementStep) private readonly stepRepository: Repository<AgreementStep>,
        @InjectRepository(StepImage) private readonly stepImageRepository: Repository<StepImage>,
        private readonly memberService: MemberService,
        private readonly imagesService: ImagesService,
    ) { }
    async addStepImages(step: AgreementStep, images: string[], userId: number): Promise<AgreementStepDto> {
        if (images.length + step.images.length > 10) {
            throw new BadRequestException('В этапе не может содержаться больше 10 фотографий');
        }
        const imagesFound: StepImage[] = await Promise.all(
            images.map(async (image: string) => {
                if (step.images.find((stepImage: StepImage) => stepImage.image.name === image)) {
                    throw new BadRequestException('Фотография уже была добавлена в этап');
                }
                const imageFound: Image =
                    await this.imagesService.getImageByName(image);
                if (!imageFound) {
                    throw new NotFoundException(
                        `Фотография с названием ${image} не существует`,
                    );
                }

                const stepImage: InsertResult = await this.stepImageRepository.createQueryBuilder().insert().into(StepImage).values({
                    image: imageFound,
                    step: step,
                }).execute();

                return await this.stepImageRepository.findOne({
                    where: { id: stepImage.identifiers[0].id }, relations: {
                        image: true
                    }
                });
            }),
        );
        step.images = [...step?.images, ...imagesFound];
        const stepSaved = await this.stepRepository.save(step);

        return new AgreementStepDto(stepSaved, userId);
    }

    async changeStepsOrder(agreement: Agreement, stepsDto: ChangeOrder, userId: number): Promise<AgreementDto> {
        if(agreement.status !== "Черновик") {
            throw new BadRequestException('Вы не можете изменить порядок этапов, так как договор был подписан.');
        }
        if(agreement.initiator.user.id !== userId) {
            throw new BadRequestException('Вы не можете изменить порядок этапов в договоре, так как не являетесь его инициатором.');
        }
        if(stepsDto.steps.length !== agreement.steps.length) {
            throw new BadRequestException('Количество этапов в запросе не совпадает с количеством этапов в договоре.');
        }
        const stepsFound: AgreementStep[] = await Promise.all(stepsDto.steps.map(async (step: {id: UUID}, i: number) => {
            const stepFound: AgreementStep = await this.findStep(step.id);
            if(!stepFound) {
                throw new BadRequestException(`Этап с id ${step.id} не найден.`);
            }
            if(!agreement.steps.find((agreementStep: AgreementStep) => agreementStep.id === stepFound.id )) {
                throw new BadRequestException(`Этап с id ${step.id} не найден.`);
            }
            stepFound.order = i;
            await this.stepRepository.save(stepFound);
            return stepFound;
        }));

        console.log(stepsFound);
        agreement.steps = stepsFound;

        const saved: Agreement = await this.agreementRepository.save(agreement);
        return new AgreementDto(saved, userId);
    }

    async takeStep(step: AgreementStep, agreement: Agreement): Promise<AgreementStepDto> {
        if (agreement.status !== "В работе") {
            throw new BadRequestException("Нельзя взять этап в недействующем договоре");
        }
        if (step.status !== "Ожидает") {
            throw new BadRequestException("Нельзя взять этап, так как он не находится в статусе ожидания");
        }

        step.status = "В процессе";
        const saved: AgreementStep = await this.stepRepository.save(step);
        return new AgreementStepDto(saved, step.user.user.id);
    }

    async cancelStep(step: AgreementStep) {
        if (step.status !== "Ожидает" && step.status !== "В процессе") {
            throw new BadRequestException("Нельзя отменить этап, так как он не находится в статусе ожидания или в процессе");
        }

        step.status = "Отклонён";
        const saved: AgreementStep = await this.stepRepository.save(step);
        return new AgreementStepDto(saved, step.user.user.id);

    }

    async completeStep(step: AgreementStep, userId: number): Promise<AgreementStepDto> {
        if (step.status !== "В процессе" && step.status !== "Ожидает") {
            throw new BadRequestException("Нельзя завершить этап, так как он не находится в статусе ожидания или в процессе");
        }

        step.status = "Завершён";
        const saved = await this.stepRepository.save(step);
        return new AgreementStepDto(saved, userId);
    }

    async deleteStep(agreement: Agreement, stepId: UUID): Promise<{
        success: boolean;
        message: string;
    }> {
        if (agreement.status !== "Черновик") {
            throw new BadRequestException("Нельзя удалить этап, так как договор не является черновиком");
        }


        const step: AgreementStep = await this.findStep(stepId);
        if (!agreement.steps.find((step: AgreementStep) => step.id === stepId)) {
            throw new BadRequestException("Нельзя удалить этап, так как он не принадлежит данному договору");
        }
        const deleteResult: DeleteResult = await this.stepRepository.delete({id: step.id });
        if (deleteResult.affected !== 1) {
            throw new BadRequestException("Не удалось удалить этап");
        }

        return {
            success: true,
            message: "Этап был успешно удален"
        }

    }

    async editStep(agreement: Agreement, stepId: UUID, editStepDto: EditStepDto, userId: number): Promise<AgreementStepDto> {
        const step = await this.findStep(stepId);
        if (step.start && step.end && !(new Date(editStepDto.start) < new Date(editStepDto.end))) {
            throw new BadRequestException('Дата начала этапа не может быть позже даты окончания этапа');
        }
        const member: AgreementMember = this.memberService.findMember(agreement, editStepDto.userId);
        const stepSaved = await this.stepRepository.save({
            ...step,
            ...editStepDto,
            user: member
        });

        return new AgreementStepDto(stepSaved, userId);
    }

    async addStep(step: Step, agreement: Agreement): Promise<AgreementStepDto> {
        const member: AgreementMember = await this.memberRepository.findOne({
            where: {
                agreement: {
                    id: agreement.id,
                    members: {
                        user: {
                            id: step.userId
                        }
                    }
                },
            },
            relations: {
                user: true,
                agreement: true,
            },
        });

        if (!member) {
            throw new NotFoundException("Пользователь не был найден в списке участников договора.");
        }

        const stepCreated: InsertResult = await this.memberRepository.createQueryBuilder().insert().into(AgreementStep).values([{
            ...step,
            user: member,
            order: agreement.steps.length + 1
        }]).execute();

        const stepFound: AgreementStep = await this.stepRepository.findOne({
            where: { id: stepCreated.identifiers[0].id },
            relations: {
                user: {
                    user: true,
                },
            },
        });

        agreement.steps.push(stepFound);
        await this.agreementRepository.save(agreement);
        return new AgreementStepDto(stepFound, step.userId);
    }

    async findStep(id: UUID): Promise<AgreementStep> {
        const step: AgreementStep = await this.stepRepository.findOne({
            where: { id },
            relations: {
                user: {
                    user: true,
                },
                images: {
                    image: true
                },
            },
        });

        if (!step) {
            throw new NotFoundException(`Этап с id ${id} не был найден`);
        }

        return step;
    }
}