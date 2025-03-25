
import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';



@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService:JwtService,
    private configService: ConfigService,
  ) {}

  async signUp(createUserDto:CreateUserDto): Promise<any> {
    

    const newUser=this.usersService.create(createUserDto);

    const tokens = await this.getTokens((await newUser).id, ((await newUser).name));
    await this.updateRefreshToken((await newUser).id, tokens.refreshToken);
    return tokens;

}

    async signIn(loginDto: LoginDto) {
      // Check if user exists
      const user = await this.usersService.findByEmail(loginDto.email);
      if (!user) throw new BadRequestException('User does not exist');
      const passwordMatches = await bcrypt.compare(loginDto.password, user.password);

      if (!passwordMatches)
        throw new BadRequestException('Password is incorrect');
      const tokens = await this.getTokens((await user).id, (await user).email);
      await this.updateRefreshToken((await user).id, tokens.refreshToken);
      return tokens;
    }




async logout(userId: string) {
  this.usersService.update(userId, { refreshToken: null });
}

async refreshTokens(email: string, refreshToken: string) {
  const user = await this.usersService.findByEmail(email);
  if (!user || !user.refreshToken)
    throw new ForbiddenException('Access Denied');
  const refreshTokenMatches = await argon2.verify(
    user.refreshToken,
    refreshToken,
  );

  if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
  const tokens = await this.getTokens(user.email, user.name);
  await this.updateRefreshToken(user.id, tokens.refreshToken);
  return tokens;
}

hashData(data: string) {
  return argon2.hash(data);
}

//antes estaba email
async updateRefreshToken(id: string, refreshToken: string) {
  const hashedRefreshToken = await this.hashData(refreshToken);
  await this.usersService.update(id, {
    refreshToken: hashedRefreshToken,
  });
}

async getTokens(email: string, username: string) {
  const [accessToken, refreshToken] = await Promise.all([
    this.jwtService.signAsync(
      {
        sub: email,
        username,
      },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      },
    ),
    this.jwtService.signAsync(
      {
        sub: email,
        username,
      },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    ),
  ]);

  return {
    accessToken,
    refreshToken,
  };
}
}

