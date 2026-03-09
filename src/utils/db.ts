/*eslint-disable @typescript-eslint/no-explicit-any*/

export type Filter = {
  fieldName?: string;
  filterType?:
    | "equals"
    | "greaterThan"
    | "lessThan"
    | "between"
    | "before"
    | "after"
    | "exactly"
    | "contains"
    | "doesNotContain"
    | "isOneOf"
    | "isTrue"
    | "isFalse"
    | "isEmpty";
  filterValue?: string;
  filterValue2?: string;
  logic?: "and" | "or";
};

export function applyFiltersToSupabase<
  T extends {
    filter: (col: string, op: string, val: any) => T;
    gte: (col: string, val: any) => T;
    lte: (col: string, val: any) => T;
    or: (cond: string) => T;
  },
>(query: T, filters: Filter[]): T {
  filters.forEach((filter, index) => {
    const {
      fieldName,
      filterType,
      filterValue,
      filterValue2,
      logic = "and",
    } = filter;

    if (!fieldName || !filterType) return; // skip incomplete

    let condition: string | null = null;

    switch (filterType) {
      // Number / date comparisons
      case "equals":
        condition = `${fieldName}.eq.${filterValue}`;
        break;
      case "greaterThan":
        condition = `${fieldName}.gt.${filterValue}`;
        break;
      case "lessThan":
        condition = `${fieldName}.lt.${filterValue}`;
        break;
      case "between":
        query = query.gte(fieldName, filterValue).lte(fieldName, filterValue2);
        return;
      // Date specific
      case "before":
        condition = `${fieldName}.lt.${filterValue}`;
        break;
      case "after":
        condition = `${fieldName}.gt.${filterValue}`;
        break;
      // String
      case "exactly":
        condition = `${fieldName}.eq.${filterValue}`;
        break;
      case "contains":
        condition = `${fieldName}.ilike.%${filterValue}%`;
        break;
      case "doesNotContain":
        condition = `${fieldName}.not.ilike.%${filterValue}%`;
        break;
      case "isOneOf":
        condition = `${fieldName}.in.(${filterValue
          ?.split(",")
          .map((v) => v.trim())
          .join(",")})`;
        break;
      // Boolean
      case "isTrue":
        condition = `${fieldName}.is.true`;
        break;
      case "isFalse":
        condition = `${fieldName}.is.false`;
        break;
      // Empty check
      case "isEmpty":
        condition = `${fieldName}.is.null`;
        break;
    }

    if (condition) {
      if (logic === "or" && index > 0) {
        query = query.or(condition);
      } else {
        const [col, op, val] = condition.split(".");
        query = query.filter(col, op as any, val);
      }
    }
  });

  return query;
}
