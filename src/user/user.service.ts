import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import { CreateUserDto } from "./user.dto";

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async createUser({name, subtitle}: CreateUserDto): Promise<User> {
    const newUser = new this.userModel({ name, subtitle });
    return newUser.save();
  }

  async getUsers(): Promise<User[]> {
    return this.userModel.find();
  }
}