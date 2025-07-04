import {
  Injectable,
  Inject,
} from '@nestjs/common';
import { CreateUserDto, IUserRepository, IUserService, USER_REPOSITORY } from '@modules/user/presentation/interfaces/user.interface';
import { UpdateUserDto } from '@modules/user/presentation/dto/updateUser.dto';
import { User } from '@modules/user/entities/user.entity';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) { }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.create(createUserDto);
    return user;
  }

  async updateUser(id: string, payload: UpdateUserDto): Promise<User | null> {

    await this.userRepository.update({ id: Number(id) }, payload);
    const updatedUser = await this.userRepository.findById(id);
    return updatedUser;
  }
}
