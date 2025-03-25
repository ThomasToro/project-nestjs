import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { sendEmailDto } from './dto/email.dto';
import { Subject } from 'rxjs';

@Injectable()
export class EmailService {
    constructor(private readonly configService: ConfigService){}

    async emailTransport(){
        const trasnporter = nodemailer.createTransport({
            host:this.configService.get<string>('EMAIL_HOST'),
            port:this.configService.get<string>('PORT') ,
            secure:false ,
            auth : {
                user: this.configService.get<string>('EMAIL_USER') ,
                pass: this.configService.get<string>('EMAIL_PASSWORD'),
            },

        })
        return trasnporter;
    }

    async sendEmail(dto: sendEmailDto){
        const {recipients,subject,html}=dto;
        const transport = await this.emailTransport();

        const options: nodemailer.SendMailOptions={
            from: this.configService.get<string>('EMAIL_USER'),
            to: recipients,
            subject: subject,
            html: html,

        };
        try{
           await transport.sendMail(options);
           console.log('Email sent successfully');
        }
        catch(error){
            console.log('Error sending mail: ',error);
            

        }
    }
}
