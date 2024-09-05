import { forwardRef, Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from 'src/user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthToken } from './authToken.entity';
import { UserModule } from 'src/user/user.module';

@Global()
@Module({
    imports: [
        UserModule,
        JwtModule.register({
            global: true,
            secret: `${process.env.JWT_SECRET}`,
            signOptions: {
                expiresIn: '14d'
            }
        }), TypeOrmModule.forFeature([User]), TypeOrmModule.forFeature([AuthToken])],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [JwtModule, AuthService],
})
export class AuthModule { }
