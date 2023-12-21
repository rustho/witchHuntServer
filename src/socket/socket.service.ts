import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Server } from "socket.io";
import { InjectModel } from "@nestjs/mongoose";
import { Client, Room, RoomDocument } from "../room/room.model";
import mongoose, { Model } from "mongoose";
import wait from "src/ts/wait";

@WebSocketGateway({
  cors: {
    origin: "*"
  }
})
export class SocketService implements OnGatewayConnection {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<Room>
  ) {
  }

  @WebSocketServer()
  server: Server;


  async getRoomsList(): Promise<Room[]> {
    return this.roomModel.find({}, { name: 1, createdAt: 1, clients: 1, authorName: 1 })
      .sort({ createdAt: -1 });
  }

  @SubscribeMessage("deleteAllRooms")
  async handleDeleteAllRooms(@ConnectedSocket() client: any) {
    try {
      await this.roomModel.deleteMany({});

      await this.roomListWasChanged();
    } catch (error) {
      // Handle errors, log, or emit an error event if needed
      console.error("Error deleting all rooms:", error.message);
    }
  }

  async getRoomClients(roomId: string): Promise<Client[]> {
    const room = await this.roomModel.findOne({ _id: roomId }) as Room;
    return room ? room.clients : [];
  }

  @SubscribeMessage("getClientsList")
  handleGetClientsList(@MessageBody() { roomId }: { roomId: string }): Promise<Client[]> {
    return this.getRoomClients(roomId);
  }

  @SubscribeMessage("getRoomsList")
  handleGetRoomsList(@ConnectedSocket() client: any) {
    return this.getRoomsList();
  }

  @SubscribeMessage("joinRoom")
  async handleJoinRoom(@MessageBody() {
    roomId,
    userName,
    subtitle
  }: { roomId: string, userName: string, subtitle: number | string }, @ConnectedSocket() client: any) {
    // await this.leaveRoom(roomId, client);

    client.join(roomId);
    await this.addToRoom(roomId, userName, subtitle, client);

    const clientsInRoom = await this.getRoomClients(roomId);
    const data = { room: roomId, clients: clientsInRoom, userName, subtitle };
    this.server.to(roomId).emit("roomChanged", data);

    await this.roomListWasChanged();

    return data;
  }

  @SubscribeMessage("leaveRoom")
  async handleLeaveRoom(@MessageBody() roomData: { room: string }, @ConnectedSocket() client: any) {
    const roomId = roomData.room;

    await this.leaveRoom(roomId, client);

    await this.roomListWasChanged();
  }

  private async leaveRoom(roomId: string, client: any) {
    await client.leave(roomId);

    await this.removeFromRoom(roomId, client);

    const clientsInRoom = await this.getRoomClients(roomId);
    this.server.to(roomId).emit("roomChanged", { room: roomId, clients: clientsInRoom });
  }

  async roomListWasChanged() {
    if (this.server && this.server.emit) {
      const rooms = await this.getRoomsList();
      this.server.emit("roomCreated", { rooms } as any);
    }
  }

  @SubscribeMessage("createRoom")
  async handleCreateRoom(@MessageBody() roomData: { room: string }, @ConnectedSocket() client: any) {
    const roomId: string = roomData.room;

    await client.join(roomId);
    await this.addRoom(roomId, client);

    await this.roomListWasChanged();
  }

  @SubscribeMessage("deleteRoom")
  async handleDeleteRoom(@MessageBody() roomData: { room: string }) {
    const roomName: string = roomData.room;

    await this.removeRoom(roomName);

    await this.roomListWasChanged();
  }


  private async addToRoom(roomId: string, userName: string, subtitle: number | string, client: any) {
    const room = await this.roomModel.findOne({ _id: roomId }) as Room;

    if (room) {
      const isUsernameTaken = room.clients.some(client => client.name === userName);

      if (isUsernameTaken) {
        return { error: "Username is already taken in this room." };
      }

      room.clients.push({
        id: client.id,
        subtitle: typeof subtitle === 'string' ? parseInt(subtitle) : subtitle,
        name: userName
      });

      await room.save();

      const clientsInRoom = await this.getRoomClients(roomId);
      this.server.to(roomId).emit("roomChanged", { room: roomId, clients: clientsInRoom });
    }
  }

  private async addRoom(roomName: string, client: any) {
    const newRoom = new this.roomModel({
      name: roomName,
      createdAt: new Date(),
      authorName: client?.username || "Аноним"
    });

    await newRoom.save();
  }

  private async removeRoom(roomName: string) {
    await this.roomModel.findOneAndDelete({ name: roomName });
  }

  private async removeFromRoom(roomId: string, client: any) {
    console.log("roomId", roomId);
    console.log("clientID", client.id);
  
    // Find and update the room in the database
    const updatedRoom = await this.roomModel.findOneAndUpdate(
      { _id: roomId },
      { $pull: { clients: { id: client.id } } },
      { new: true }
    ).catch(error => {
      console.error('Error updating room:', error);
      throw error;
    }) as Room;
  
    // Update the in-memory representation if the room was found and updated
    if (updatedRoom) {
      await this.roomListWasChanged();
    }
  }

  handleConnection(client: any, ...args): any {
    console.log(client.id + " CONNECTED");
  }
}
