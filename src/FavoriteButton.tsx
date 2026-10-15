import { IconButton } from './IconButton';
import { useEffect, useRef } from 'react';
import { Star, StarFilled } from './icons';
import './favorite-button.css';

export function FavoriteButton({ favorite, onChange }: { favorite: boolean; onChange: (favorite: boolean) => void }) {
  const button = useRef<HTMLButtonElement>(null);
  const timer = useRef(0);

  function stopBurst() {
    window.clearTimeout(timer.current);
    button.current?.classList.remove('is-bursting');
  }

  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => { if (motion.matches) stopBurst(); };
    motion.addEventListener('change', onMotion);
    return () => { stopBurst(); motion.removeEventListener('change', onMotion); };
  }, []);

  function toggle() {
    stopBurst();
    if (!favorite && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const element = button.current!;
      const styles = getComputedStyle(element);
      const distance = parseFloat(styles.getPropertyValue('--like-particle-dist')) || 20;
      const duration = styles.getPropertyValue('--like-particle-dur').trim();
      const milliseconds = parseFloat(duration) * (duration.endsWith('ms') ? 1 : 1000) || 600;
      let end = 0;
      element.querySelectorAll<HTMLElement>('.t-like-particles i').forEach((dot, index) => {
        const angle = (index / 8) * Math.PI * 2 + (Math.random() - .5) * .35;
        const travel = distance * (.8 + Math.random() * .4);
        const lifetime = milliseconds * (.8 + Math.random() * .2);
        const delay = Math.random() * 40;
        dot.style.setProperty('--px', `${Math.cos(angle) * travel}px`);
        dot.style.setProperty('--py', `${Math.sin(angle) * travel}px`);
        dot.style.setProperty('--pdur', `${lifetime}ms`);
        dot.style.setProperty('--pdelay', `${delay}ms`);
        dot.style.setProperty('--p-end-scale', `${.4 + Math.random() * .3}`);
        dot.style.setProperty('--psize', `${.8 + Math.random() * .4}`);
        end = Math.max(end, lifetime + delay);
      });
      void element.offsetWidth;
      element.classList.add('is-bursting');
      timer.current = window.setTimeout(stopBurst, end);
    }
    onChange(!favorite);
  }

  return <IconButton ref={button} className="icon-button t-like favorite-button" data-liked={favorite}
    aria-pressed={favorite} aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} onClick={toggle}>
    <span className="t-like-icon" aria-hidden="true">
      <Star size={18} className="favorite-outline" />
      <StarFilled size={18} className="favorite-filled" />
    </span>
    <span className="t-like-particles" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</span>
  </IconButton>;
}
