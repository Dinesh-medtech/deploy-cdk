import * as cdk from 'aws-cdk-lib';
import { Key } from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

export class KmsStack extends cdk.Stack {
  public readonly kmsKey: Key;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // KMS Key
    this.kmsKey = new Key(this, 'MyKmsKey', {
      enableKeyRotation: true,
    });
  }
}
