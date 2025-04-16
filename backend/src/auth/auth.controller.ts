import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialsDto, AuthResponseDto } from './dto/auth.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({ summary: 'Register or login a user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered/logged in successfully',
    type: AuthResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 409, description: 'Conflict' })
  signup(@Body() authCredentialsDto: AuthCredentialsDto): Promise<AuthResponseDto> {
    return this.authService.signup(
      authCredentialsDto.email, 
      authCredentialsDto.password
    );
  }
}
