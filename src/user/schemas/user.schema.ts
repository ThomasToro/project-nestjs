import { Param } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


export type UserDocument = UserModel & Document;

@Schema({ // el schema le corresponde a la clase que se esporta debajo de él 
    timestamps: true, // Esto añadirá automáticamente createdAt y updatedAt
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  })

  export class UserModel {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: false })  //Por defecto, no verificado
    isVerified: boolean;  

    @Prop({ default: 'user' })//Valor por defecto 'user', se refiere al campo de la coleccion
    role: string; //se refiere al campo que mandamos por el json

    @Prop({required: false}) //codigo de verificacion que se hace al crear el user
    verificationCode:string; //no siempre se necesita porque lo podemos eliminar incluso

    @Prop({ required: false }) 
    refreshToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel); 

