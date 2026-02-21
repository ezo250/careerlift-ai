/// <reference types="vite/client" />

// Allow importing image assets like PNG
declare module '*.png' {
  const src: string
  export default src
}

declare module '*.jpg' {
  const src: string
  export default src
}

declare module '*.jpeg' {
  const src: string
  export default src
}

declare module '*.svg' {
  const src: string
  export default src
}

// Ensure JSX runtime types are available for React 17+ JSX transform
// Vite + TS uses react-jsx which relies on react/jsx-runtime types from @types/react
// This reference helps TypeScript pick them up in monorepos or stricter setups
/// <reference types="react" />
