import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UUID } from "crypto";
import { Image } from "src/images/image.entity";
import { ImagesService } from "src/images/images.service";
import { DeleteResult, InsertResult, Repository } from "typeorm";
import { AgreementDto, AgreementStepDto } from "../dtos/agreement-dto";
import { Step } from "../dtos/edit-steps-dto";
import { Agreement } from "../entities/agreement.entity";
import { AgreementMember } from "../members/member.entity";
import { MemberService } from "../members/member.service";
import { ChangeOrder } from "./dtos/change-order-dto";
import { EditStepDto } from "./dtos/edit-step-dto";
import { StepImage } from "./entities/step-image.entity";
import { AgreementStep } from "./entities/step.entity";
import { AppService } from "../../app.service";

@Injectable()
export class StepService {
  constructor(
    @InjectRepository(Agreement) private readonly agreementRepository: Repository<Agreement>,
    @InjectRepository(AgreementMember) private readonly memberRepository: Repository<AgreementMember>,
    @InjectRepository(AgreementStep) private readonly stepRepository: Repository<AgreementStep>,
    @InjectRepository(StepImage) private readonly stepImageRepository: Repository<StepImage>,
    private readonly imagesService: ImagesService,
    private readonly appService: AppService,
    private readonly memberService: MemberService
  ) {
  }

  async getStep(agreement: Agreement, stepId: UUID, userId: number): Promise<AgreementStepDto> {
    const step: AgreementStep = await this.stepRepository.findOne({
      where: { id: stepId },
      relations: {
        images: {
          image: true
        }
      }
    });
    if (!step || !agreement.steps.find((step: AgreementStep) => step.id === stepId)) {
      throw new NotFoundException(`Этап с id ${stepId} не найден`);
    }
    return new AgreementStepDto(step, userId);
  }

  async changeStepsOrder(agreement: Agreement, stepsDto: ChangeOrder, userId: number): Promise<AgreementDto> {
    if (agreement.status !== "Черновик") {
      throw new BadRequestException("Вы не можете изменить порядок этапов, так как договор был подписан.");
    }
    if (agreement.initiator.user.id !== userId) {
      throw new BadRequestException("Вы не можете изменить порядок этапов в договоре, так как не являетесь его инициатором.");
    }
    if (stepsDto.steps.length !== agreement.steps.length) {
      throw new BadRequestException("Количество этапов в запросе не совпадает с количеством этапов в договоре.");
    }
    agreement.steps = await Promise.all(stepsDto.steps.map(async (step: { id: UUID }, i: number) => {
      const stepFound: AgreementStep = await this.findStep(step.id);
      if (!stepFound) {
        throw new BadRequestException(`Этап с id ${step.id} не найден.`);
      }
      if (!agreement.steps.find((agreementStep: AgreementStep) => agreementStep.id === stepFound.id)) {
        throw new BadRequestException(`Этап с id ${step.id} не найден.`);
      }
      stepFound.order = i;
      await this.stepRepository.save(stepFound);
      return stepFound;
    }));

    const saved: Agreement = await this.agreementRepository.save(agreement);
    return new AgreementDto(saved, userId);
  }

  async takeStep(step: AgreementStep, agreement: Agreement): Promise<AgreementStepDto> {
    if (agreement.status !== "Активный") {
      throw new BadRequestException("Нельзя взять этап в недействующем договоре");
    }
    if (step.status !== "Ожидает") {
      throw new BadRequestException("Нельзя взять этап, так как он не находится в статусе ожидания");
    }

    step.status = "В процессе";
    const saved: AgreementStep = await this.stepRepository.save(step);
    return new AgreementStepDto(saved, step.user.user.id);
  }

  async cancelStep(step: AgreementStep): Promise<AgreementStepDto> {
    if (step.status !== "Ожидает" && step.status !== "В процессе") {
      throw new BadRequestException("Нельзя отменить этап, так как он не находится в статусе ожидания или в процессе");
    }

    step.status = "Отклонён";
    const saved: AgreementStep = await this.stepRepository.save(step);
    return new AgreementStepDto(saved, step.user.user.id);

  }

