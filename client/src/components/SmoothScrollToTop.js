import { useEffect } from 'react';

export const useSmoothScrollToTop = () => {
  useEffect(() => {
    const duration = 500;
    const start = window.pageYOffset;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, start * (1 - easeInOutCubic(progress)));
      if (progress < 1) {
        window.requestAnimationFrame(animateScroll);
      }
    };

    const easeInOutCubic = (t) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    window.requestAnimationFrame(animateScroll);
  }, []);
};

// Keep the component version too if needed
export const SmoothScrollToTop = () => {
  useSmoothScrollToTop();
  return null;
};