import { expect } from "chai";
import { TestScheduler } from "rxjs/testing";
import { EventStatus, EventWithStatus, withStatus } from "./index";
import { filter, map } from "rxjs/operators";
import { of } from "rxjs";

const comparator = (actual, expected) => {
  expect(actual).to.deep.equal(expected);
};

describe("withStatus function", () => {
  describe("when source$ emits a successful response", () => {
    const testScheduler = new TestScheduler(comparator);
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
        const result$ = withStatus(source$);

        // then
        expectObservable(result$).toBe(expectedEmission, {
          l: { status: EventStatus.LOADING },
          s: { status: EventStatus.SUCCESS, response: httpResponse },
        });
      }));
  });

  describe("when source$ emits an error", () => {
    const testScheduler = new TestScheduler(comparator);

    it("should emit an event with error status", () =>
      testScheduler.run(({ cold, expectObservable }) => {
        // given
        const errorMessage = "An unknown error has occurred.";
        const source$ = cold("--#", {}, errorMessage);
        const expectedEmission = "l-(e|)";

        // when
        const result$ = withStatus(source$);

        // then
        expectObservable(result$).toBe(expectedEmission, {
          l: { status: EventStatus.LOADING },
          e: { status: EventStatus.ERROR, error: errorMessage },
        });
      }));
  });

  describe("when explicit typing used", () => {
    const testScheduler = new TestScheduler(comparator);

    it("should not fail on types", () => {
      testScheduler.run(({ cold, expectObservable }) => {
        // given
        const source$ = cold<number>("--r|", { r: 1 });
        const expectedEmission = "--m|";

        // when
        const result$ = withStatus<number>(source$).pipe(
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
