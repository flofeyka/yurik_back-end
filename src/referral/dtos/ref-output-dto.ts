import { ApiProperty } from "@nestjs/swagger";
import { UUID } from "crypto";
import { Referral } from "../referral.entity";
import { UserDto } from "../../user/dtos/user-dto";
import { ProfileDto } from "../../user/dtos/profile-dto";
import { User } from "../../user/entities/user.entity";

export class RefDto {
  @ApiProperty({title: "Айди рефералки"})
  id: UUID;

  @ApiProperty({title: "Люди, перешедшие по ссылке"})
  users: ProfileDto[];

  constructor(ref: Referral) {
    this.id = ref.id;
    this.users = ref.users?.map((user: User): ProfileDto => new ProfileDto(user))
  }
}