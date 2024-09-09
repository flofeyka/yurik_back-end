import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Agent } from 'https';

@Injectable()
export class GigachatService {
    constructor(private readonly httpService: HttpService) { }

    //Добавить возможность сохранения диалогов Gigachat и получать доступ к ним.

    async getToken() {
        const requestUID = uuidv4();

        try {
            const response = await this.httpService.axiosRef.post("https://ngw.devices.sberbank.ru:9443/api/v2/oauth", {
                scope: process.env.GIGACHAT_CLIENT_SCOPE
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.GIGACHAT_CLIENT_SECRET}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'RqUID': requestUID
                },
                httpsAgent: new Agent({
                    rejectUnauthorized: false,
                }),
            })

            return response.data;
        } catch (e) {
            console.log(e);
        }

    }

    async sendToGigaChat(text: string, accessToken: string) {
        const msg = {
            model: 'GigaChat:latest',
            messages: [
                {
                    role: 'user',
                    content: text,
                },
            ],
        };

        try {
            const response = await this.httpService.axiosRef.post(
                'https://gigachat.devices.sberbank.ru/api/v1/chat/completions',
                JSON.stringify(msg),
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    httpsAgent: new Agent({
                        rejectUnauthorized: false,
                    }),
                    responseType: 'json',
                },
            );
            return response.data.choices[0].message;

        } catch (e) {
            console.log(e);
        }
    }
}
