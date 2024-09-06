export interface RequestType extends Request {
  user: {
    id: number;
    telegramID: number,
    lastName: string
  }
}