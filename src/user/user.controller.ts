import { Controller, Post, Body, Get } from "@nestjs/common";
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() body: any) {
    const { name, subtitle } = body;
    return this.userService.createUser({name, subtitle});
  }

  @Get()
  async getUsers() {
    return this.userService.getUsers();
  }
}