import { BadGatewayException, BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { InsertResult, Repository } from "typeorm";
import { EditUserDto } from "./dtos/edit-user-dto";
import { CreateUserDto } from "./dtos/create-user-dto";
import { UserDto } from "./dtos/user-dto";
import { TelegramAccount } from "./entities/telegram-account.entity";
import { ImagesService } from "../images/images.service";
import { PersonalData } from "./entities/user.personal_data";
import { Image } from "src/images/image.entity";
import { ProfileDto } from "./dtos/profile-dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(TelegramAccount) private readonly telegramAccountsRepository: Repository<TelegramAccount>,
    @InjectRepository(PersonalData) private readonly personalDataRepository: Repository<PersonalData>,
    @Inject(forwardRef(() => ImagesService))
    private readonly imagesService: ImagesService
  ) {
  };

  async createUser(userDto: CreateUserDto, telegramAccount: TelegramAccount): Promise<User> {
    const user: User = new User();
    user.lastName = userDto.lastName;
    user.firstName = userDto.firstName;
    user.telegram_account = telegramAccount;
    return await this.usersRepository.save(user);
  }

  async editUser(userId: number, userDto: EditUserDto): Promise<UserDto> {
    if (new Date(userDto.BirthDate) > new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000)) {
      throw new BadGatewayException("Возраст пользователя должен быть больше 18 лет");
    }

    const userPersonalData: PersonalData = await this.personalDataRepository.findOne({
      where: { user: { id: userId } }, relations: {
        user: true
      }
    });

    const userFound: User = await this.usersRepository.findOne({ where: { id: userId } });

    if (userDto.image) {
      const imageFound: Image = await this.imagesService.getImageByName(userDto.image);
      if (!imageFound) {
        throw new NotFoundException("Изображение не найдено");
      }
      userFound.image = imageFound;
    }

    if (userPersonalData) {
      const personalDataCreated = await this.personalDataRepository.save({
        ...userPersonalData,
        ...userDto
      });
      userFound.personalData = personalDataCreated;
    } else {
      const newPersonalData: InsertResult = await this.personalDataRepository.createQueryBuilder().insert().into(PersonalData).values({ user: userFound, ...userDto }).execute();
      const personalDataFound: PersonalData = await this.personalDataRepository.findOne({ where: { id: newPersonalData.identifiers[0].id } });
      userFound.personalData = personalDataFound;
    }
    const updated: User = await this.usersRepository.save({ ...userFound, ...userDto, image: userFound.image });
    if (updated) {
      return new UserDto(updated);
    }

    throw new BadGatewayException("Не удалось обновить данные");
  }

  async getProfileById(userId: number): Promise<ProfileDto> {
    const userFound: User = await this.findUser(userId);
    return new ProfileDto(userFound);
  }

  public async findUser(userId: number): Promise<User> {
    const foundUser: User = await this.usersRepository.findOne({
      where: { id: userId }, relations: {
        telegram_account: true,
        image: {
          user: true
        }
      }
    });

    if (!foundUser) {
      throw new NotFoundException(`Пользователь с данным id ${userId} не был найден в системе`);
    }

    return foundUser;
  }

  async addTelegramAccount(telegramID: number): Promise<boolean> {
    const foundAccount = await this.telegramAccountsRepository.findOneBy({ telegramID });
    if (foundAccount) {
      throw new BadRequestException("Telegram-аккаунт уже зарегистрирован в системе.");
    }

    await this.telegramAccountsRepository.save({ telegramID });

    return true;
  }
}
