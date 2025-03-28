export interface Room {
  _id: string;
  number: string;
  type: string;
  floor: number;
  ward: string;
  state: number;
}

// types.ts
export interface RoomFormData {
  number: string;
  type: string;
  floor: number;
  state: number;
}
