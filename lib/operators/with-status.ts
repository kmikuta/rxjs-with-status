import { Observable } from "rxjs";

import { EventWithStatus, withStatus as withStatusFn } from "../with-status";

export function withStatus<ResponseType>(): (
  source$: Observable<ResponseType>,
) => Observable<EventWithStatus<ResponseType>> {
  return withStatusFn;
}
