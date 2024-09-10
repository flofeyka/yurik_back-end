import { BadGatewayException, Injectable, NotFoundException } from "@nestjs/common";
import { User } from "./user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { InsertResult, Repository } from "typeorm";
import { EditUserDto } from "./dtos/edit-user-dto";
import { CreateUserDto } from "./dtos/create-user-dto";
import { UserDto } from "./dtos/user-dto";

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {
  };

  async createUser(userDto: CreateUserDto): Promise<User> {
    const createdUser: InsertResult = await this.usersRepository.createQueryBuilder().insert().into(User).values([{ ...userDto }]).execute();
    return await this.usersRepository.findOne({ where: { id: createdUser.identifiers[0].id } });
  }

  async editUser(userId: number, userDto: EditUserDto): Promise<UserDto> {
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
}
