/* tslint:disable no-identical-functions */
/* tslint:disable no-useless-cast */
/* tslint:disable no-unnecessary-type-assertion */
/* tslint:disable no-big-function  */
/* tslint:disable no-duplicate-string  */
import ServiceBase from '../Service.base';
import { AxiosRequestConfig } from 'axios';

import { IListTableColumnsParams, IListTableColumnsReturn } from './index.type';

class DBStructureService extends ServiceBase {
  public ListTableColumns(
    params: IListTableColumnsParams,
    options?: AxiosRequestConfig
  ) {
    const paramsData = this.cloneDeep(params);
    const project_uid = paramsData.project_uid;
    delete paramsData.project_uid;

    const db_service_uid = paramsData.db_service_uid;
    delete paramsData.db_service_uid;

    const schema_name = paramsData.schema_name;
    delete paramsData.schema_name;

    const table_name = paramsData.table_name;
    delete paramsData.table_name;

    return this.get<IListTableColumnsReturn>(
      `/v1/dms/projects/${project_uid}/db_services/${db_service_uid}/schemas/${schema_name}/tables/${table_name}/columns`,
      paramsData,
      options
    );
  }
}

export default new DBStructureService();
