
import { camelCase, mapKeys } from "lodash"
import { DatabaseError } from "pg-protocol"
import { DeleteResult, EntityNotFoundError, InsertResult, QueryFailedError, Repository, UpdateResult } from "typeorm"
import { DbErrorCode } from "./db-error-code.enum"

export type NotArray = object & { length?: never }

export class DbHelpers {
  static extractIDFromInsertResult(queryResult: InsertResult) {
    return queryResult.generatedMaps[0].id as string
  }

  static isAffected(deleteResult: DeleteResult | UpdateResult): boolean {
    return deleteResult.affected !== 0
  }

  static mapObjectKeysToCamelCase(obj: NotArray) {
    return mapKeys(obj, (v, k) => camelCase(k)) as object
  }

  static isQueryFailedError(err: unknown): err is QueryFailedError & DatabaseError {
    return err instanceof QueryFailedError
  }

  static isUniqueError(e: unknown) {
    if (DbHelpers.isQueryFailedError(e)) {
      return e.code === DbErrorCode.UNIQUE_VIOLATION
    }
    return false
  }

  static isSerializationFailure(e: unknown) {
    if (DbHelpers.isQueryFailedError(e)) {
      return e.code === DbErrorCode.T_R_SERIALIZATION_FAILURE
    }
    return false
  }

  static isDeadlockDetectedError(e: unknown) {
    if (DbHelpers.isQueryFailedError(e)) {
      return e.code === DbErrorCode.T_R_DEADLOCK_DETECTED
    }
    return false
  }

  static isNotFoundError(e: unknown): e is EntityNotFoundError {
    return e instanceof EntityNotFoundError
  }

  // https://github.com/typeorm/typeorm/issues/5816
  // useful for select all columns when some column have select: false
  static getAllEntityColumns<T extends object>(repository: Repository<T>): (keyof T)[] {
    return repository.metadata.columns.map((col) => col.propertyName) as (keyof T)[]
  }
}
