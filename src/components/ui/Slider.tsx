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
        `}
        </style>

        <SliderPrimitive.Root ref={ref} className="slider-root" {...props}>
          <SliderPrimitive.Track className="slider-track">
            <SliderPrimitive.Range className="slider-range" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className="slider-thumb"
            style={{
              backgroundColor: thumbColor,
              border: `2px solid ${thumbColor}`,
              boxShadow: `0 0 0 5px ${thumbColor}33`,
            }}
          />
        </SliderPrimitive.Root>
      </div>
    );
  }
);

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
