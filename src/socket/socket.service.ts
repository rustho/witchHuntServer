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
    userName
  }: { roomId: string, userName: string }, @ConnectedSocket() client: any) {
    await this.leaveRoom(roomId, client);

    client.join(roomId);
    await this.addToRoom(roomId, userName, client);

    const clientsInRoom = await this.getRoomClients(roomId);
    const data = { room: roomId, clients: clientsInRoom, userName };
    this.server.to(roomId).emit("roomChanged", data);

    await this.roomListWasChanged();

    return data;
  }

  @SubscribeMessage("leaveRoom")
  async handleLeaveRoom(@MessageBody() roomData: { room: string }, @ConnectedSocket() client: any) {
    const roomId = roomData.room;

    console.log("here", roomId);
    await this.leaveRoom(roomId, client);

    await this.roomListWasChanged();

    // const clientsInRoom = await this.getRoomClients(roomId);
    // this.server.to(roomId).emit('roomChanged', { room: roomId, clients: clientsInRoom });
  }

  getRoomId(client: any) {
    // console.log('client.rooms', client.rooms, client.id);
    //
    // // for (const room of Object.keys(client.rooms)) {
    // //   if (room !== client.id) {
    // //     return room;
    // //   }
    // // }
    // const rooms = [...client.rooms].filter(room => room !== client.id)
    // console.log('rooms', rooms);
    // return rooms[rooms.length - 1];
  }


  private async leaveRoom(roomId: string, client: any) {
    console.log("leave", roomId);

    client.leave(roomId);
    await this.removeFromRoom(roomId, client);

    const clientsInRoom = await this.getRoomClients(roomId);
    console.log("clientsInRoom", clientsInRoom);
    this.server.to(roomId).emit("roomChanged", { room: roomId, clients: clientsInRoom });

    // for (const room of Object.keys(client.rooms)) {
    //   if (room !== client.id) {
    //     await this.removeFromRoom(room, client);
    //     client.leave(room);
    //
    //     const clientsInRoom = await this.getRoomClients(room);
    //     this.server.to(room).emit('roomChanged', { room, clients: clientsInRoom });
    //   }
    // }
    // console.log('leave', client.id, client.rooms);
    // for (const room of Object.keys(client.rooms)) {
    //   if (room !== client.id) {
    //     await this.removeFromRoom(room, client);
    //     client.leave(room);
    //
    //     const clientsInRoom = await this.getRoomClients(room);
    //     this.server.to(room).emit('roomChanged', { room, clients: clientsInRoom });
    //   }
    // }
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

    client.join(roomId);
    await this.addRoom(roomId, client);

    await this.roomListWasChanged();
  }

  @SubscribeMessage("deleteRoom")
  async handleDeleteRoom(@MessageBody() roomData: { room: string }) {
    const roomName: string = roomData.room;

    await this.removeRoom(roomName);

    await this.roomListWasChanged();
  }


  private async addToRoom(roomId: string, userName: string, client: any) {
    const room = await this.roomModel.findOne({ _id: roomId }) as Room;

    if (room) {
      const isUsernameTaken = room.clients.some(client => client.name === userName);

      if (isUsernameTaken) {
        return { error: "Username is already taken in this room." };
      }

      room.clients.push({
        id: client.id,
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
    const room = await this.roomModel.findOne({ _id: roomId }) as Room;

    console.log("ssss", room);
    if (room) {
      room.clients = room.clients.filter(el => el.id !== client.id);
      await room.save();
      await this.roomListWasChanged();

      // if (index !== -1) {
      //   room.clients.splice(index, 1);
      //   console.log('after fix', room.clients);
      //
      // }
    }
  }

  handleConnection(client: any, ...args): any {
    console.log(client.id + " CONNECTED");
  }
}
