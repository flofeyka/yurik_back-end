import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import crypto from "crypto";

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
    
    getRandomCodeValue(min: number = 100000, max: number = 999999): Number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    decryptText(text: string): number | string {
        const {ENCRYPT_TELEGRAM_ID_KEY, ENCRYPT_TELEGRAM_ID_IV} = process.env;
        const decipher = crypto.createCipheriv("aes-256-cbc", ENCRYPT_TELEGRAM_ID_KEY, ENCRYPT_TELEGRAM_ID_IV);
        let decrypted: string = decipher.update(text, "base64", "utf8");
        decrypted += decipher.final("base64");
        return decrypted;
    }
}