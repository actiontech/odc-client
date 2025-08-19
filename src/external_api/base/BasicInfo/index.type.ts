/* eslint-disable */
// @ts-nocheck
import { IGetBasicInfoReply, IGenericResp } from '../common.type';

export interface IGetBasicInfoReturn extends IGetBasicInfoReply {}

export interface IPersonalizationParams {
  title?: string;

  file?: any;
}

export interface IPersonalizationReturn extends IGenericResp {}
