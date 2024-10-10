import * as cdk from 'aws-cdk-lib';
import { CfnOutput } from "aws-cdk-lib";
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from 'constructs';
import { Subnet } from 'aws-cdk-lib/aws-ec2';
import { createS3GatewayEndpoint, createVpc } from './resources/vpc';
import { createKeyMultiRegion } from './resources/kms';
import { createALB, createApplicationLoadBalancer } from './resources/alb';

export class NetworkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const multiRegionResources = ["rds"];

    /**
     * Function for creating vpc
     * @param scope - cdk scope
     * @param natGateways - No of natGateways
     * @param maxAzs - maxAzs
     */
    const vpc = createVpc(this, 0, 2)
    new CfnOutput(
      this,
      `vpc-export`,
      {
        value: vpc.vpcId,
        exportName: "my-app-vpcId",
      }
    );

    new CfnOutput(
      this,
      `subnet-export`,
      {
        value: vpc.publicSubnets.map(subnet => subnet.subnetId).join(','),
        exportName: "my-app-Subnets",
      }
    );

    new CfnOutput(
      this,
      `public-subnet1-export`,
      {
        value: vpc.publicSubnets[0].subnetId,
        exportName: "my-app-Public-Subnet1",
      }
    );

    new CfnOutput(
      this,
      `public-subnet2-export`,
      {
        value: vpc.publicSubnets[1].subnetId,
        exportName: "my-app-Public-Subnet2",
      }
    );

    const alb = createApplicationLoadBalancer(this, vpc.vpcId, vpc.publicSubnets, vpc.vpcCidrBlock)

    if(process.env.ENV === "development"){
      const testALB = createALB(this, vpc.vpcId, vpc.publicSubnets, vpc.vpcCidrBlock, "public-partner-my-app-alb-test", "Public-Alb-test-SecurityGroup", "Public-Partner-my-app-Alb-Arn-test", "Public-Partner-my-app-Alb-test-sg")

    }
    // Create S3 Gateway Endpoint
    const createS3Gatewayendpoint = createS3GatewayEndpoint(this, vpc)

    //Create Multi-Regional Keys
    if (process.env.ENV) {
      createKeyMultiRegion(
        this,
        process.env.ENV,
        "my-app",
        "my-app"
      );
    }
  }
}
