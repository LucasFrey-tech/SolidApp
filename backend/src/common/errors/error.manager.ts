import { HttpException, HttpStatus } from '@nestjs/common';

export class ErrorManager extends Error {
  constructor({
    type,
    message,
  }: {
    type: keyof typeof HttpStatus;
    message: string;
  }) {
    super(`${type} :: ${message}`);
  }

  public static createSignatureError(message: string): HttpException {
    const [name, ...rest] = message.split(' :: ');
    const cleanMessage = rest.join(' :: ') || message;
    if (name && name in HttpStatus) {
      throw new HttpException(
        cleanMessage,
        HttpStatus[name as keyof typeof HttpStatus] as number,
      );
    } else {
      return new HttpException(cleanMessage, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
