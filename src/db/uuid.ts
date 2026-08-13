/**
 * Custom UUID column type para PostgreSQL via node-postgres.
 *
 * Motivação: o tipo `uuid()` nativo do Drizzle declara `driverParam: string`,
 * mas não mapeia o valor para o OID `uuid` do PostgreSQL. Quando um valor
 * string é passado em um `eq(column, "id")`, o node-postgres o envia como
 * `text`, e o Postgres responde com:
 *
 *   operator does not exist: uuid = text
 *
 * (ou, no caso de valores malformados, `invalid input syntax for type uuid`).
 *
 * A solução aplica um cast explícito `::uuid` no valor do driver, preservando
 * o tipo de coluna `uuid` no DDL (idêntico ao create-tables.sql).
 */

import { sql } from "drizzle-orm";
import type { ColumnBaseConfig } from "drizzle-orm";
import { PgColumn, PgColumnBuilder } from "drizzle-orm/pg-core";

export type UuidColumnCfg = {
  name: string;
  dataType: "string";
  columnType: "PgUUID";
  data: string;
  driverParam: string;
  enumValues: undefined;
  notNull?: boolean;
  hasDefault?: boolean;
};

class CastUuidBuilder extends PgColumnBuilder<ColumnBaseConfig<"string", "PgUUID">> {
  constructor(name: string) {
    super(name as any, "string", "PgUUID");
  }

  defaultRandom() {
    return this.default(sql`gen_random_uuid()`);
  }

  /** @internal */
  build(table: any): CastUuidColumn {
    return new CastUuidColumn(table, this.config);
  }
}

class CastUuidColumn extends PgColumn<ColumnBaseConfig<"string", "PgUUID">> {
  mapToDriverValue(value: unknown): unknown {
    if (value === null || value === undefined) return value;
    return sql`${value}::uuid`;
  }

  mapFromDriverValue(value: unknown): unknown {
    return value;
  }

  getSQLType(): string {
    return "uuid";
  }
}

export function uuid<TName extends string>(name: TName) {
  return new CastUuidBuilder(name) as any;
}
