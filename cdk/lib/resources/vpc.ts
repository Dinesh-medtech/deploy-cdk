import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib';
import { Stack, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  CfnVPCEndpoint,
  VpcEndpointType,
} from "aws-cdk-lib/aws-ec2";

export function createVpc(
    scope: Construct,
    natGateways: number,
    az: number
  ) {
    const vpc = new ec2.Vpc(scope, 'my-app-VPC', {
        ipAddresses: ec2.IpAddresses.cidr("10.1.0.0/16"),
        natGateways: natGateways,
        maxAzs: az,
        subnetConfiguration: [
          {
            name: 'genie-public-subnet-1',
            subnetType: ec2.SubnetType.PUBLIC,
            cidrMask: 24,
          },
          {
            name: 'genie-public-subnet-2',
            subnetType: ec2.SubnetType.PUBLIC,
            cidrMask: 24,
          },
          {
            name: 'genie-private-subnet-1',
            subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            cidrMask: 24,
          },
          {
            name: 'genie-private-subnet-2',
            subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
            cidrMask: 24,
          },
        ],
      });

    return vpc;
}

export function createS3GatewayEndpoint(
  scope: Construct,
  Vpc: ec2.Vpc
) {

  // Define an array to hold the route table IDs
  let routeTableIds: string[] = [];

  const privateSubnets = Vpc.privateSubnets
  privateSubnets.forEach((sub, index) => {
    routeTableIds.push(sub.routeTable.routeTableId);
  });

  const publicSubnets = Vpc.publicSubnets
  publicSubnets.forEach((sub, index) => {
    routeTableIds.push(sub.routeTable.routeTableId);
  });

  // Create a VPC Gateway Endpoint for s3
  const s3GatewayEndpoint = new CfnVPCEndpoint(scope, `S3GatewayEndpoint`, {
    vpcId: Vpc.vpcId,
    serviceName: ec2.GatewayVpcEndpointAwsService.S3.name,
    vpcEndpointType: VpcEndpointType.GATEWAY,
    routeTableIds: routeTableIds
  });

  return s3GatewayEndpoint;
}
