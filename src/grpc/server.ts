/* eslint-disable @typescript-eslint/no-explicit-any */
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { restaurantServiceImpl } from './restaurantServiceImp';

// Load the .proto file
const PROTO_PATH = path.resolve(
  __dirname,
  '../../node_modules/mtogo-proto-provider/protos/restaurant.proto',
);

console.log(PROTO_PATH);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const restaurantProto = grpc.loadPackageDefinition(packageDefinition)
  .restaurant as any;

const server = new grpc.Server();
server.addService(
  restaurantProto.RestaurantService.service,
  restaurantServiceImpl,
);

const PORT = 50051;

server.bindAsync(
  `0.0.0.0:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  error => {
    if (error) {
      console.error('Failed to start gRPC server:', error);
      return;
    }
    console.log(`gRPC server running on port ${PORT}`);
  },
);
