import { OperatorEnum, SortEnum } from '../enum';

export interface IDataTable {
  filterBy?: string;
  filterOperator?: OperatorEnum;
  filterValue?: string;
  sortBy?: string;
  sortOrder?: SortEnum;
  pageIndex?: number;
  pageSize?: number;
}
