import { Body, Controller, Get, Post } from "@nestjs/common";
import { RoomService } from "./room.service";
import { CreateRoomDto } from "./room.dto";

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  async createUser(@Body() body: CreateRoomDto) {
    const { name, authorName } = body;
    return this.roomService.createRoom({name, authorName});
  }

  @Get()
  async getUsers() {
    return this.roomService.getRooms();
  }

}
