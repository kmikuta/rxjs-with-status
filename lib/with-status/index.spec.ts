import {expect} from 'chai';
import {TestScheduler} from 'rxjs/testing';
import {
  withStatus,
  idle,
  loading,
  failure,
  success,
  Status,
  Resource,
} from './';

function stripMethods(resource: unknown): unknown {
  return JSON.parse(JSON.stringify(resource));
}

describe('Resource utilities', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual.map(stripMethods)).to.deep.equal(
        expected.map(stripMethods)
      );
    });
  });

  it('should create a loading state with guards', () => {
    const resource = loading();

    expect(resource.status).to.equal(Status.Loading);
    expect(resource.hasValue()).to.equal(false);
    expect(resource.hasError()).to.equal(false);
    expect(resource.isLoading()).to.equal(true);
  });

  it('should create a failure state with guards', () => {
    const error = new Error('Test error');
    const resource = failure(error);

    expect(resource.status).to.equal(Status.Failure);
    expect(resource.error).to.equal(error);
    expect(resource.hasValue()).to.equal(false);
    expect(resource.hasError()).to.equal(true);
    expect(resource.isLoading()).to.equal(false);
  });

  it('should create a success state with guards', () => {
    const data = {message: 'Test success'};
    const resource = success(data);

    expect(resource.status).to.equal(Status.Success);
    expect(resource.data).to.equal(data);
    expect(resource.hasValue()).to.equal(true);
    expect(resource.hasError()).to.equal(false);
    expect(resource.isLoading()).to.equal(false);
  });

  it('should create an idle state without guards', () => {
    const resource = idle();

    expect(resource.status).to.equal(Status.Idle);
    expect((resource as Resource).hasValue).to.equal(undefined);
    expect((resource as Resource).hasError).to.equal(undefined);
    expect((resource as Resource).isLoading).to.equal(undefined);
  });

  it('should handle success and failure with withStatus operator', () => {
    testScheduler.run(({cold, expectObservable}) => {
      const mockData = {id: 1, name: 'Test'};
      const mockError = new Error('Failed to fetch');

      // Success case
      const success$ = cold('-s|', {s: mockData}).pipe(withStatus());
      const successExpected = 'ls|';
      const successValues = {
        l: loading(),
        s: success(mockData),
      };
      expectObservable(success$).toBe(successExpected, successValues);

      // Failure case
      const failure$ = cold('(-#)', {}, mockError).pipe(withStatus());
      const failureExpected = '(le|)';
      const failureValues = {
        l: loading(),
        e: failure(mockError),
      };
      expectObservable(failure$).toBe(
        failureExpected,
        failureValues,
        mockError
      );
    });
  });

  it('should emit loading state first with withStatus', () => {
    testScheduler.run(({cold, expectObservable}) => {
      const mockData = {id: 1, name: 'Test'};

      const source$ = cold('-s|', {s: mockData}).pipe(withStatus());
      const expected = 'ls|';
      const values = {
        l: loading(),
        s: success(mockData),
      };

      expectObservable(source$).toBe(expected, values);
    });
  });
});
