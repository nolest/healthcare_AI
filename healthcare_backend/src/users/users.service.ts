import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { Measurement, MeasurementDocument } from '../schemas/measurement.schema';

export interface UpdateUserDto {
  fullName?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  department?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Measurement.name) private measurementModel: Model<MeasurementDocument>,
  ) {}

  async findAll() {
    return this.userModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPatients() {
    return this.userModel
      .find({ role: 'patient' })
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findMedicalStaff() {
    return this.userModel
      .find({ role: 'medical_staff' })
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string) {
    const user = await this.userModel
      .findById(id)
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 如果是患者，获取历史测量数据
    if (user.role === 'patient') {
      const historyMeasurements = await this.measurementModel
        .find({ userId: id })
        .sort({ createdAt: -1 }) // 按创建时间倒序排列
        .exec();

      return {
        ...user.toObject(),
        history_measurements: historyMeasurements
      };
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser: any) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 患者只能更新自己的信息，医护人员可以更新所有患者信息
    if (currentUser.role === 'patient' && currentUser._id !== id) {
      throw new ForbiddenException('只能更新自己的信息');
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    return updatedUser;
  }

  async deactivate(id: string, currentUserId: string, currentUserRole: string) {
    if (currentUserRole !== 'medical_staff') {
      throw new ForbiddenException('只有医护人员可以停用用户');
    }

    if (id === currentUserId) {
      throw new ForbiddenException('不能停用自己的账户');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 这里可以添加软删除逻辑，或者设置用户状态为停用
    // 暂时返回成功信息
    return { message: '用户已停用', userId: id };
  }

  async getStats() {
    const totalUsers = await this.userModel.countDocuments();
    const totalPatients = await this.userModel.countDocuments({ role: 'patient' });
    const totalMedicalStaff = await this.userModel.countDocuments({ role: 'medical_staff' });
    
    // 按性别统计
    const genderStats = await this.userModel.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 }
        }
      }
    ]);

    // 最近30天新注册用户
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await this.userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // 医护人员按科室统计
    const departmentStats = await this.userModel.aggregate([
      {
        $match: { role: 'medical_staff', department: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      totalUsers,
      totalPatients,
      totalMedicalStaff,
      genderStats,
      departmentStats,
      recentRegistrations,
    };
  }

  async searchUsers(query: string, role?: string) {
    const searchConditions: any = {
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ]
    };

    if (role) {
      searchConditions.role = role;
    }

    return this.userModel
      .find(searchConditions)
      .select('-password')
      .limit(20)
      .exec();
  }
} 