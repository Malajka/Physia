import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>>(
  (props, ref) => {
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
            background-color: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            border-radius: 50%;
            border: 2px solid #3b82f6;
            cursor: pointer;
          }
          
          .slider-thumb:hover {
            background-color: #f5f5f5;
          }
          
          .slider-thumb:focus {
            outline: none;
            box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.3);
          }
        `}
        </style>

        <SliderPrimitive.Root ref={ref} className="slider-root" {...props}>
          <SliderPrimitive.Track className="slider-track">
            <SliderPrimitive.Range className="slider-range" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb className="slider-thumb" />
        </SliderPrimitive.Root>
      </div>
    );
  }
);

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
