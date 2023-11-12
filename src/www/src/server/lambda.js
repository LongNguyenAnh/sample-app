import './env';
import '../app/constants/config';
import './bff/constants';
import 'regenerator-runtime/runtime';
import './logger';
import express from 'express';
import applyApp from './applyApp';
import { serverless } from '/express/server';

const app = express();

export const handler = serverless(applyApp(app), { alb: true });