import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../shared/infra/database/database.service';

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

@Injectable()
export class UserRepository {
  constructor(private readonly databaseService: DatabaseService) { }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, password, first_name, last_name, phone, created_at, updated_at
      FROM users 
      WHERE email = $1
    `;

    const result = await this.databaseService.query(query, [email]);
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, password, first_name, last_name, phone, created_at, updated_at
      FROM users 
      WHERE id = $1
    `;

    const result = await this.databaseService.query(query, [id]);
    return result.rows[0] || null;
  }

  async create(userData: CreateUserDto): Promise<User> {
    const query = `
      INSERT INTO users (email, password, first_name, last_name, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, password, first_name, last_name, phone, created_at, updated_at
    `;

    const values = [
      userData.email,
      userData.password,
      userData.firstName,
      userData.lastName,
      userData.phone,
    ];

    const result = await this.databaseService.query(query, values);
    return result.rows[0];
  }

  async update(
    id: string,
    userData: Partial<CreateUserDto>,
  ): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (userData.email) {
      fields.push(`email = $${paramCount++}`);
      values.push(userData.email);
    }
    if (userData.password) {
      fields.push(`password = $${paramCount++}`);
      values.push(userData.password);
    }
    if (userData.firstName) {
      fields.push(`first_name = $${paramCount++}`);
      values.push(userData.firstName);
    }
    if (userData.lastName) {
      fields.push(`last_name = $${paramCount++}`);
      values.push(userData.lastName);
    }
    if (userData.phone !== undefined) {
      fields.push(`phone = $${paramCount++}`);
      values.push(userData.phone);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, password, first_name, last_name, phone, created_at, updated_at
    `;

    const result = await this.databaseService.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM users WHERE id = $1`;
    const result = await this.databaseService.query(query, [id]);
    return result.rowCount > 0;
  }
}
