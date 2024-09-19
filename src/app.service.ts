import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
    constructor(private readonly httpService: HttpService) {}

    async sendNotification(message: string, telegramID: number): Promise<boolean> {
        try {
            if(telegramID) {
                const response = await this.httpService.axiosRef.post("https://rafailvv.online/send/message", {
                    user_id: telegramID,
                    message_text: `Вам пришло новое уведомление:\n${message}`
                })
                return response.data;
            }
        } catch(e) {
            return false;
        }
    }
}