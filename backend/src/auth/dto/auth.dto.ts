import { ApiProperty } from '@nestjs/swagger';

export class AuthCredentialsDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 8,
  })
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'User registered successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User ID',
    example: '6501a2d38a8c3e001f3c1234',
  })
  userId: string;

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
} 