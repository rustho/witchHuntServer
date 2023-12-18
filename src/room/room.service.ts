import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateRoomDto } from "./room.dto";
import { Room } from "./room.model";

@Injectable()
export class RoomService {
  constructor(@InjectModel('Room') private readonly roomModel: Model<Room>) {}

  async createRoom({ name, authorName }: CreateRoomDto): Promise<Room> {
    const newRoom = new this.roomModel({ name, authorName });
    return newRoom.save();
  }

  async getRooms(): Promise<Room[]> {
    return this.roomModel.find();
  }
}
