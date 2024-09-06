import { Agreement } from "../entities/agreement.entity";

//Доделать информацию подающуяся на выходе.
export class AgreementDto {
  constructor(model) {
    Object.assign(this, {
      id: model.id,
      title: model.title,
      steps: model.steps,
    });
  }
}