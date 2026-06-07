import LottieModule from 'lottie-react';

/** lottie-react can expose a nested default under Vite — resolve to the actual component */
export const Lottie = LottieModule?.default?.default ?? LottieModule?.default ?? LottieModule;
