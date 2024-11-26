import { BadRequestException, Injectable } from "@nestjs/common";
import { User } from "src/user/entities/user.entity";
import { Lawyer } from "./lawyer.entity";
import { AgreementMember } from "../members/member.entity";
import { Agreement } from "../entities/agreement.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AgreementDto } from "../dtos/agreement-dto";
import { UserService } from "src/user/user.service";

@Injectable()
export class LawyerService {
    constructor(
        @InjectRepository(Lawyer) private readonly lawyerRepository: Repository<Lawyer>,
        @InjectRepository(AgreementMember) private readonly memberRepository: Repository<AgreementMember>,
        @InjectRepository(Agreement) private readonly agreementRepository: Repository<Agreement>,
        private readonly userService: UserService
    ) {}

    async sendToLawyer(userId: number, agreement: Agreement) {
        if (agreement.initiator.user.id !== userId) {
            throw new BadRequestException(
                'Вы не можете пригласить юриста в договор, так как не являетесь его инициатором.',
            );
        }

        if (agreement.status === 'Расторгнут') {
            throw new BadRequestException(
                'Вы не можете пригласить юриста в отклоненный договор',
            );
        }

        if (agreement.status === 'У юриста') {
            throw new BadRequestException(
                'Договор уже находится на рассмотрении у юриста.',
            );
        }

        if (agreement.status === 'В поиске юриста') {
            throw new BadRequestException('Договор уже в списке очереди у юриста.');
        }

        await this.agreementRepository.save({
            ...agreement,
            status: 'В поиске юриста',
        });

        return true;
    }

    async getLawyerAgreements(userId: number): Promise<AgreementDto[]> {
        const agreements: Agreement[] = await this.agreementRepository.find({
            where: {
                status: 'В поиске юриста',
            },
            relations: {
                members: {
                    user: true,
                },
                steps: {
                    user: true,
                },
            },
        });

        return agreements.map(
            (agreement: Agreement) => new AgreementDto(agreement, userId),
        );
    }

    async takeLawyerAgreement(
        lawyer: Lawyer,
        agreementId: number,
    ): Promise<{ message: string; success: boolean }> {
        const agreement: Agreement = await this.agreementRepository.findOne({
            where: {
                id: agreementId,
            },
            relations: {
                members: {
                    user: true,
                },
            },
        });

        if (
            agreement.members.find(
                (member: AgreementMember) => member.user.id === lawyer.user.id,
            )
        ) {
            throw new BadRequestException(
                'Вы не можете взять данный договор в работу т.к. вы являетесь его стороной',
            );
        }

        if (agreement.status !== 'В поиске юриста') {
            throw new BadRequestException(
                'Вы не можете взять договор в работу, так как он не искал юриста.',
            );
        }

        await this.lawyerRepository.save({
            ...lawyer,
            agreements: [...lawyer.agreements, agreement],
        });

        await this.agreementRepository.update(
            {
                id: agreementId,
            },
            {
                status: 'У юриста',
                lawyer: lawyer,
            },
        );

        return {
            message: 'Вы успешно взяли договор в работу.',
            success: true,
        };
    }

    async createLawyer(userId: number): Promise<Lawyer> {
        const user: User = await this.userService.findUser(userId);

        const lawyer: Lawyer = await this.lawyerRepository.findOne({
            where: {
                user: {
                    id: userId,
                },
            },
        });

        if (lawyer) {
            throw new BadRequestException('Вы уже являетесь юристом.');
        }

        return await this.lawyerRepository.save({ user });
    }
}