import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { WebsocketModule } from './websocket/websocket.module';
import { GraphqlModule } from './graphql/graphql.module';
import { RouterModule } from '@nestjs/core';


@Module({
  imports: [
    ApiModule, 
    WebsocketModule,
    GraphqlModule]
})
export class RestModule {}
