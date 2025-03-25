import { IsEmail, IsNotEmpty, IsOptional, isString, IsString } from "class-validator"
 

export class sendEmailDto{
    @IsEmail({},{each:true})
    @IsNotEmpty()
    recipients: string[];

    @IsString()
    subject:string;

    @IsString()
    html: string;

    @IsOptional()
    @IsString()
    text?: string;

}