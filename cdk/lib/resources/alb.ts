import * as cdk from 'aws-cdk-lib';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Vpc,Subnet,SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { Fn } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class LoadBalancerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Import VPC and Security Group using Fn.importValue
    const vpc = Vpc.fromLookup(this, 'ImportedVpc', {
      vpcId: Fn.importValue('VpcId'), 
    });

    const securityGroup = SecurityGroup.fromSecurityGroupId(this, 'ImportedSecurityGroup', 
      Fn.importValue('SecurityGroupId') 
    );

    const publicSubnet1 = Subnet.fromSubnetId(this, 'ImportedPublicSubnet1', 
      Fn.importValue('PublicSubnetId1')
    );
     
    //Application Load Balancer in the imported VPC
    const loadBalancer = new ApplicationLoadBalancer(this, 'MyALB', {
      vpc: vpc,
      securityGroup: securityGroup,
      vpcSubnets: {
        subnets: [
          { subnetId: publicSubnet1 }, 
        ],
      }
    });

    // Output Load Balancer DNS
    new cdk.CfnOutput(this, 'LoadBalancerDns', {
      value: loadBalancer.loadBalancerDnsName,
      exportName: 'LoadBalancerDns',
    });
  }
}
