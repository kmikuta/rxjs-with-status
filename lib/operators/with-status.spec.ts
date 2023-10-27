import { expect } from "chai";
import { filter, map } from "rxjs/operators";
import { TestScheduler } from "rxjs/testing";

import { withStatus } from "./with-status";
import { EventStatus, EventWithStatus } from "../with-status";

const comparator = (actual: unknown, expected: unknown) => {
  expect(actual).to.deep.equal(expected);
};

describe("withStatus operator", () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler(comparator);
  });

  describe("when source$ emits a successful response", () => {
    const httpResponse = {
      status: 200,
      data: { foo: "bar" },
    };

    it("should emit an event with success status", () =>
      testScheduler.run(({ cold, expectObservable }) => {
        // given
        const source$ = cold("--r|", { r: httpResponse });
        const expectedEmission = "l-s|";

        // when
        const result$ = source$.pipe(withStatus());

        // then
        expectObservable(result$).toBe(expectedEmission, {
          l: { status: EventStatus.LOADING },
          s: { status: EventStatus.SUCCESS, response: httpResponse },
        });
      }));
  });

  describe("when source$ emits an error", () => {
    it("should emit an event with error status", () =>
      testScheduler.run(({ cold, expectObservable }) => {
        // given
        const errorMessage = "An unknown error has occurred.";
        const source$ = cold("--#", {}, errorMessage);
        const expectedEmission = "l-(e|)";

        // when
        const result$ = source$.pipe(withStatus());

        // then
        expectObservable(result$).toBe(expectedEmission, {
          l: { status: EventStatus.LOADING },
          e: { status: EventStatus.ERROR, error: errorMessage },
        });
      }));
  });

  describe("when explicit typing used", () => {
    it("should not fail on types", () => {
      testScheduler.run(({ cold, expectObservable }) => {
        // given
        const source$ = cold<number>("--r|", { r: 1 });
        const expectedEmission = "--m|";

        // when
        const result$ = source$.pipe(
          withStatus<number>(),
          filter((response) => response.status !== EventStatus.LOADING),
          map((response: EventWithStatus<number>) => response.status),
        );

        // then
        expectObservable(result$).toBe(expectedEmission, {
          l: EventStatus.LOADING,
          m: EventStatus.SUCCESS,
        });
      });
    });
  });
});
