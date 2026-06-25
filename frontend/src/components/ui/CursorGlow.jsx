'use client';
import { useEffect, useRef } from 'react';
import styles from './CursorGlow.module.css';

export default function CursorGlow() {
  const cursorRef = useRef(null);
  const followerRef = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate(${mouseX - 6}px, ${mouseY - 6}px)`;
    };

    let raf;
    const animate = () => {
      followerX += (mouseX - followerX) * 0.1;
      followerY += (mouseY - followerY) * 0.1;
      follower.style.transform = `translate(${followerX - 20}px, ${followerY - 20}px)`;
      raf = requestAnimationFrame(animate);
    };

    const onMouseEnterLink = () => {
      cursor.classList.add(styles.hovered);
      follower.classList.add(styles.hovered);
    };
    const onMouseLeaveLink = () => {
      cursor.classList.remove(styles.hovered);
      follower.classList.remove(styles.hovered);
    };

    document.addEventListener('mousemove', onMouseMove);
    raf = requestAnimationFrame(animate);

    // Attach to all interactive elements
    const addListeners = () => {
      document.querySelectorAll('a, button, [data-cursor]').forEach((el) => {
        el.addEventListener('mouseenter', onMouseEnterLink);
        el.addEventListener('mouseleave', onMouseLeaveLink);
      });
    };
    addListeners();
    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className={styles.cursor} />
      <div ref={followerRef} className={styles.follower} />
    </>
  );
}
