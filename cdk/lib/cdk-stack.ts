import * as cdk from 'aws-cdk-lib';
import { Peer, Port, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, Compatibility, ContainerImage, FargateService, LogDriver, Protocol, TaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, vpcId: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = Vpc.fromLookup(this, 'existing-vpc', {
      vpcId
    });

    const cluster = new Cluster(this, 'my-cluster', {
      vpc
    });

    const mySecurityGroup = new SecurityGroup(this, 'maze-security-group', {
      vpc,
      // allowAllOutbound: false
    });
    mySecurityGroup.addIngressRule(
      Peer.anyIpv4(),
      Port.tcp(80)
    );

    const service = new FargateService(this, 'maze-service', {
      cluster,
      taskDefinition: this.createTaskDef(),
      assignPublicIp: true,
      securityGroups: [mySecurityGroup],
      circuitBreaker: { rollback: false }
    });


  }

  private createTaskDef(): TaskDefinition {
    const def = new TaskDefinition(this, 'maze-task', {
      cpu: "1024",
      memoryMiB: "2048",
      compatibility: Compatibility.FARGATE,
    });


    def.addContainer('maze', {
      image: ContainerImage.fromAsset("../", { exclude: ["node_modules", "src", "cdk.out", "cdk"] }),
      portMappings: [{
        protocol: Protocol.TCP,
        containerPort: 80,
        hostPort: 80
      }],
      logging: LogDriver.awsLogs({
        streamPrefix: "maze",
        logRetention: RetentionDays.ONE_DAY
      })
    });

    return def;
  }
}
