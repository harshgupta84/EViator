import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<any>,
    private jwtService: JwtService,
  ) {}

  async signup(email: string, password: string) {
    try {
      // Check if user already exists
      const existingUser = await this.userModel.findOne({ email });
      
      if (existingUser) {
        // If user exists, verify password
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        
        if (!isPasswordValid) {
          throw new UnauthorizedException('Invalid credentials');
        }
        
        // Generate JWT token
        const accessToken = await this.jwtService.signAsync({
          email: existingUser.email,
          sub: existingUser._id,
        });
        
        return { 
          message: 'Login successful', 
          userId: existingUser._id,
          accessToken,
        };
      }
      
      // Manual validation
      if (password.length < 8) {
        throw new BadRequestException('Password must be at least 8 characters long');
      }
      
      // If user doesn't exist, create new user
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new user
      const newUser = await this.userModel.create({
        email,
        password: hashedPassword,
      });
      
      // Generate JWT token for new user
      const accessToken = await this.jwtService.signAsync({
        email: newUser.email,
        sub: newUser._id,
      });
      
      return {
        message: 'User registered successfully',
        userId: newUser._id,
        accessToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      if (error.name === 'ValidationError') {
        throw new BadRequestException(error.message);
      }
      throw new ConflictException('Error processing request: ' + error.message);
    }
  }
}
