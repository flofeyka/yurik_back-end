import { BadRequestException, Injectable, UnauthorizedException, UseGuards } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {User} from "../user/user.entity";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { AuthToken } from "./authToken.entity";
import { UserService } from "src/user/user.service";
import { CreateUserDto } from "src/user/dtos/create-user-dto";
import { LoginDto } from "./dtos/login-dto";
import * as bcrypt from "bcryptjs";
import { UserDto } from "src/user/dtos/user-dto";
import { tokenAndUserType } from "./auth.controller";

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>, private readonly userService: UserService, private readonly jwtService: JwtService, @InjectRepository(AuthToken) private readonly tokenRepository: Repository<AuthToken>) {
  }

  async signUp(userDto: CreateUserDto): Promise<tokenAndUserType> {
    const existingUser: User | undefined = await this.usersRepository.findOne({
      where: {
        phoneNumber: userDto.phoneNumber,
        telegramID: userDto.telegramID
      }
    });
    if (existingUser && existingUser.phoneNumber) {
      throw new BadRequestException("Номер телефона уже зарегистрирован.");
    }

    if (existingUser && existingUser.telegramID) {
      throw new BadRequestException("Телеграм аккаунт уже зарегистрирован.");
    }

    const passwordSalt: string = await bcrypt.genSalt(10);
    const passwordHash: string = await bcrypt.hash(userDto.password, passwordSalt);
    const newUser: User = await this.userService.createUser({ ...userDto, password: passwordHash });
    const token: string = await this.generateToken(newUser);

    return {
      user: newUser,
      token: token
    };
  }

  async signIn(loginDto: LoginDto): Promise<tokenAndUserType> {
    const { phoneNumber, password } = loginDto;

    const existingUser: User = await this.usersRepository.findOne({ where: { phoneNumber } });

    if (!existingUser) {
      throw new UnauthorizedException("Неправильный номер телефона или пароль");
    }

    const passwordCompared: boolean = await bcrypt.compare(password, existingUser.password);

    if (!passwordCompared) {
      throw new UnauthorizedException("Неправильный номер телефона или пароль");
    }

    const token: string = await this.generateToken(existingUser);

    return {
      user: new UserDto(existingUser),
      token
    };
  }

  async generateToken(user: User) {
    const payload = {
      id: user.id,
      telegramID: user.telegramID,
      lastName: user.lastName
    };

    const token: string = this.jwtService.sign(payload);

    const existingToken: AuthToken = await this.tokenRepository.findOne({ where: { userId: payload.id } });

    if (existingToken) {
      const tokenCreated: AuthToken = await this.tokenRepository.save({
        id: existingToken.id,
        userId: payload.id,
        token
      });

      return tokenCreated.token;
    }

    const tokenCreated = await this.tokenRepository.createQueryBuilder().insert().into(AuthToken).values([{
      userId: user.id,
      token
    }]).execute();

    const tokenFound = await this.tokenRepository.findOne({ where: { id: tokenCreated.identifiers[0].id } });

    return tokenFound.token;
  }

  async findToken(token: string) {
    const tokenFound = await this.tokenRepository.findOne({ where: { token } });
    return {
      isAuth: !!tokenFound,
      userData: this.jwtService.verify(token)
    };
  }
}
