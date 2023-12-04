import { Expo, gsap } from "gsap";
import React, { useLayoutEffect, useRef } from "react";
import {
  HorizontalLine,
  StyledArticle,
  StyledContent,
  StyledFooter,
  StyledIcon,
  StyledLink,
  StyledSpan,
  VerticalLine,
} from "./OutlinedBox.components";

type LineBoxItemProps = {
  title?: string | React.ReactNode;
  buttonText?: string;
  buttonUrl?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  leftLineHidden?: boolean;
  rightLineHidden?: boolean;
  topLineHidden?: boolean;
  bottomLineHidden?: boolean;
};

export const OutlinedBox = ({
  title,
  children,
  buttonText,
  buttonUrl,
  icon,
  leftLineHidden,
  rightLineHidden,
  topLineHidden,
  bottomLineHidden,
}: LineBoxItemProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const topLineRef = useRef<HTMLDivElement>(null);
  const bottomLineRef = useRef<HTMLDivElement>(null);
  const leftLineRef = useRef<HTMLDivElement>(null);
  const rightLineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const animationProps: gsap.TweenVars = {
      duration: 2,
      ease: Expo.easeOut,
    };

    //Right line
    gsap.fromTo(
      rightLineRef.current,
      {
        transformOrigin: "top",
        scaleY: 0,
      },
      {
        scaleY: 1,
        ...animationProps,
      }
    );

    // Left line
    gsap.fromTo(
      leftLineRef.current,
      {
        transformOrigin: "bottom",
        scaleY: 0,
      },
      {
        scaleY: 1,
        ...animationProps,
      }
    );

    // Top line
    gsap.fromTo(
      topLineRef.current,
      {
        transformOrigin: "left",
        scaleX: 0,
      },
      {
        scaleX: 1,
        ...animationProps,
      }
    );

    // Bottom Line
    gsap.fromTo(
      bottomLineRef.current,
      {
        transformOrigin: "right",
        scaleX: 0,
      },
      {
        scaleX: 1,
        ...animationProps,
      }
    );
  }, []);

  return (
    <StyledArticle ref={containerRef} data-gsap="line-box-item">
      {children && <StyledContent>{children}</StyledContent>}

      <StyledFooter>
        <StyledSpan>{buttonText}</StyledSpan>
        <StyledIcon>{icon}</StyledIcon>
      </StyledFooter>

      {buttonUrl && (
        <StyledLink href={buttonUrl} target="_blank" rel="nofollow noreferrer">
          <StyledSpan>{title}</StyledSpan>
        </StyledLink>
      )}

      {/* Lines */}
      <HorizontalLine
        ref={topLineRef}
        isHidden={topLineHidden}
        position="top"
      />
      <HorizontalLine
        ref={bottomLineRef}
        isHidden={bottomLineHidden}
        position="bottom"
      />
      <VerticalLine
        ref={leftLineRef}
        isHidden={leftLineHidden}
        position="left"
      />
      <VerticalLine
        ref={rightLineRef}
        isHidden={rightLineHidden}
        position="right"
      />
    </StyledArticle>
  );
};

export default OutlinedBox;
