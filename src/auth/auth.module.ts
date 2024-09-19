import { forwardRef, Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from 'src/user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthToken } from './entities/authToken.entity';
import { UserModule } from 'src/user/user.module';
import { SmsModule } from 'src/sms/sms.module';

@Global()
@Module({
    imports: [
        UserModule,
        SmsModule,
        JwtModule.register({
            global: true,
            secret: `${process.env.JWT_SECRET}`,
            signOptions: {
                expiresIn: '14d'
            }
        }), TypeOrmModule.forFeature([User, AuthToken])],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [JwtModule, AuthService],
})
export class AuthModule { }
