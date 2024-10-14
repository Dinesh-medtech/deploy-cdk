import * as cdk from 'aws-cdk-lib';
import { Vpc, SecurityGroup, SubnetType } from 'aws-cdk-lib/aws-ec2';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

interface LoadBalancerStackProps extends cdk.StackProps {
  vpc: Vpc;
  securityGroup: SecurityGroup;
}

export class LoadBalancerStack extends cdk.Stack {
  public readonly loadBalancer: ApplicationLoadBalancer;

  constructor(scope: Construct, id: string, props: LoadBalancerStackProps) {
    super(scope, id, props);

    // Application Load Balancer 
    this.loadBalancer = new ApplicationLoadBalancer(this, 'MyALB', {
      vpc: props.vpc,
      internetFacing: true,
      securityGroup: props.securityGroup, 
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,  
      }
    });
  }
}
