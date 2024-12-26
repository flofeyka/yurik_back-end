import { Request } from 'express';
import { Agreement } from 'src/agreement/entities/agreement.entity';
import { AgreementStep } from 'src/agreement/step/entities/step.entity';

export interface RequestType extends Request {
  user: AuthTokenPayload;
  agreement: Agreement;
  step: AgreementStep;
}

export interface AuthTokenPayload {
  id: number;
  telegramID: number;
  lastName: string;
  role: 'Админ' | 'Пользователь' | 'Юрист';
}
