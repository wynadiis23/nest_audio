import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ObjectId, Types, SortOrder } from 'mongoose';
import { LogQueryInterface } from './interface';

@Injectable()
export class LoggerService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async getLog(logQueryOptions: LogQueryInterface): Promise<any> {
    try {
      const x = this.connection.collection('log_collections');
      const query: any = {};

      if (logQueryOptions.since && logQueryOptions.until) {
        query['time'] = {
          $gte: new Date(logQueryOptions.since),
          $lt: new Date(logQueryOptions.until),
        };
      }

      if (logQueryOptions.users.length) {
        query['req._added.username'] = {
          $in: logQueryOptions.users,
        };
      }

      const { paginatedQuery, nextKeyFn } = this.generatePaginationQuery(
        query,
        [],
        logQueryOptions.cursor ? logQueryOptions.cursor : null,
      );

      console.log(JSON.stringify(paginatedQuery, null, 2));
      console.log('next key function', nextKeyFn);

      const response = await x.find(paginatedQuery).limit(5).toArray();

      if (response.length) {
        const nextKey = nextKeyFn(response);

        return [response, nextKey._id.toString()];
      }

      return [response, null];
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async getUserInLog() {
    try {
      const users = await this.connection
        .collection('log_collections')
        .distinct('req._added.username');

      // add empty username to list
      users.push('');

      return users;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  generatePaginationQuery(query, sort, nextKey) {
    const sortField = sort == null ? null : sort[0];
    console.log(sortField);

    function nextKeyFn(items) {
      if (items.length === 0) {
        return null;
      }

      const item = items[items.length - 1];

      if (sortField == null) {
        console.log('sortfield null');
        return { _id: item._id };
      }

      console.log([sortField]);
      console.log(item[sortField]);

      return { _id: item._id, [sortField]: item[sortField] };
    }

    if (nextKey == null) {
      return { paginatedQuery: query, nextKeyFn };
    }

    let paginatedQuery = query;

    if (sort == null) {
      paginatedQuery._id = { $gt: nextKey._id };
      return { paginatedQuery, nextKey };
    }

    const sortOperator = sort[1] === 1 ? '$gt' : '$lt';

    const paginationQuery = [
      // { [sortField]: { [sortOperator]: nextKey[sortField] } },
      {
        $and: [
          // { [sortField]: nextKey[sortField] },
          { _id: { $gt: nextKey._id } },
        ],
      },
    ];

    paginatedQuery = {
      $and: [
        query,
        { _id: { $gt: Types.ObjectId.createFromHexString(nextKey) } },
      ],
    };

    // if (paginatedQuery.$or == null) {
    //   console.log('dinis');
    //   paginatedQuery.$or = paginationQuery;
    // } else {
    //   console.log('masuk sini');

    // }

    return { paginatedQuery, nextKeyFn };
  }
}
