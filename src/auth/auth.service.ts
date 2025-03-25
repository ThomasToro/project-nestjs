
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService:JwtService,
  ) {}

  async signIn(loginDto:LoginDto): Promise<{ access_token: string }> {
    const user = await this.userService.findByEmail(loginDto.email);

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    
          if (!isMatch){
            throw new UnauthorizedException();
          }

    const payload = { sub: user.id, username: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
}
}
