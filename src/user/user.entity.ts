import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { EncryptionTransformer } from "typeorm-encrypted";

@Entity()
export class User {
    @ApiProperty({ title: "Уникальный идентификатор", example: 1 })
    @PrimaryGeneratedColumn()
    id: number;


    @ApiProperty({ title: "Имя. Обязательное поле", example: "Максим" })
    @Column({ nullable: true })
    firstName: string;

    @ApiProperty({ title: "Фамилия. Обязательное поле", example: "Максбетов" })
    @Column({ nullable: false })
    lastName: string;

    @ApiProperty({ title: "Отчество. Обязательное поле", example: "Тагирович" })
    @Column({ nullable: true })
    middleName: string;

    @ApiProperty({ title: "Номер телефона. Обязательное поле", example: 89123456789 })
    @Column({ nullable: true })
    phoneNumber: string;

    @ApiProperty({ title: "ID Telegram", example: 312531 })
    @Column({ nullable: false })
    telegramID: number;

    @Column({ nullable: true, type: "date" })
    @ApiProperty({ title: "Дата рождения", example: "2023-03-22" })
    BirthDate: Date;

    @Column({ nullable: true })
    @ApiProperty({ title: "Электронная почта", example: "email@admin.ru" })
    email: string;

    @Column()
    @ApiProperty({ title: "Пароль в захешированном виде", example: "fgdsjkjghfdkvfnds"})
    password: string;


    @Column({
        nullable: true, transformer: new EncryptionTransformer({
            key: 'e41c966f21f9e1577802463f8924e6a3fe3e9751f201304213b2f845d8841d61',
            algorithm: 'aes-256-cbc',
            ivLength: 16,
            iv: 'ff5ac19190424b1d88f9419ef949ae56'
        })
    })
    @ApiProperty({title: "Кем выдан паспорт(В ТОЧНОСТИ КАК В ПАСПОРТЕ).", example: "УМВД ПО ТЮМЕНСКОЙ ОБЛАСТИ"})
    authority: string;
    @Column({
        nullable: true, transformer: new EncryptionTransformer({
            key: 'e41c966f21f9e1577802463f8924e6a3fe3e9751f201304213b2f845d8841d61',
            algorithm: 'aes-256-cbc',
            ivLength: 16,
            iv: 'ff5ac19190424b1d88f9419ef949ae56'
        })
    })
    @ApiProperty({title: "Серия паспорта", example: "1234"})
    serial: string;
    @Column({
        nullable: true, unique: true, transformer: new EncryptionTransformer({
            key: 'e41c966f21f9e1577802463f8924e6a3fe3e9751f201304213b2f845d8841d61',
            algorithm: 'aes-256-cbc',
            ivLength: 16,
            iv: 'ff5ac19190424b1d88f9419ef949ae56'
        })
    })
    @ApiProperty({title: "Номер паспорта", example: "567890"})
    number: string;
    @Column({
        nullable: true, transformer: new EncryptionTransformer({
            key: 'e41c966f21f9e1577802463f8924e6a3fe3e9751f201304213b2f845d8841d61',
            algorithm: 'aes-256-cbc',
            ivLength: 16,
            iv: 'ff5ac19190424b1d88f9419ef949ae56'
        })
    })
    @ApiProperty({title: "Адрес прописки(В ТОЧНОСТИ КАК В ПАСПОРТЕ).", example: "Тюменская область, г. Тюмень, улица Мориса Тореза, д. 1, кв. 1"})
    address: string;
    @Column({
        nullable: true, unique: true, transformer: new EncryptionTransformer({
            key: 'e41c966f21f9e1577802463f8924e6a3fe3e9751f201304213b2f845d8841d61',
            algorithm: 'aes-256-cbc',
            ivLength: 16,
            iv: 'ff5ac19190424b1d88f9419ef949ae56'
        })
    })
    @ApiProperty({title: "ИНН", example: "1234567890"})
    TIN: string;
}