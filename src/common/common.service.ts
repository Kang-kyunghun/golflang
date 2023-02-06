import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { promisify } from 'util';
import { createCipheriv, createDecipheriv, scrypt } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { TokenInfoConfig } from 'src/config/config';

const IV_LENGTH = 16;

@Injectable()
export class CommonService {
  private accessSecretKey: string;
  private accessSecretKeyExpDate: string;
  private refrechSecretKey: string;
  private refrechSecretKeyExpDate: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const {
      accessSecretKey,
      accessSecretKeyExpDate,
      refrechSecretKey,
      refrechSecretKeyExpDate,
    } = this.configService.get<TokenInfoConfig>('tokenInfos');

    this.accessSecretKey = accessSecretKey;
    this.accessSecretKeyExpDate = accessSecretKeyExpDate;
    this.refrechSecretKey = refrechSecretKey;
    this.refrechSecretKeyExpDate = refrechSecretKeyExpDate;
  }

  async hash(string: string) {
    return await bcrypt.hash(string, 10);
  }

  async isHashValid(password, hashPassword): Promise<boolean> {
    return await bcrypt.compare(password, hashPassword);
  }

  async encrypt(text: string) {
    const PASSWORD = this.configService.get('PROMISIFY_PASSWORD');
    const iv = Buffer.alloc(IV_LENGTH, 0);
    const key = (await promisify(scrypt)(PASSWORD, 'salt', 32)) as Buffer;
    const cipher = createCipheriv('aes-256-cbc', key, iv);

    let result = cipher.update(text, 'utf8', 'base64');
    result += cipher.final('base64');

    return result;
  }

  async decrypt(text: string) {
    const PASSWORD = this.configService.get('PROMISIFY_PASSWORD');
    const iv = Buffer.alloc(IV_LENGTH, 0);
    const key = (await promisify(scrypt)(PASSWORD, 'salt', 32)) as Buffer;

    let decipher = createDecipheriv('aes-256-cbc', key, iv);
    let result = decipher.update(text, 'base64', 'utf8');
    result += decipher.final('utf8');

    return result;
  }

  async getAge(birthday: string): Promise<number> {
    const birth = new Date(birthday);
    const birthYear = birth.getFullYear();

    const today = new Date();
    const todayYear = today.getFullYear();

    const age = todayYear - birthYear + 1;

    return age;
  }

  createAccessToken(payload: Record<string, string>) {
    // 시크릿키와 만료시간을 설정하여 token 생성
    const accessToken = this.jwtService.sign(payload, {
      secret: this.accessSecretKey,
      expiresIn: this.accessSecretKeyExpDate,
    });

    return accessToken;
  }

  createRefreshToken(payload: Record<string, string>) {
    // 시크릿키와 만료시간을 설정하여 token 생성
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.refrechSecretKey,
      expiresIn: this.refrechSecretKeyExpDate,
    });

    return refreshToken;
  }

  accessTokenErrorCheck(accessToken: string) {
    try {
      this.jwtService.verify(accessToken, { secret: this.accessSecretKey });

      return true;
    } catch (error) {
      if (error.message === 'jwt expired') {
        return true;
      } else {
        return false;
      }
    }
  }

  refreshTokenErrorCheck(refreshToken: string) {
    try {
      this.jwtService.verify(refreshToken, { secret: this.refrechSecretKey });

      return true;
    } catch (error) {
      if (error.message === 'jwt expired') {
        return true;
      } else {
        return false;
      }
    }
  }

  refreshTokenExpireCheck(refreshToken: string) {
    try {
      this.jwtService.verify(refreshToken, { secret: this.refrechSecretKey });

      return true;
    } catch (error) {
      if (error.message === 'jwt expired') {
        return false;
      }
    }
  }
}
