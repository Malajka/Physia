import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>>(
  (props, ref) => {
    const getThumbColor = (value: number) => {
      if (value <= 3) return "#10b981";
      if (value <= 6) return "#fbbf24";
      return "#ef4444";
    };

    const currentValue = props.value?.[0] ?? 0;
    const thumbColor = getThumbColor(currentValue);

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    };

    const rgb = hexToRgb(thumbColor);
    const shadowColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : "rgba(0, 0, 0, 0.3)";
    const glowColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)` : "rgba(0, 0, 0, 0.5)";

    return (
      <div style={{ padding: "15px 0" }}>
        <style>
          {`
          .slider-root {
            position: relative;
            display: flex;
            align-items: center;
            user-select: none;
            touch-action: none;
            width: 100%;
            height: 20px;
          }
          
          .slider-track {
            background: linear-gradient(to right, #10b981, #fbbf24, #ef4444);
            position: relative;
            flex-grow: 1;
            height: 10px;
            border-radius: 9999px;
          }
          
          .slider-range {
            position: absolute;
            background-color: rgba(255, 255, 255, 0.3);
            height: 100%;
          }
          
          .slider-thumb {
            display: block;
            width: 28px;
            height: 28px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .slider-thumb:hover {
            filter: brightness(0.95);
          }
          
          .slider-thumb:focus {
            outline: none;
          }

          .slider-thumb-heartbeat {
            animation: steady-pulse 1s ease-in-out infinite;
          }

          @keyframes steady-pulse {
            0% {
              transform: scale(0.95);
              box-shadow: 0 2px 10px var(--thumb-color-shadow, rgba(0, 0, 0, 0.3));
            }
            50% {
              transform: scale(0.99);
              box-shadow: 0 0 20px var(--thumb-color-glow, rgba(0, 0, 0, 0.5));
            }
            100% {
              transform: scale(1);
              box-shadow: 0 2px 10px var(--thumb-color-shadow, rgba(0, 0, 0, 0.3));
            }
          }
        `}
        </style>

        <SliderPrimitive.Root ref={ref} className="slider-root" {...props}>
          <SliderPrimitive.Track className="slider-track">
            <SliderPrimitive.Range className="slider-range" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className="slider-thumb slider-thumb-heartbeat"
            style={
              {
                backgroundColor: thumbColor,
                border: `2px solid ${thumbColor}`,
                boxShadow: `0 0 0 5px ${thumbColor}33`,
                "--thumb-color-shadow": shadowColor,
                "--thumb-color-glow": glowColor,
              } as React.CSSProperties
            }
          />
        </SliderPrimitive.Root>
      </div>
    );
  }
);

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
