import { BadGatewayException, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EditUserDto } from './dtos/edit-user-dto';
import { CreateUserDto } from './dtos/create-user-dto';
import { UserDto } from './dtos/user-dto';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {};

    async createUser(userDto: CreateUserDto): Promise<User> {
        const createdUser = await this.usersRepository.createQueryBuilder().insert().into(User).values([{...userDto}]).execute();
        return await this.usersRepository.findOne({ where: { id: createdUser.identifiers[0].id } });
    }

    async editUser(userId: number, userDto: EditUserDto): Promise<UserDto> {
        const userFound = await this.usersRepository.findOne({ where: { id: userId } });
        const updated = await this.usersRepository.save({...userFound, ...userDto});
        if (updated) {
            return new UserDto(updated);
        }

        throw new BadGatewayException("Не удалось обновить данные")
    }
}
