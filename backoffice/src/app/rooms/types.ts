export interface Room {
  _id: string;
  number: string;
  type: string;
  floor: number;
<<<<<<< HEAD
  state: number;
=======
  ward: string;
  state: string;
>>>>>>> e5bea7b1700e058f0834dceb2adba7755495ac37
}

// types.ts
export interface RoomFormData {
  number: string;
  type: string;
  floor: number;
<<<<<<< HEAD
  state: number;
=======
  state: string;
  ward: string;

>>>>>>> e5bea7b1700e058f0834dceb2adba7755495ac37
}
