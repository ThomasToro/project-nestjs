import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User , UserServiceInterface } from './interfaces/user.interface';
import { UserDocument, UserModel } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ChangePasswordDto, CreateUserDto, LoginDto, UpdateUserDto } from './dto/user.dto';
import { error } from 'console';
import { EmailService } from 'src/email/email.service';
import * as crypto from 'crypto';
import { sendEmailDto } from 'src/email/dto/email.dto';



@Injectable()
export class UserService implements UserServiceInterface {
     constructor (
        @InjectModel(UserModel.name) private userModel : Model <UserDocument>,
        private readonly emailService : EmailService, //privado para que solo se acceda desde este archivo
        //readonly para que no se modifique el servicio
     ){}

     //en proceso de implementacion 
     async verifyUser(id:string, verificationCode: string): Promise<User> {
        const user = await this.userModel.findById(id);

        if (!user){
            throw new Error("The email you are trying to verify does not exist")
        }


        if (user.verificationCode!==verificationCode){
         throw new Error("The verification code does not match")
        } 
        console.log("llegamossssssssss");
        

       const updatedUser= await this.userModel.findByIdAndUpdate(
         id, //porque mongo lo convierte a object automaticamente,no lo pasamos con {}
         {isVerified:true,
          verificationCode: null,
         },
         {new:true});
         console.log("Despues de actualizar, BIEN");
         console.log(updatedUser);
         

       return this.mapToTaskInterface(updatedUser);
        
     }

     //facil
     async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
         const user = await this.userModel.findById(id);

      if (!user){
         throw new error ("The user does not exist")

      }

      if(!user.isVerified){
         throw new Error ("The user is not veryfied, please, verify your user")
      }


      const isMatch = await bcrypt.compare(changePasswordDto.currentPassword, user.password);

      if (!isMatch){
         throw new Error ("The password entered does not match with the user password")
      }

      //ahora encriptamos la nueva contraseña

      //el viejo hash}
      
      console.log(user.password," <-viejo hash");
      
      const saltOrRounds = 10;
      const password = changePasswordDto.newPassword;
      const hash = await bcrypt.hash(password, saltOrRounds);

      const updatedUser= await this.userModel.findByIdAndUpdate(
         id,
         {
            password:hash,
         },
         {new:true}
      );

      console.log(updatedUser.password," <-nuevo hash")

         
     }

     async create(createUserDto: CreateUserDto): Promise<User> {
      const exists = await this.findByEmail(createUserDto.email);
  
      if (exists !== null) {
          throw new Error("The email is already in use, try with another");
      }
  
      const saltOrRounds = 10;
      const password = createUserDto.password;
      const hash = await bcrypt.hash(password, saltOrRounds);

      //generamos el code de verificacion que vamos a asignar en breve
      const code = crypto.randomBytes(3).toString('hex').toUpperCase();
      console.log(code);
      
      //Usamos .create() para que Mongoose aplique los valores por defecto automáticamente, los del schema
      const savedUser = await this.userModel.create({
          ...createUserDto,
          password: hash , //aca sobrescribimos la password por la del hash 
          verificationCode: code, //incluimos el codigo de verificacion en este objeto
      });

      this.emailService.sendEmail({
         recipients: [savedUser.email],
         subject: "Verification code",
         html: `This is your verification code: ${code}` // Uso de backticks (`) para interpolación
      });
      
  
      return this.mapToTaskInterface(savedUser);
  }
  

     //facil
     async findAll(): Promise<User[]> {
      const users= await this.userModel.find().lean().exec()
      return users.map(user=> this.mapToTaskInterface(user)) //iteramos en el arreglo de users, lo transformamos
      //a un formato adecuado (al arreglo)
   

     }

     //facil
     async findOne(id: string): Promise<User> { // encontramos un user por id
      const obtanidedUser= await this.userModel.findById(id).lean().exec();
      console.log(obtanidedUser);
      
      return this.mapToTaskInterface(obtanidedUser);
     }

     //facil
     async findByEmail(email: string): Promise<User | null> {
      const obtainedUser = await this.userModel.findOne({ email }).exec();
      
      if (obtainedUser==null) {
          return null; // Retornamos null explícitamente si no se encuentra el usuario
      }else {
         return this.mapToTaskInterface(obtainedUser);
      }
      
  }


  
  

     //mandar verifidcation code?
     async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
      const user= await this.userModel.findById(id);

      if (!user){

         throw new Error("The user was not found");
      }

      

      const dto: Partial<UpdateUserDto> = {};//para evitar que si el user no manda email, no se ponga null o sin valor x ejemplo
      if (updateUserDto.name !== undefined) dto.name = updateUserDto.name;
      if (updateUserDto.email !== undefined) dto.email = updateUserDto.email;
      if (updateUserDto.refreshToken !== undefined) dto.refreshToken = updateUserDto.refreshToken;

      const updatedUser= await this.userModel.findByIdAndUpdate(
         id,
         dto,
         {new:true}
      )

      if (!updatedUser){
         throw new Error("The user could not be updated, was not found");
      }

        return this.mapToTaskInterface(updatedUser);
     }


     //facil
     async remove(id: string): Promise<void> {

      const user = await this.userModel.findByIdAndDelete(id);

      if (!user){
         throw new NotFoundException("The user you are trying to delete was not found");
      }
      
      console.log("User successfully deleted");
     }


     

     

     //estan en auth
     async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: User; }> {
        return
     }


     //estan en auth
     async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; }> {
        return
     }

     private mapToTaskInterface(userDoc: any): User {
         return {
           id: userDoc._id ? userDoc._id.toString() : userDoc.id,
           name: userDoc.name,
           email: userDoc.email,
           isVerified: userDoc.isVerified,
           role: userDoc.role,
           verificationCode: userDoc.verificationCode,
           password:userDoc.password,
           refreshToken:userDoc.refreshToken,
           createdAt: userDoc.createdAt,
           updatedAt: userDoc.updatedAt
         };
       }
}
