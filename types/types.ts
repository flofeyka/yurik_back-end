import { Request } from "express";
import { Agreement } from "src/agreement/entities/agreement.entity";
import { Lawyer } from "src/agreement/lawyer/lawyer.entity";
import { AgreementStep } from "src/agreement/step/entities/step.entity";

export interface RequestType extends Request {
  user: {
    id: number;
    telegramID: number,
    lastName: string
  },
  lawyer: Lawyer,
  agreement: Agreement;
  step: AgreementStep
}