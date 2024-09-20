import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { InsertResult, Repository } from "typeorm";
import { EditUserDto } from "./dtos/edit-user-dto";
import { CreateUserDto } from "./dtos/create-user-dto";
import { UserDto } from "./dtos/user-dto";
import { TelegramAccount } from "./entities/telegram-account.entity";
import { AppService } from "src/app.service";
import { SmsService } from "src/sms/sms.service";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(TelegramAccount) private readonly telegramAccountsRepository: Repository<TelegramAccount>,
    private readonly smsService: SmsService,
    private readonly appService: AppService
) {
  };

  async createUser(userDto: CreateUserDto): Promise<User> {
    const telegramAccountFound = await this.telegramAccountsRepository.findOneBy( {telegramID: Number(userDto.telegramID)} );
    if (!telegramAccountFound) {
      throw new BadRequestException("Пользователь с таким телеграм-аккаунтом не зарегистрирован в боте");
    }
    const createdUser: InsertResult = await this.usersRepository.createQueryBuilder().insert().into(User).values([{ ...userDto, telegram_account: telegramAccountFound }]).execute();
    return await this.usersRepository.findOne({ where: { id: createdUser.identifiers[0].id } });
  }

  async editUser(userId: number, userDto: EditUserDto): Promise<UserDto> {
    if(new Date(userDto.BirthDate) > new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000)) {
      throw new BadGatewayException("Возраст пользователя должен быть больше 18 лет");
    }
    
    const userFound: User = await this.usersRepository.findOne({ where: { id: userId } });
    const updated: User = await this.usersRepository.save({ ...userFound, ...userDto });
    if (updated) {
      return new UserDto(updated);
    }

    throw new BadGatewayException("Не удалось обновить данные");
  }

  async findUser(userId: number): Promise<User> {
    const foundUser = await this.usersRepository.findOneBy({ id: userId });
    if(!foundUser) {
      throw new NotFoundException(`Пользователь с данным id ${userId} не был найден в системе`);
    }

    return foundUser;
  }

  async findUserByPhoneNumber(phoneNumber: string): Promise<User> {
    const foundUser = await this.usersRepository.findOneBy({ phoneNumber });
    if(!foundUser) {
      throw new NotFoundException(`Пользователь с данным номером телефона ${phoneNumber} не был найден в системе`);
    }
    return foundUser;
  }

  async addTelegramAccount(telegramID: number): Promise<boolean> {
    const foundAccount = await this.telegramAccountsRepository.findOneBy({ telegramID })
    if(foundAccount) {
      throw new BadRequestException("Telegram-аккаунт уже зарегистрирован в системе.");
    }

    const verificationCode = await this.smsService
    await this.telegramAccountsRepository.save({ telegramID });

    await this.appService.sendNotification(`Ваш авторизационный код: `, telegramID)
    return true;
  }

  async verifyTelegramAccount(telegramID: number, code: number) {
    const accountFound = await this.telegramAccountsRepository.findOneBy({ telegramID});
    if(!accountFound) {
      throw new BadRequestException("Telegram-аккаунт не был найден в системе.");
    }

    const verifiedAccount = await this.telegramAccountsRepository.save({ ...accountFound, verified: true })
    return {
      verified: true,
      unique_id: verifiedAccount.id
    }
  }
}
