import {
  catchError,
  map,
  Observable,
  of,
  startWith,
} from 'rxjs';

export enum Status {
  Idle,
  Loading,
  Failure,
  Success,
}

type Idle = {
  status: Status;
};

type Loading = {
  status: Status;
};

type Failure<TError> = {
  status: Status;
  error: TError;
};

type Success<TValue> = {
  status: Status;
  data: TValue;
};

type Guards = {
  hasValue: () => this is Success<unknown>;
  hasError: () => this is Failure<unknown>;
  isLoading: () => this is Loading;
};

function addGuards<T extends { status: Status }>(resource: T): T & Guards {
  return {
    ...resource,
    hasValue(): this is Success<unknown> {
      return this.status === Status.Success;
    },
    hasError(): this is Failure<unknown> {
      return this.status === Status.Failure;
    },
    isLoading(): this is Loading {
      return this.status === Status.Loading;
    },
  };
}

export type Resource<TValue = any, TError = Error> = (
  | Idle
  | Loading
  | Failure<TError>
  | Success<TValue>
  ) &
  Guards;

export function loading(): Loading & Guards {
  return addGuards({status: Status.Loading});
}

export function failure<TError>(error: TError): Failure<TError> & Guards {
  return addGuards({
    status: Status.Failure,
    error,
  });
}

export function success<TValue>(data: TValue): Success<TValue> & Guards {
  return addGuards({
    status: Status.Success,
    data,
  });
}

export function idle(): Idle {
  return {
    status: Status.Idle,
  };
}

export function withStatus<TValue = unknown, TError = Error>(source$: Observable<TValue>): Observable<Resource<TValue, TError>> {
  return source$.pipe(
    map((data: TValue) => success<TValue>(data)),
    catchError((error: TError) => of(failure<TError>(error))),
    startWith(loading())
  )
}
