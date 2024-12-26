import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestType } from 'types/types';
import { AgreementDto } from '../dtos/agreement-dto';
import { InviteUserDto } from '../dtos/invite-user-dto';
import { AgreementGuard } from '../guards/agreement.guard';
import { MemberService } from './member.service';

@ApiTags('Agreement Members API')
@Controller('/agreement/member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @ApiOperation({
    summary: 'Приглашение нового участника в договор до его подписания',
  })
  @Post('/invite/:id/:memberId')
  @UseGuards(AuthGuard, AgreementGuard)
  async inviteMember(
    @Req() request: RequestType,
    @Param('memberId') memberId: number,
    @Body() inviteDto: InviteUserDto,
  ): Promise<{
    isInvited: boolean;
    message: string;
    agreement: AgreementDto;
  }> {
    return this.memberService.inviteNewMember(
      request.user.id,
      memberId,
      inviteDto.status,
      request.agreement,
    );
  }

  @ApiOperation({
    summary: 'Удаление участника из договора',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      success: true,
      message: 'Участник был успешно удален',
    },
  })
  @Delete('/:id/:userId')
  @UseGuards(AuthGuard, AgreementGuard)
  async deleteMember(
    @Req() request: RequestType,
    @Param('userId') userId: number,
  ): Promise<any> {
    return await this.memberService.deleteMember(
      request.agreement,
      userId,
      request.user.id,
    );
  }
}
