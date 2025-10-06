export class User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  emailVerified: boolean;
  role: string;
  status: string;
  lastLogin?: Date;
  storeId?: string;
  createdAt: Date;
  updatedAt: Date;

  // Computed property
  get name(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
