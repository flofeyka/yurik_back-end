import { Request } from "express";
import { Agreement } from "src/agreement/entities/agreement.entity";
import { Lawyer } from "src/agreement/entities/agreement.lawyer.entity";

export interface RequestType extends Request {
  user: {
    id: number;
    telegramID: number,
    lastName: string
  },
  lawyer: Lawyer,
  agreement: Agreement
}