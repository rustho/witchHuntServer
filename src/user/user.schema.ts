import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  name: String,
  subtitle: String,
});

export interface User extends mongoose.Document {
  name: string;
  subtitle: string;
}