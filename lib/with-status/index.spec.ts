import { expect } from "chai";
import { TestScheduler } from "rxjs/testing";
import { EventStatus, withStatus } from "./index";

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
});
