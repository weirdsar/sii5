/**
 * Появление секций с [data-reveal] через IntersectionObserver.
 * Раньше был inline в BaseLayout; вынесено для читаемости без лишнего HTTP (бандлится с layout).
 */
export function initRevealAnimations(): void {
  const hidden = ['opacity-0', 'translate-y-4'];
  const shown = ['opacity-100', 'translate-y-0'];
  const revealElements = document.querySelectorAll('[data-reveal]');

  if (!revealElements.length) return;

  revealElements.forEach((el) => {
    el.classList.add(...hidden);
    el.classList.add('transition-all', 'duration-500', 'ease-out');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const delay = el.getAttribute('data-reveal-delay') || '0';
        el.style.transitionDelay = `${delay}ms`;
        hidden.forEach((c) => el.classList.remove(c));
        shown.forEach((c) => el.classList.add(c));
        observer.unobserve(el);
      });
    },
    {
      threshold: window.innerWidth < 768 ? 0.05 : 0.15,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}
