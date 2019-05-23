import { Injectable, Inject, HttpException, HttpStatus } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";

import { User } from "../types/user";
import { RegisterDTO, LoginDTO } from "../auth/auth.dto";

@Injectable()
export class UserService {
  constructor(@InjectModel("User") private userModel: Model<User>) {}

  private sanitizeUser(user: User) {
    return user.depopulate("password");
  }

  async create(userDTO: RegisterDTO) {
    console.log(userDTO);

    const { username } = userDTO;
    const user = await this.userModel.findOne({ username });
    if (user) {
      throw new HttpException("User already exists", HttpStatus.BAD_REQUEST);
    }

    const createdUser = new this.userModel(userDTO);
    await createdUser.save();
    return this.sanitizeUser(createdUser);
  }

  async findByLogin(userDTO: LoginDTO) {
    const { username, password } = userDTO;
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new HttpException("Invalid Credentials", HttpStatus.UNAUTHORIZED);
    }

    if (await bcrypt.compare(password, user.password)) {
      return this.sanitizeUser(user);
    } else {
      throw new HttpException("Invalid Credentials", HttpStatus.UNAUTHORIZED);
    }
  }

  async findByPayload(payload: any) {
    const { username } = payload;
    return await this.userModel.findOne({ username });
  }
}
