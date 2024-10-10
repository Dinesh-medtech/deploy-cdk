import { CfnOutput, RemovalPolicy, Stack, aws_iam } from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import { Construct } from "constructs";

export function createKeyMultiRegion(
    scope: Construct,
    environment: string,
    name: string,
    alias?: string
  ) {
  
    const key = new kms.Key(scope, `${name}-mr-${environment}`, {
      removalPolicy: RemovalPolicy.RETAIN,
      enabled: true,
      enableKeyRotation: true,
      description: `${name} Multi Region key`,
      // Initially, we set an empty policy, we will update it in the next step
      policy: new aws_iam.PolicyDocument(),
    });
  
    // Allow IAM policies
    key.addToResourcePolicy(new aws_iam.PolicyStatement({
      actions: [
        'kms:*'
      ],
      principals: [new aws_iam.ArnPrincipal(`arn:aws:iam::${Stack.of(scope).account}:root`)],
      resources: ['*'],
    }));

    const cfnKey = key.node.defaultChild as kms.CfnKey;
    cfnKey.addPropertyOverride("MultiRegion", true);
  
    if (alias) {
      const a = new kms.Alias(scope, `${name}-alias-mr-${environment}`, {
        aliasName: alias,
        targetKey: key,
      });
  
      new CfnOutput(
        scope,
        `${name.toLowerCase()}-${environment}MrKmsKeyAlaisExport`,
        {
          value: a.aliasName,
          exportName: `${name}-key-alias`,
        }
      );
    }
    new CfnOutput(
      scope,
      `${name.toLowerCase()}-${environment}MrKmsKeyExport`,
      {
        value: key.keyArn,
        exportName: `${name}-key`,
      }
    );
    return key.keyArn;
}
  
