import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { SocketService } from './socket/socket.service';
// import { DatabaseModule } from './database.module';
// import { MongooseModule } from '@nestjs/mongoose';
// import { UserSchema } from './user/user.schema';
// import { UserController } from './user/user.controller';
// import { UserService } from './user/user.service';
// import { RoomController } from './room/room.controller';
// import { RoomService } from './room/room.service';
// import { RoomSchema } from './room/room.model';
import { SheetsModule } from './excel/sheets.module';

@Module({
  imports: [
    // DatabaseModule,
    // MongooseModule.forFeature([
    //   { name: 'User', schema: UserSchema },
    //   { name: 'Room', schema: RoomSchema }, // Добавьте RoomSchema в список схем
    // ]),
    SheetsModule,
  ],
  // controllers: [AppController, UserController, RoomController],
  // providers: [AppService, SocketService, UserService, RoomService],
  exports: [SheetsModule],
})
export class AppModule {}
