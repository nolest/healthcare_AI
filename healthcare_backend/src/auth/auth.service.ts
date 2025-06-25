import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schemas/user.schema';
import { LoginDto, RegisterDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // 检查用户名是否已存在
    const existingUser = await this.userModel.findOne({
      $or: [
        { username: registerDto.username },
        { email: registerDto.email }
      ]
    });

    if (existingUser) {
      throw new ConflictException('用户名或邮箱已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 创建新用户
    const user = new this.userModel({
      ...registerDto,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    // 生成JWT token
    const payload = { 
      sub: savedUser._id, 
      username: savedUser.username,
      role: savedUser.role 
    };
    
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        fullName: savedUser.fullName,
        email: savedUser.email,
        role: savedUser.role,
        department: savedUser.department,
        license_number: savedUser.license_number,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    // 查找用户
    const user = await this.userModel.findOne({ username: loginDto.username });
    
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 生成JWT token
    const payload = { 
      sub: user._id, 
      username: user.username,
      role: user.role 
    };
    
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        license_number: user.license_number,
      },
      token,
    };
  }

  async validateUser(userId: string) {
    const user = await this.userModel.findById(userId).select('-password');
    return user;
  }
} 