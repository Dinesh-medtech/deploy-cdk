import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { VpcStack } from './resources/vpc';
import { LoadBalancerStack } from './resources/alb';
import { KmsStack } from './resources/kms';

export class MainStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC and S3 Endpoint
    const vpcStack = new VpcStack(this, 'VpcStack');

    // Load Balancer 
    new LoadBalancerStack(this, 'LoadBalancerStack');

    // KMS Key
    new KmsStack(this, 'KmsStack');
  }
}
