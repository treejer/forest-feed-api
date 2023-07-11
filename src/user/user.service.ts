import { Injectable } from "@nestjs/common";
import { CreateUserDto, UserDto, GetUserMeDto } from "./dtos";
import { User } from "./schemas";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async create(user: CreateUserDto) {
    return await this.userRepository.create({ ...user });
  }

  async findUser(
    query: UserDto,
    projection?: Record<string, number>
  ): Promise<User> {
    return await this.userRepository.findOne(query, { ...projection });
  }

  async getUserList(filter = {}): Promise<User[]> {
    return await this.userRepository.find(filter);
  }

  async findUserByWallet(
    walletAddress: string,
    projection?: Record<string, number>
  ): Promise<User> {
    return await this.userRepository.findOne(
      { walletAddress },
      { ...projection }
    );
  }

  async findUserById(
    userId: string,
    projection?: Record<string, number>
  ): Promise<User> {
    return await this.userRepository.findOne(
      { _id: userId },
      { ...projection }
    );
  }
  async updateUserById(
    userId: string,
    data: UserDto,
    removeDataList?: Array<string>
  ): Promise<User> {
    return this.userRepository.findOneAndUpdate(
      { _id: userId },
      data,
      removeDataList
    );
  }

  async getUserData(userId: string): Promise<GetUserMeDto> {
    return await this.findUserById(userId, {
      id: 1,
      firstName: 1,
      lastName: 1,
      email: 1,
      emailVerifiedAt: 1,
      idCard: 1,
      createdAt: 1,
      updatedAt: 1,
      mobile: 1,
      mobileCountry: 1,
      mobileVerifiedAt: 1,
      userStatus: 1,
      plantingNonce: 1,
    });
  }

  async getUserDataWithPaginate(
    skip: number,
    limit: number,
    filter,
    sortOption,
    projection?
  ) {
    return this.userRepository.findWithPaginate(
      skip,
      limit,
      filter,
      sortOption,
      projection
    );
  }

  async getUserCount(filter) {
    return this.userRepository.count(filter);
  }
}
