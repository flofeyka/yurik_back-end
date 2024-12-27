import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Referral } from "./referral.entity";
import { Repository } from "typeorm";
import { User } from "../user/entities/user.entity";
import { UserService } from "../user/user.service";
import { RefDto } from "./dtos/ref-output-dto";
import { UUID } from "crypto";

@Injectable()
export class ReferralService {
  constructor(@InjectRepository(Referral) private readonly referralRepository: Repository<Referral>, private readonly userService: UserService) {};

  async createRef(user_id: number): Promise<RefDto> {
    const user: User = await this.userService.findUser(user_id);
    const ref: Referral = await this.referralRepository.save({user: user});
    return new RefDto(ref);
  }

  async getUserRefs(user_id: number): Promise<RefDto[]> {
    const refs: Referral[] = await this.referralRepository.find({
      where: {
        user: {
          id: user_id
        }
      }, relations: {
        users: true
      }
    });

    return refs.map((ref: Referral): RefDto => new RefDto(ref));
  }

  public async findRef(ref_id: UUID): Promise<Referral | null> {
    return await this.referralRepository.findOne({where: { id: ref_id },
      relations: {
        user: {
          deposit: true
        }
      }
    })
  }
}