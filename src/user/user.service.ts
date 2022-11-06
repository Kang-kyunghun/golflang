import { response } from 'express';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Account } from './entity/account.entity';
import { UserState } from './entity/user-state.entity';
import { User } from './entity/user.entity';
import { Provider, Role } from './enum/user.enum';
import { AuthService } from 'src/auth/auth.service';
import { CommonService } from 'src/common/common.service';
import * as bcrypt from 'bcrypt';
import { SignupInputDto, SignupOutputDto } from './dto/signup-dto';
import { LoginInputDto, LoginOutputDto } from './dto/login-dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(UserState)
    private readonly userStateRepo: Repository<UserState>,
    private readonly commonService: CommonService,
    private readonly JwtService: JwtService,
    private connection: Connection,
  ) {}

  async getUserDetail() {
    try {
    } catch (error) {
      console.log(error);
    }
  }
}
