import { Observable } from "rxjs";

import { Resource, withStatus as withStatusFn } from "../";

export function withStatus<ResponseType>(): (
  source$: Observable<ResponseType>,
) => Observable<Resource<ResponseType>> {
  return withStatusFn;
}
