export class Store {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  zipCode: string | null;
  phone: string | null;
  email: string | null;
  type: 'main' | 'branch' | 'kiosk' | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
