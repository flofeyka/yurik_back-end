import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AgreementStepDto } from "../dtos/agreement-dto";
import { AgreementStep } from "./entities/step.entity";
import { ImageDto } from "src/images/dtos/ImageDto";
import { EditStepsDto, Step } from "../dtos/edit-steps-dto";
import { AgreementMember } from "../members/member.entity";
import { Agreement } from "../entities/agreement.entity";
import { InsertResult, Repository } from "typeorm";
import { ImagesService } from "src/images/images.service";
import { InjectRepository } from "@nestjs/typeorm";
import { UUID } from "crypto";
import { Image } from "src/images/image.entity";
import { StepImage } from "./entities/step-image.entity";

@Injectable()
export class StepService {
    constructor(
        @InjectRepository(Agreement) private readonly agreementRepository: Repository<Agreement>,
        @InjectRepository(AgreementMember) private readonly memberRepository: Repository<AgreementMember>,
        @InjectRepository(AgreementStep) private readonly stepRepository: Repository<AgreementStep>,
        @InjectRepository(StepImage) private readonly stepImageRepository: Repository<StepImage>,
        private readonly imagesService: ImagesService,
    ) { }
    async addStepImages(step: AgreementStep, images: string[], userId: number): Promise<AgreementStepDto> {
        console.log(step.images);
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

                return await this.stepImageRepository.findOne({ where: {id: stepImage.identifiers[0].id}, relations: {
                    image: true
                }});
            }),
        );
        step.images = [...step?.images, ...imagesFound];
        const stepSaved = await this.stepRepository.save(step);
        console.log(stepSaved);

        return new AgreementStepDto(stepSaved, userId);
    }

    async editStep(stepsDto: EditStepsDto) {
        const steps = Promise.all(
            stepsDto.steps.map(async (step: Step) => {
                const stepFound = await this.stepRepository.findOne({
                    where: {
                        id: step?.id,
                    },
                });
            }),
        );
    }

    async addStep(step: Step, agreement: Agreement): Promise<AgreementStep> {
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
        }]).execute();

        const stepFound = await this.stepRepository.findOne({
            where: { id: stepCreated.identifiers[0].id },
            relations: {
                user: {
                    user: true,
                },
            },
        });

        agreement.steps.push(stepFound);
        await this.agreementRepository.save(agreement);
        return stepFound;
    }

    async findStep(id: number) {
        const step = await this.stepRepository.findOne({
            where: { id: id },
            relations: {
                user: {
                    user: true,
                },
                images: {
                    image: true
                }
            },
        });

        if (!step) {
            throw new NotFoundException(`Этап с id ${id} не был найден`);
        }

        return step;
    }
}