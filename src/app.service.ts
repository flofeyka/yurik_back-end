import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";

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

    decryptText(text: string): string {
        const {ENCRYPT_TELEGRAM_ID_KEY, ENCRYPT_TELEGRAM_ID_IV} = process.env;
        console.log(ENCRYPT_TELEGRAM_ID_IV, ENCRYPT_TELEGRAM_ID_KEY);
        const key: Buffer = Buffer.from(ENCRYPT_TELEGRAM_ID_KEY, "hex")
        const iv: Buffer = Buffer.from(ENCRYPT_TELEGRAM_ID_IV, "hex")
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
        let decrypted = decipher.update(text, "base64", "utf8");
        decrypted += decipher.final("utf8");

        console.log(decrypted);
        return decrypted;
    }
}