import gsap, { Expo, Quad } from "gsap";

export const iconsOnMouseMovement = (
  svgsContainer: HTMLElement
): (() => void) | void => {
  const svgs = svgsContainer.querySelectorAll("svg");

  const onMouseMove = (e: MouseEvent): void => {
    gsap.to(".circle", {
      x: `${-2 * (e.clientX / window.innerWidth - 0.5) * 30}`,
      y: `${-2 * (e.clientY / window.innerHeight - 0.5) * 30}`,
      duration: 7,
      ease: Expo.easeOut,
    });

    gsap.to(svgs, {
      x: `${-2 * (e.clientX / window.innerWidth - 0.5) * 20}`,
      y: `${-2 * (e.clientY / window.innerHeight - 0.5) * 20}`,
      duration: 7,
      ease: Quad.easeOut,
      stagger: 0.01,
    });
  };

  document.addEventListener("mousemove", onMouseMove);
  return () => {
    document.removeEventListener("mousemove", onMouseMove);
  };
};
