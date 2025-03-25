import { Body, Controller, HttpCode, HttpStatus, Post, Get, Param, Patch, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { ChangePasswordDto, CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { User } from './interfaces/user.interface';
import { get } from 'mongoose';

@Controller('api/v1/users')

export class UserController {

    constructor (private readonly userService: UserService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)  

    async create (@Body() createUserDto:CreateUserDto): Promise<User> {

        return this.userService.create(createUserDto);
    
    }

    @Get('email/:email')  // Agrega un prefijo para evitar colisión
    async findByEmail(@Param('email') email: string): Promise<User | null> {
    return this.userService.findByEmail(email);
}


    @Get('id/:id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string): Promise<User> {  //param para cuando los usamos en la url
    console.log(`Recibiendo petición para buscar usuario con id: ${id}`);
    return this.userService.findOne(id);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<User[]>{
    return this.userService.findAll();

    }

    @Patch('verifyEmail') //pudimos haber creado un dto para la verificacion
    async verifyUser(@Body() { id, verificationCode }: { id: string; verificationCode: string }): Promise<User> {
        return this.userService.verifyUser(id,verificationCode);
    }//usamos un dto y lo pasamos como parametro de la funcion


    @Patch('changePassword/:id')
    async changePassword(@Param('id') id:string,@Body() changePassWordDto: ChangePasswordDto){
 
        return this.userService.changePassword(id,changePassWordDto);

    }

    @Patch('update/:id')
    async update(@Param('id') id:string, @Body() updateUserDto:UpdateUserDto):Promise<User>{

        return this.userService.update(id,updateUserDto);

    }

    @Delete('delete/:id')
    async remove(@Param('id') id:string){

        return this.userService.remove(id);

    }



}


 
