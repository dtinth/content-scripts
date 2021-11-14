declare namespace TestingLibrary {
  export const DomTestingLibrary: typeof import('@testing-library/dom')
  export const userEvent: typeof import('@testing-library/user-event').default
}

export = TestingLibrary
