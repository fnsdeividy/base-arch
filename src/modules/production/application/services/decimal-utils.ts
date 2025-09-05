import { Decimal } from '@prisma/client/runtime/library';

export function toNumber(value: Decimal | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  
  if (typeof value === 'number') {
    return value;
  }
  
  return value.toNumber();
}

export function toDecimal(value: number | Decimal | null | undefined): Decimal {
  if (value === null || value === undefined) {
    return new Decimal(0);
  }
  
  if (value instanceof Decimal) {
    return value;
  }
  
  return new Decimal(value);
}
