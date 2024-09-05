import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(@Inject(AuthService) private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest();

        try {
            const authHeader = req.headers.authorization;
            const token = authHeader && authHeader.split(" ")[1];

            if(!token) {
                throw new UnauthorizedException({message: "Пользователь не авторизован"});
            }

            const userData = await this.authService.findToken(token);
            if(!userData.isAuth) {
                throw new UnauthorizedException({message: "Пользователь не авторизован"});
            }

            req.user = userData;
            return true;
        } catch(e) {
            console.log(e);
            throw new UnauthorizedException("Пользователь не авторизован");
        }
    }
}