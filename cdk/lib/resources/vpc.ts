import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc, SubnetType, SecurityGroup } from 'aws-cdk-lib/aws-ec2';

export class VpcStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a new VPC with public and private subnets
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

    // Create a new Security Group
    const securityGroup = new SecurityGroup(this, 'MySecurityGroup', {
      vpc,
      allowAllOutbound: true,
      description: 'Allow access to my resources',
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
    vpc.publicSubnets.forEach((subnet, index) => {
      new cdk.CfnOutput(this, `PublicSubnetId1`, {
        value: subnet.subnetId,
        exportName: `publicSubnetId1`,
      });
    });

    // Export the Private Subnet IDs
    vpc.privateSubnets.forEach((subnet, index) => {
      new cdk.CfnOutput(this, `PublicSubnetId1`, {
        value: subnet.subnetId,
        exportName: `publicSubnetId2`,  
      });
    });
  }
}
