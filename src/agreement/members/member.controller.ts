import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/auth/auth.guard";
import { RequestType } from "types/types";
import { AgreementDto } from "../dtos/agreement-dto";
import { InviteUserDto } from "../dtos/invite-user-dto";
import { AgreementGuard } from "../guards/agreement.guard";
import { MemberService } from "./member.service";

@ApiTags('Agreement Members API')
@Controller('/agreement/member')
export class MemberController {
    constructor(private readonly memberService: MemberService) { }

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
            inviteDto.legalInformation,
            request.agreement
        );
    }
}