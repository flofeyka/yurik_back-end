import { BadRequestException, Injectable, UnauthorizedException, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthToken } from './authToken.entity';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dtos/create-user-dto';
import { LoginDto } from './dtos/login-dto';
import * as bcrypt from "bcryptjs";
import { UserDto } from 'src/user/dtos/user-dto';

@Injectable()
export class AuthService {
    constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>, private readonly userService: UserService, private readonly jwtService: JwtService, @InjectRepository(AuthToken) private readonly tokenRepository: Repository<AuthToken>) { }

    async getAllUsers(): Promise<User[]> {
        return await this.usersRepository.find({});
    }

    async signUp(userDto: CreateUserDto) {
        const candidat: User | undefined = await this.usersRepository.findOne({ where: { phoneNumber: userDto.phoneNumber, telegramID: userDto.telegramID } });
        if (candidat && candidat.phoneNumber) {
            throw new BadRequestException("Номер телефона уже зарегистрирован.");
        }

        if (candidat && candidat.telegramID) {
            throw new BadRequestException("Телеграм аккаунт уже зарегистрирован.");;
        }

        const passwordSalt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(userDto.password, passwordSalt);
        const newUser = await this.userService.createUser({...userDto, password: passwordHash});
        const { token } = await this.generateToken(newUser);

        return {
            user: newUser,
            token: token
        }
    }

    async signIn(loginDto: LoginDto) {
        const {phoneNumber, password} = loginDto;
        
        const candidat = await this.usersRepository.findOne({where: {phoneNumber}});

        if(!candidat) {
            throw new UnauthorizedException("Неправильный номер телефона или пароль");
        }

        const passwordCompared = await bcrypt.compare(password, candidat.password);

        if(!passwordCompared) {
            throw new UnauthorizedException("Неправильный номер телефона или пароль");
        }

        const {token} = await this.generateToken(candidat);

        return {
            user: new UserDto(candidat),
            token
        }
    }

    async generateToken(user: User) {
        const payload = {
            id: user.id,
            telegramID: user.telegramID,
            lastName: user.lastName
        }

        const token = this.jwtService.sign(payload);

        const tokenCandidat = await this.tokenRepository.findOne({where: {userId: payload.id}});

        if(tokenCandidat) {
            const tokenCreated = await this.tokenRepository.save({
                id: tokenCandidat.id,
                userId: payload.id,
                token
            });

            return {
                token: tokenCreated
            }
        }
        
        const tokenCreated = await this.tokenRepository.createQueryBuilder().insert().into(AuthToken).values([{
            userId: user.id,
            token
        }]).execute();

        const tokenFound = await this.tokenRepository.findOne({ where: { id: tokenCreated.identifiers[0].id } });

        return {
            token: tokenFound
        }
    }

    async findToken(token: string) {
        const tokenFound = await this.tokenRepository.findOne({where: {token}});
        return {
            isAuth: tokenFound ? true : false,
            userData: this.jwtService.verify(token)
        }
    }
}
