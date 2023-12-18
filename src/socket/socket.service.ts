import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Server } from "socket.io";

type Rooms = Map<string, Set<any>>

interface RoomCreatedEvent {
  rooms: string[];
}

@WebSocketGateway({
  cors: {
    origin: '*'
  }
})
export class SocketService implements OnGatewayConnection {

  @WebSocketServer()
  server: Server;

  rooms: Rooms = new Map();

  getRoomsList(): string[] {
    return Array.from(this.rooms.keys());
  }

  @SubscribeMessage('getRoomsList')
  handleGetRoomsList(@ConnectedSocket() client: any) {
    return this.getRoomsList()
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() roomName: string, @ConnectedSocket() client: any) {
    // Покинуть предыдущую комнату, если был в неё подключён
    this.leaveRoom(client);

    // Присоединиться к новой комнате
    client.join(roomName);
    this.addToRoom(roomName, client);

    // Отправить сообщение о присоединении к комнате
    this.server.to(roomName).emit('roomJoined', { room: roomName, clientId: client.id });
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(@ConnectedSocket() client: any) {
    this.leaveRoom(client);
  }

  private leaveRoom(client: any) {
    Object.keys(client.rooms).forEach(room => {
      if (room !== client.id) {
        this.removeFromRoom(room, client);
        client.leave(room);
        this.server.to(room).emit('roomLeft', { room, clientId: client.id });
      }
    });
  }


  @SubscribeMessage('createRoom')
  handleCreateRoom(@MessageBody() roomData: { room: string }, @ConnectedSocket() client: any)  {
    const roomName: string = roomData.room;

    this.rooms.set(roomName, new Set());

    client.join(roomName);
    this.addToRoom(roomName, client);

    if (this.server && this.server.emit) {
      const rooms = this.getRoomsList()
      this.server.emit('roomCreated', { rooms } as any);
    }
  }


  private addToRoom(roomName: string, client: any) {
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }
    this.rooms.get(roomName).add(client);
  }

  private removeFromRoom(roomName: string, client: any) {
    if (this.rooms.has(roomName)) {
      this.rooms.get(roomName).delete(client);
      if (this.rooms.get(roomName).size === 0) {
        this.rooms.delete(roomName);
      }
    }
  }

  handleConnection(client: any, ...args): any {
    console.log(client.id + ' CONNECTED');
  }
}
