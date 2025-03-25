import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserModel, UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailModule } from 'src/email/email.module';
import { LoginDto } from './dto/user.dto';


@Module({
  controllers: [UserController],
  providers: [UserService],
  imports : [MongooseModule.forFeature([{ name :UserModel.name, schema: UserSchema}]),EmailModule]
  // arreglo de imports que llama a mongoosemodule.forfeature que nos crea 
  ,exports:[UserService],
})
export class UserModule {}
