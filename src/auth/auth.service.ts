import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../user/entities/user.entity";
import { InsertResult, Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { AuthToken, AuthTokenPayload } from "./entities/authToken.entity";
import { UserService } from "src/user/user.service";
import { CreateUserDto } from "src/user/dtos/create-user-dto";
import { LoginDto } from "./dtos/login-dto";
import { UserDto } from "src/user/dtos/user-dto";
import { UUID } from "crypto";
import { TelegramAccount } from "src/user/entities/telegram-account.entity";
import { AppService } from "../app.service";

export interface tokenAndUserType {
  token: string;
  user: UserDto;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(AuthToken) private readonly tokenRepository: Repository<AuthToken>,
    @InjectRepository(TelegramAccount) private readonly telegramAccountsRepository: Repository<TelegramAccount>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly appService: AppService
  ) {
  }

  async signUp(userDto: CreateUserDto): Promise<tokenAndUserType> {
    const decryptedTelegramID: number = Number(this.appService.decryptText(userDto.telegramID));
    const telegramAccountFound: TelegramAccount = await this.telegramAccountsRepository.findOne({ where: { telegramID: decryptedTelegramID } });
    if (!telegramAccountFound) {
      throw new BadRequestException("Пожалуйста, зарегистрируйте Telegram-аккаунт, прежде чем продолжить.");
    }

    const existingUser: User | undefined = await this.usersRepository.findOne({
      where: [
        { phoneNumber: userDto.phoneNumber },
        { telegram_account: telegramAccountFound }
      ]
    });

    if (existingUser) {
      throw new BadRequestException("Телеграм аккаунт или номер телефона уже зарегистрированы.");
    }

    if (userDto.phoneNumber.length !== 11) {
      throw new BadRequestException("Неверный номер телефона");
    }

    const newUser: User = await this.userService.createUser(userDto, telegramAccountFound);
    await this.telegramAccountsRepository.save({
      ...telegramAccountFound,
      user: newUser
    })
    const token: string = await this.generateToken(newUser);

    return {
      user: newUser,
      token: token
    };
  }

  async signIn(loginDto: LoginDto): Promise<tokenAndUserType> {
    const decryptedTelegramID: number = Number(this.appService.decryptText(loginDto.telegramID));
    const existingUser: User = await this.usersRepository.findOne({
      where: {
        telegram_account: {
          telegramID: decryptedTelegramID
        }
      },
      relations: {
        telegram_account: true
      }
    });

    if (!existingUser) {
      throw new UnauthorizedException("Неверные данные для входа.");
    }

    const token: string = await this.generateToken(existingUser);

    return {
      user: new UserDto(existingUser),
      token
    };
  }

  async generateToken(user: User): Promise<string> {
    const payload: AuthTokenPayload = {
      id: user.id,
      telegramID: user.telegram_account.telegramID,
      lastName: user.lastName
    };

    const token: string = this.jwtService.sign(payload);

    const existingToken: AuthToken = await this.tokenRepository.findOne({ where: { user } });

    if (existingToken) {
      const tokenCreated: AuthToken = await this.tokenRepository.save({
        id: existingToken.id,
        userId: payload.id,
        token
      });

      return tokenCreated.token;
    }

    const tokenCreated: InsertResult = await this.tokenRepository.createQueryBuilder().insert().into(AuthToken).values([{
      user,
      token
    }]).execute();

    const tokenFound: AuthToken = await this.tokenRepository.findOne({ where: { id: tokenCreated.identifiers[0].id } });

    return tokenFound.token;
  }

  async findToken(token: string): Promise<{ isAuth: boolean; userData: AuthTokenPayload | undefined }> {
    const verifiedToken: AuthTokenPayload = this.jwtService.verify(token);
    if (!verifiedToken) {
      throw new UnauthorizedException("User is not authorized");
    }

    const tokenFound: AuthToken = await this.tokenRepository.findOne({ where: { token } });
    return {
      isAuth: !!tokenFound && !!verifiedToken,
      userData: verifiedToken
    };
  }
}
