# rxjs-with-status

Utility for creating RxJS observables with status

# Usage

```typescript
import { ajax } from "rxjs/ajax";
import { EventWithStatus, withStatus } from "rxjs-with-status";

const API_URL = "...";
const source$ = ajax.get(API_URL);

withStatus(source$).subscribe((event) => {
  if (event.status === EventStatus.LOADING) {
    showLoadingSpinner();
    return;
  }

  hideLoadingSpinner();

  if (event.status === EventStatus.Success) {
    renderData(event.response);
    return;
  }

  renderError(event.error);
});
```

# Development

## Node & NPM

- node 18+
- npm 9+

## Commands

- `npm run build` - builds the bundle
- `npm test` - runs unit tests
- `npm format` - runs formater
