import { useEffect } from 'react';

export function useScrollReveal(): void {
    useEffect(() => {
        const revealElements =
            document.querySelectorAll<HTMLElement>('[data-reveal]');

        if (revealElements.length === 0) {
            return;
        }

        revealElements.forEach((element) => {
            element.classList.add(
                'opacity-0',
                'translate-y-6',
                'transition-all',
                'duration-700',
            );
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    const element = entry.target as HTMLElement;
                    element.classList.remove('opacity-0', 'translate-y-6');
                    element.classList.add('opacity-100', 'translate-y-0');
                    observer.unobserve(element);
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
        );

        revealElements.forEach((element) => {
            observer.observe(element);
        });

        return () => {
            observer.disconnect();
        };
    }, []);
}