  async completeStep(step: AgreementStep, userId: number): Promise<AgreementStepDto> {
    if(step.agreement.status !== "Активный") {
      throw new BadRequestException("Договор еще неактивен")
    }
    if (step.status !== "В процессе" && step.status !== "Ожидает") {
      throw new BadRequestException("Нельзя завершить этап, так как он не находится в статусе ожидания или в процессе");
    }
    const member: AgreementMember = this.memberService.findMember(step.agreement, userId);
    const anotherMember: AgreementMember = step.agreement.members.find((member: AgreementMember): boolean => member.user.id !== userId);
    if (userId !== step.user.user.id) {
      step.status = "Завершён";
    } else {
      step.status = "Требуется действие";
      await this.appService.sendNotification(
        `${member.user.firstName} ${member.user.lastName} подтвердил этап ${step.title} в договоре ${step.agreement.title}. Пожалуйста, подтвердите выполнение для перехода к следующему этапу договора`, anotherMember.user.telegram_account.telegramID
      );
    }

    const saved: AgreementStep = await this.stepRepository.save(step);
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
    const deleteResult: DeleteResult = await this.stepRepository.delete({ id: step.id });
    if (deleteResult.affected !== 1) {
      throw new BadRequestException("Не удалось удалить этап");
    }

    return {
      success: true,
      message: "Этап был успешно удален"
    };

  }

  async editStep(agreement: Agreement, stepId: UUID, editStepDto: EditStepDto, userId: number): Promise<AgreementStepDto> {
    const step = await this.findStep(stepId);
    if (step.start && step.end && !(new Date(editStepDto.start) < new Date(editStepDto.end))) {
      throw new BadRequestException("Дата начала этапа не может быть позже даты окончания этапа");
    }
    const member: AgreementMember = this.memberService.findMember(agreement, editStepDto.userId);
    const stepSaved = await this.stepRepository.save({
      ...step,
      ...editStepDto,
      images: [...step.images],
      payment: editStepDto.payment.price > 0 ? editStepDto.payment : null,
      user: member
    });

    if (editStepDto?.images && editStepDto.images.length > 0) {
      const imagesAdded: PromiseSettledResult<StepImage>[] = await Promise.allSettled(editStepDto.images.map(async (image: string): Promise<StepImage> => {
        const imageSaved: Image = await this.imagesService.getImageByName(image);
        return await this.stepImageRepository.save({
          image: imageSaved,
          step: stepSaved
        });
      }));

      const successfulImages: StepImage[] = imagesAdded
        .filter((result: PromiseSettledResult<StepImage>): result is PromiseFulfilledResult<StepImage> => result.status === "fulfilled")
        .map((result: PromiseFulfilledResult<StepImage>): StepImage => result.value);

      stepSaved.images.push(...successfulImages);

      await this.stepRepository.save(stepSaved);
    }

    return new AgreementStepDto(stepSaved, userId);
  }

  async addStep(step: Step, agreement: Agreement): Promise<AgreementStepDto> {
    const member: AgreementMember = await this.memberRepository.findOne({
      where: {
        agreement: {
          id: agreement.id
        },
        user: {
          id: step.userId
        }
      },
      relations: {
        agreement: true,
        user: true
      }
    });
    if (!member || member.agreement.id !== agreement.id) {
      throw new NotFoundException("Пользователь не был найден в списке участников договора.");
    }

    const stepCreated: InsertResult = await this.memberRepository.createQueryBuilder().insert().into(AgreementStep).values([{
      ...step,
      images: [],
      user: member,
      payment: step.payment?.price > 0 ? step.payment : null,
      order: agreement.steps.length > 1 ? agreement.steps.reduce(function(prev, current) {
        if (current.order > prev.order) {
          return current;
        }
        return prev;
      }).order + 1 : agreement.steps.length + 1
    }]).execute();

    const stepFound: AgreementStep = await this.stepRepository.findOne({
      where: { id: stepCreated.identifiers[0].id },
      relations: {
        user: {
          user: true
        }
      }
    });

    if (step.images?.length > 0) {
      const imagesAdded = await Promise.allSettled(step.images.map(async (image: string) => {
        const imageSaved: Image = await this.imagesService.getImageByName(image);
        const stepImageAdded: StepImage = await this.stepImageRepository.save({
          image: imageSaved,
          step: stepFound
        });
        return stepImageAdded;
      }));

      const successfulImages: StepImage[] = imagesAdded
        .filter((result): result is PromiseFulfilledResult<StepImage> => result.status === "fulfilled")
        .map(result => result.value);

      stepFound.images.push(...successfulImages);

      await this.stepRepository.save(stepFound);
    }

    agreement.steps.push(stepFound);
    await this.agreementRepository.save(agreement);
    return new AgreementStepDto(stepFound, step.userId);
  }

  async findStep(id: UUID): Promise<AgreementStep> {
    const step: AgreementStep = await this.stepRepository.findOne({
      where: { id },
      relations: {
        user: {
          user: true
        },
        images: {
          image: true
        },
        agreement: {
          members: {
            user: true
          },
          lawyer: {
            user: true
          }
        }
      }
    });

    if (!step) {
      throw new NotFoundException(`Этап с id ${id} не был найден`);
    }

    return step;
  }
}