import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDto, UserDto, GetUserMeDto } from "./dtos";
import { User } from "./schemas";
import { UserRepository } from "./user.repository";
import { UserApiErrorMessage } from "src/common/constants";
import { responseHandler } from "src/common/helpers/response-handler";
import { IResult } from "src/database/interfaces/IResult.interface";
import { Result } from "src/database/interfaces/result.interface";
import { resultHandler } from "src/common/helpers";

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async create(user: CreateUserDto): Promise<Result<User>> {
    const data = await this.userRepository.create({ ...user });

    return resultHandler(201, "user created", data);
  }

  async updateUserBalance(
    walletAddress: string,
    amount: number
  ): Promise<IResult> {
    const user = await this.userRepository.findOne({ walletAddress });
    if (!user) {
      throw new NotFoundException(UserApiErrorMessage.USER_NOT_FOUND);
    }

    await this.userRepository.updateOne(
      { walletAddress },
      { $set: { totalBalance: user.totalBalance + amount } }
    );

    return responseHandler(200, "user balance updated");
  }

  async findUser(
    query: UserDto,
    projection?: Record<string, number>
  ): Promise<Result<User>> {
    const data = await this.userRepository.findOne(query, { ...projection });

    return resultHandler(200, "user data", data);
  }

  async getUserList(filter = {}): Promise<Result<User[]>> {
    const userList = await this.userRepository.find(filter);
    return resultHandler(200, "user list", userList);
  }

  async findUserByWallet(
    walletAddress: string,
    projection?: Record<string, number>
  ): Promise<Result<User>> {
    const user = await this.userRepository.findOne(
      { walletAddress },
      { ...projection }
    );
    if (!user) {
      return resultHandler(404, "user not found", null);
    }
    return resultHandler(200, "user data", user);
  }

  async findUserById(
    userId: string,
    projection?: Record<string, number>
  ): Promise<Result<User>> {
    const user = await this.userRepository.findOne(
      { _id: userId },
      { ...projection }
    );

    if (!user) {
      return resultHandler(404, "user not found", null);
    }
    return resultHandler(200, "user data", user);
  }
  async updateUserById(
    userId: string,
    data: UserDto,
    removeDataList?: Array<string>
  ): Promise<Result<User>> {
    const result = this.userRepository.findOneAndUpdate(
      { _id: userId },
      data,
      removeDataList
    );

    return resultHandler(200, "user updated", result);
  }

  async getUserData(userId: string): Promise<Result<GetUserMeDto>> {
    return await this.findUserById(userId, {
      id: 1,
      walletAddress: 1,
      totalBalance: 1,
      createdAt: 1,
      updatedAt: 1,
    });
  }

  async getUserDataWithPaginate(
    skip: number,
    limit: number,
    filter,
    sortOption,
    projection?
  ): Promise<Result<User[]>> {
    const userList = this.userRepository.findWithPaginate(
      skip,
      limit,
      filter,
      sortOption,
      projection
    );

    return resultHandler(200, "user data", userList);
  }

  async getUserCount(filter): Promise<Result<number>> {
    const userCount = this.userRepository.count(filter);

    return resultHandler(200, "user count", userCount);
  }
}
