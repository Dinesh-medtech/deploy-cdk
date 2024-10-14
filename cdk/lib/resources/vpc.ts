import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc, SubnetType, SecurityGroup } from 'aws-cdk-lib/aws-ec2';

export class VpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC 
    const vpc = new Vpc(this, 'MyVpc', {
      maxAzs: 2, 
      natGateways: 1, 
      subnetConfiguration: [
        {
          name: 'PublicSubnet',
          subnetType: SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: 'PrivateSubnet',
          subnetType: SubnetType.PRIVATE_WITH_NAT,
          cidrMask: 24,
        },
      ],
    });

    // Security Group
    const securityGroup = new SecurityGroup(this, 'MySecurityGroup', {
      vpc,
      allowAllOutbound: true,
      securityGroupName: 'MySecurityGroup',
    });

    // Export the VPC ID
    new cdk.CfnOutput(this, 'VpcIdOutput', {
      value: vpc.vpcId,
      exportName: 'VpcId', 
    });

    // Export the Security Group ID
    new cdk.CfnOutput(this, 'SecurityGroupIdOutput', {
      value: securityGroup.securityGroupId,
      exportName: 'SecurityGroupId',
    });

    // Export the Public Subnet IDs
    new cdk.CfnOutput(this, 'PublicSubnetId1', {
      value: vpc.publicSubnets[0].subnetId, 
      exportName: 'PublicSubnetId1',
    });

    // Export the Private Subnet IDs
    new cdk.CfnOutput(this, 'PrivateSubnetId1', {
      value: vpc.privateSubnets[0].subnetId, 
      exportName: 'PrivateSubnetId1',
    });
  }
}
