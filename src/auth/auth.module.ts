import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';

@Module({
  imports: [
    UserModule, 
    PassportModule,//Agregamos PassportModule
    JwtModule.register({}), //Se configura con.env
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    AccessTokenStrategy,//estrategias
    RefreshTokenStrategy
  ],
  exports: [AuthService],
})
export class AuthModule {}
