import * as cdk from 'aws-cdk-lib';
import { Vpc, SubnetType, GatewayVpcEndpointAwsService, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class VpcStack extends cdk.Stack {
  public readonly vpc: Vpc;
  public readonly securityGroup: SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC with subnets
    this.vpc = new Vpc(this, 'MyVpc', {
      maxAzs: 3,
      subnetConfiguration: [
        {
          name: 'PublicSubnet',
          subnetType: SubnetType.PUBLIC,  
        },
        {
          name: 'PrivateSubnet',
          subnetType: SubnetType.PRIVATE_WITH_EGRESS, 
        }
      ]
    });

    // Security Group for resources within the VPC
    this.securityGroup = new SecurityGroup(this, 'MyVpcSecurityGroup', {
      vpc: this.vpc,
      allowAllOutbound: true,
    });

    // S3 Gateway Endpoint
    this.vpc.addGatewayEndpoint('S3Endpoint', {
      service: GatewayVpcEndpointAwsService.S3,
      subnets: [{ subnetType: SubnetType.PRIVATE_WITH_EGRESS }],
    });
  }
}
