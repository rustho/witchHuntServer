import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://leo:hXghunyFKd3A0Iaq@cluster0.luawq.mongodb.net/'),
  ],
})
export class DatabaseModule {}