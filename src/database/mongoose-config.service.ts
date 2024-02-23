import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { mongoConfiguration } from '../configs';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(
    @Inject(mongoConfiguration.KEY)
    private readonly mongoConfig: ConfigType<typeof mongoConfiguration>,
  ) {}

  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.mongoConfig.url,
    };
  }
}
