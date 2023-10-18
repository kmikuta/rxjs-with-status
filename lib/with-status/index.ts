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
      const successResult: EventWithStatus<ResponseType> = {
        status: EventStatus.SUCCESS,
        response,
      };
      return successResult;
    }),
    catchError((error) => {
      const errorResult: EventWithStatus<ResponseType> = {
        status: EventStatus.ERROR,
        error,
      };
      return of(errorResult);
    }),
    startWith({ status: EventStatus.LOADING }),
  );
}
