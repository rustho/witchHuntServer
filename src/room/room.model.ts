import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import mongoose from "mongoose";

export interface Client {
  id: string;
  name: string;
}

@Schema()
export class Room {
  @Prop({ required: true })
  name: string;

  @Prop()
  createdAt: Date;

  @Prop({ type: [{ id: String, name: String }], default: [] })
  clients: Client[];

  @Prop()
  authorName: string;
}

export interface Room extends mongoose.Document {
  name: string;
  createdAt: Date;
  clients: Client[];
  authorName: string;
}

export type RoomDocument = Room & Document;

export const RoomSchema = SchemaFactory.createForClass(Room);
