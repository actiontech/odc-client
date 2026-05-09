/* eslint-disable */
// @ts-nocheck
import {
  IGetCompanyNoticeReply,
  IUpdateCompanyNoticeReq,
  IGenericResp
} from '../common.type';

export interface IGetCompanyNoticeParams {
  include_latest_outside_period?: boolean;
}

export interface IGetCompanyNoticeReturn extends IGetCompanyNoticeReply {}

export interface IUpdateCompanyNoticeParams extends IUpdateCompanyNoticeReq {}

export interface IUpdateCompanyNoticeReturn extends IGenericResp {}
