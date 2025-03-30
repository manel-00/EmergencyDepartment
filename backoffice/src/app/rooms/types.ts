export interface Room {
  _id: string;
  number: string;
  type: string;
  floor: number;
  ward: string;
  state: string;
}

// types.ts
export interface RoomFormData {
  number: string;
  type: string;
  floor: number;
  state: string;
  ward: string;

}
