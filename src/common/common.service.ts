import { Injectable } from '@nestjs/common';
import { CreateCommonDto } from './dto/create-common.dto';
import { UpdateCommonDto } from './dto/update-common.dto';
import * as bcrypt from 'bcrypt';
import { promisify } from 'util';
import { createCipheriv, createDecipheriv, scrypt } from 'crypto';
const crypto = require('crypto');

const PASSWORD = 'tempPassword123';
const IV_LENGTH = 16;

@Injectable()
export class CommonService {
  constructor() {}

  async hash(string: string) {
    const salt = 10;

    return await bcrypt.hash(string, salt);
  }

  async encrypt(text) {
    const iv = Buffer.alloc(IV_LENGTH, 0);
    const key = (await promisify(scrypt)(PASSWORD, 'salt', 32)) as Buffer;
    const cipher = createCipheriv('aes-256-cbc', key, iv);

    let result = cipher.update(text, 'utf8', 'base64');
    result += cipher.final('base64');

    return result;
  }

  async decrypt(text) {
    const iv = Buffer.alloc(IV_LENGTH, 0);
    const key = (await promisify(scrypt)(PASSWORD, 'salt', 32)) as Buffer;

    let decipher = createDecipheriv('aes-256-cbc', key, iv);
    let result = decipher.update(text, 'base64', 'utf8');
    result += decipher.final('utf8');

    return result;
  }
}
