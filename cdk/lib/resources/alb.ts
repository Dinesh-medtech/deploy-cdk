import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib';
import { Stack, Tags , CfnOutput, Fn} from "aws-cdk-lib";
import { Construct } from "constructs";
import { Peer, Port } from "aws-cdk-lib/aws-ec2";
import {
    ApplicationLoadBalancer,
    IpAddressType,
  } from "aws-cdk-lib/aws-elasticloadbalancingv2";
  import { ISubnet, IVpc, SecurityGroup, Subnet, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";

export function createALB(
    scope: Construct,
    vpcId: string,
    subnetIds: ec2.ISubnet[],
    vpcCidrBlock: string,
    albName: string,
    albSGName: string,
    albArnExportName: string,
    albSGIDExportName: string
  ) {
    
    const region = Stack.of(scope).region;
    const azs = [`${region}a`, `${region}b`];

    const vpc = Vpc.fromVpcAttributes(
        scope,
        `vpcLookup-${albName}`,
        {
          vpcId,
          availabilityZones: azs,
        }
      );

      const sbns: ISubnet[] = [];
      const addedAZs: string[] = []; // Keep track of added availability zones
      
      for (let index = 0; index < azs.length; index++) {
          subnetIds.forEach(subnet => {
              if (subnet.availabilityZone === azs[index] && !addedAZs.includes(azs[index])) {
                  const sbn = Subnet.fromSubnetAttributes(
                      scope,
                      `SubnetLookup${index}${subnet.subnetId}-${albName}`,
                      {
                          subnetId: subnet.subnetId,
                          availabilityZone: azs[index],
                      }
                  );
                  sbns.push(sbn);
                  addedAZs.push(azs[index]); // Add the availability zone to the list of added AZs
              }
          });
      }

      const subnets = vpc.selectSubnets({
        subnets: sbns,
      });

      const hostSecurityGroup = new SecurityGroup(
        scope,
        `Public-AlbSecurityGroup-${albName}`,
        {
          allowAllOutbound: false,
          vpc,
          securityGroupName: albSGName,
        }
      );
      hostSecurityGroup.addIngressRule(
        Peer.ipv4("0.0.0.0/0"),
        Port.tcp(443),
        `Allow all IP`,
      );
      hostSecurityGroup.addIngressRule(
        Peer.ipv4("0.0.0.0/0"),
        Port.tcp(80),
        `Allow all IP`,
      );
      hostSecurityGroup.addEgressRule(
        Peer.ipv4(vpcCidrBlock),
        Port.allTcp(),
        `Allow VPC CIDR Only`,
      );

    const alb = new ApplicationLoadBalancer(
        scope,
        `${albName}`,
        {
          vpc: vpc,
          loadBalancerName: albName,
          ipAddressType: IpAddressType.IPV4,
          vpcSubnets: subnets,
          internetFacing: true,
          securityGroup: hostSecurityGroup,
          dropInvalidHeaderFields: true,
          deletionProtection: true
        }
      );

  new CfnOutput(
    scope,
    `${albName}SGExport`,
    {
      value: Fn.join(",", alb.loadBalancerSecurityGroups),
      exportName: albSGIDExportName,
    }
  );

  new CfnOutput(
    scope,
    `${albName}ARNExport`,
    {
      value: alb.loadBalancerArn,
      exportName: albArnExportName,
    }
  );

  }

  export function createApplicationLoadBalancer(
    scope: Construct,
    vpcId: string,
    subnetIds: ec2.ISubnet[],
    vpcCidrBlock: string
  ) {
    
    const region = Stack.of(scope).region;
    const azs = [`${region}a`, `${region}b`];

    const vpc = Vpc.fromVpcAttributes(
        scope,
        `vpcLookup`,
        {
          vpcId,
          availabilityZones: azs,
        }
      );

      const sbns: ISubnet[] = [];
      const addedAZs: string[] = []; // Keep track of added availability zones
      
      for (let index = 0; index < azs.length; index++) {
          subnetIds.forEach(subnet => {
              if (subnet.availabilityZone === azs[index] && !addedAZs.includes(azs[index])) {
                  const sbn = Subnet.fromSubnetAttributes(
                      scope,
                      `SubnetLookup${index}${subnet.subnetId}`,
                      {
                          subnetId: subnet.subnetId,
                          availabilityZone: azs[index],
                      }
                  );
                  sbns.push(sbn);
                  addedAZs.push(azs[index]); // Add the availability zone to the list of added AZs
              }
          });
      }

      const subnets = vpc.selectSubnets({
        subnets: sbns,
      });

      const hostSecurityGroup = new SecurityGroup(
        scope,
        `Public-AlbSecurityGroup`,
        {
          allowAllOutbound: false,
          vpc,
          securityGroupName: `Public-Alb-SecurityGroup`,
        }
      );
      hostSecurityGroup.addIngressRule(
        Peer.ipv4("0.0.0.0/0"),
        Port.tcp(443),
        `Allow all IP`,
      );
      hostSecurityGroup.addIngressRule(
        Peer.ipv4("0.0.0.0/0"),
        Port.tcp(80),
        `Allow all IP`,
      );
      hostSecurityGroup.addEgressRule(
        Peer.ipv4(vpcCidrBlock),
        Port.allTcp(),
        `Allow VPC CIDR Only`,
      );

    const alb = new ApplicationLoadBalancer(
        scope,
        `Alb`,
        {
          vpc: vpc,
          loadBalancerName: `public-partner-my-app-alb`,
          ipAddressType: IpAddressType.IPV4,
          vpcSubnets: subnets,
          internetFacing: true,
          securityGroup: hostSecurityGroup,
          dropInvalidHeaderFields: true,
          deletionProtection: true
        }
      );

  new CfnOutput(
    scope,
    `ALBSGExport`,
    {
      value: Fn.join(",", alb.loadBalancerSecurityGroups),
      exportName: `Public-Partner-my-app-Alb-sg`,
    }
  );

  new CfnOutput(
    scope,
    `ALBARNExport`,
    {
      value: alb.loadBalancerArn,
      exportName: `Public-Partner-my-app-Alb-Arn`,
    }
  );

  }
