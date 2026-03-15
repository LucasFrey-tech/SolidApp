import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail } from 'class-validator';

export class CreateInvitacionDto {
  @ApiProperty({
    example: ["a@mail.com","b@mail.com"]
  })
  @IsArray()
  @IsEmail({}, { each: true })
  correos: string[];

}
