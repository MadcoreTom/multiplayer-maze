#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';

require('dotenv').config();

const app = new cdk.App();
new CdkStack(app, 'CdkStack',
  process.env.DEPLOY_VPC_ID as string,
  {
    env: {
      region: process.env.DEPLOY_REGION,
      account: process.env.DEPLOY_ACCOUNT
    }
  }
);