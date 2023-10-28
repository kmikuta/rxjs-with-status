import { Observable, of } from "rxjs";
import { catchError, map, startWith } from "rxjs/operators";

export enum EventStatus {
  LOADING = "LOADING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export type EventWithStatus<ResponseType> =
  | {
      status: EventStatus.LOADING;
    }
  | {
      status: EventStatus.SUCCESS;
      response: ResponseType;
    }
  | {
      status: EventStatus.ERROR;
      error: unknown;
    };

export function withStatus<ResponseType>(source$: Observable<ResponseType>) {
  return source$.pipe(
    map((response) => {
      return {
        status: EventStatus.SUCCESS,
        response,
      } as const;
    }),
    catchError((error) => {
      return of({
        status: EventStatus.ERROR,
        error,
      } as const);
    }),
    startWith({ status: EventStatus.LOADING } as const),
  );
}
