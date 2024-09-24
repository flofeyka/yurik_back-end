import { IntersectionType } from '@nestjs/swagger';
import { LegalInformationDto } from './legal-information-dto';
import { UserInfoDto } from './user-info-dto';

export class EditUserDto extends IntersectionType(
  UserInfoDto,
  LegalInformationDto,
) {}
