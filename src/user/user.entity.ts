import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { EncryptionTransformer } from "typeorm-encrypted";

@Entity()
export class User {
    @ApiProperty({ title: "Уникальный идентификатор", example: 1 })
    @PrimaryGeneratedColumn()
    public readonly id: number;


    @ApiProperty({ title: "Имя. Обязательное поле", example: "Максим" })
    @Column({ nullable: true })
    public readonly firstName: string;

    @ApiProperty({ title: "Фамилия. Обязательное поле", example: "Максбетов" })
    @Column({ nullable: false })
    public readonly lastName: string;

    @ApiProperty({ title: "Отчество. Обязательное поле", example: "Тагирович" })
    @Column({ nullable: true })
    public readonly middleName: string;

    @ApiProperty({ title: "Номер телефона. Обязательное поле", example: 89123456789 })
    @Column({ nullable: true })
    public readonly phoneNumber: string;

    @ApiProperty({ title: "ID Telegram", example: 312531 })
    @Column({ nullable: false })
    public readonly telegramID: number;

    @Column({ nullable: true, type: "date" })
    @ApiProperty({ title: "Дата рождения", example: "2023-03-22" })
    public readonly BirthDate: Date;

    @Column({ nullable: true })
    @ApiProperty({ title: "Электронная почта", example: "email@admin.ru" })
    public readonly email: string;

    @Column()
    @ApiProperty({ title: "Пароль в захешированном виде", example: "fgdsjkjghfdkvfnds"})
    public readonly password: string;

    //Нужно будет реализовать список предлагаемых, действующих и отклоненных договоров.


    @Column({
        nullable: true, transformer: new EncryptionTransformer({
            key: 'e41c966f21f9e1577802463f8924e6a3fe3e9751f201304213b2f845d8841d61',
            algorithm: 'aes-256-cbc',
            ivLength: 16,
            iv: 'ff5ac19190424b1d88f9419ef949ae56'
        })
    })
    @ApiProperty({title: "Кем выдан паспорт(В ТОЧНОСТИ КАК В ПАСПОРТЕ).", example: "УМВД ПО ТЮМЕНСКОЙ ОБЛАСТИ"})
    public readonly authority: string;
    @Column({
        nullable: true, transformer: new EncryptionTransformer({
            key: 'e41c966f21f9e1577802463f8924e6a3fe3e9751f201304213b2f845d8841d61',
            algorithm: 'aes-256-cbc',
            ivLength: 16,
            iv: 'ff5ac19190424b1d88f9419ef949ae56'
        })
    })
    @ApiProperty({title: "Серия паспорта", example: "1234"})
    public readonly serial: string;
    @Column({
        nullable: true, unique: true, transformer: new EncryptionTransformer({
            key: 'e41c966f21f9e1577802463f8924e6a3fe3e9751f201304213b2f845d8841d61',
            algorithm: 'aes-256-cbc',
            ivLength: 16,
            iv: 'ff5ac19190424b1d88f9419ef949ae56'
        })
    })
    @ApiProperty({title: "Номер паспорта", example: "567890"})
    public readonly number: string;
    @Column({
        nullable: true, transformer: new EncryptionTransformer({
            key: 'e41c966f21f9e1577802463f8924e6a3fe3e9751f201304213b2f845d8841d61',
            algorithm: 'aes-256-cbc',
            ivLength: 16,
            iv: 'ff5ac19190424b1d88f9419ef949ae56'
        })
    })
    @ApiProperty({title: "Адрес прописки(В ТОЧНОСТИ КАК В ПАСПОРТЕ).", example: "Тюменская область, г. Тюмень, улица Мориса Тореза, д. 1, кв. 1"})
    public readonly address: string;
    @Column({
        nullable: true, unique: true, transformer: new EncryptionTransformer({
            key: 'e41c966f21f9e1577802463f8924e6a3fe3e9751f201304213b2f845d8841d61',
            algorithm: 'aes-256-cbc',
            ivLength: 16,
            iv: 'ff5ac19190424b1d88f9419ef949ae56'
        })
    })
    @ApiProperty({title: "ИНН", example: "1234567890"})
    public readonly TIN: string;
}