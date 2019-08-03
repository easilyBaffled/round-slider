import { any, arrayOf, oneOfType, number, exact, string } from "prop-types";
import React from "react";

import Segment from "./DoughnutSegment";
console.tap = (v, l = "") => (console.log(l, v), v);

/**
 * A shortcut for displaying values in an error message.
 * @type {((value: any, replacer?: (key: string, value: any) => any, space?: (string | number)) => string) | ((value: any, replacer?: ((number | string)[] | null), space?: (string | number)) => string)}
 */
const toString = JSON.stringify;

// initialOffset will rotate the segments from 3 O'clock - where segments normally start - to 12 O'clock at the top of the circle.
// in the case where the circle's circomference is 100
/**
 * A circle's stroke By default starts at 3 O'clock. This function provides the stroke-dashoffset needed to rotate the segment to it's proper position.
 * It takes the initial starting position and all previous segments into account as well.
 * @param {number} precedingTotalSegmentLength
 * @param {number} initialOffset
 * @returns {number}
 */
const calculateSegmentOffset = (
  precedingTotalSegmentLength = 0,
  initialOffset
) => -initialOffset + precedingTotalSegmentLength;

/**
 * Provides a scaled down value to fit in a given space other than the full circle.
 * @param {number} value
 * @param {number} adjustment
 * @returns {number}
 */
const scaleSegmentPosition = (value, adjustment = 1) => value * adjustment;

/**
 * These values need to be shared so that other components can be used in the same coordinate system without having to guess.
 * strokeWidth and padding are the only values that are not locked in.
 * @param {number} strokeWidth
 * @param {number} padding
 * @returns {{strokeWidth: number, padding: number, viewBox: string, bottom: number, center: number, radius: number}}
 */
export const calculateDisplaySpacing = (strokeWidth = 3, padding = 2) => {
  const radius = 100 / (2 * Math.PI), // Using 100 means all segment length calculations can be made relative to 100%
    center = radius + strokeWidth + padding,
    viewBox = `0 0 ${2 * center} ${2 * center}`;

  return { radius, center, bottom: 2 * center, padding, viewBox, strokeWidth };
};

export const Doughnut = ({
  value,
  values,
  strokeWidth = 3,
  padding = 2,
  initialOffset = 0,
  segmentScaling = 1,
  pathColor = "#03bbe8",
  trackClassname,
  segmentClassname
}) => {
  if (value && values) {
    throw new TypeError(
      `Doughnut can only take value( ${toString(value)} ) or values( ${toString(
        values
      )} ), not both.`
    );
  }

  if (value) values = [value];

  if (values.reduce((total, v) => total + (v.value || v)) > 100) {
    throw new TypeError(
      `Doughnut values( ${toString(values)} ) cannot add up to more than 100.`
    );
  }

  const { radius, center } = calculateDisplaySpacing(strokeWidth, padding);

  const baseCircleProps = { cx: center, cy: center, r: radius, strokeWidth };

  return (
    <React.Fragment>
      <Segment
        baseCircleProps={{
          ...baseCircleProps,
          strokeWidth: 1 / strokeWidth
        }}
        className={trackClassname}
        stroke={pathColor}
        strokeDashoffset={calculateSegmentOffset(
          100 * segmentScaling,
          initialOffset
        )}
        value={scaleSegmentPosition(100, segmentScaling)}
      />
      {
        values.reduce(
          ({ totalLength, segments }, v, i) => {
            const segmentLength = scaleSegmentPosition(
              v.value || v,
              segmentScaling
            );

            return {
              totalLength: totalLength + segmentLength,
              segments: segments.concat(
                <Segment
                  key={i}
                  baseCircleProps={baseCircleProps}
                  className={segmentClassname}
                  stroke={v.color}
                  strokeDashoffset={calculateSegmentOffset(
                    totalLength + segmentLength,
                    initialOffset
                  )}
                  value={segmentLength}
                />
              )
            };
          },
          { totalLength: 0, segments: [] }
        ).segments
      }
    </React.Fragment>
  );
};

const segmentValueProptype = oneOfType([
  number.isRequired,
  exact({ value: number, color: string })
]);

Doughnut.propTypes = {
  value: segmentValueProptype,
  values: arrayOf(segmentValueProptype),
  strokeWidth: number,
  padding: number,
  initialOffset: number,
  segmentScaling: number,
  pathColor: string
};

const DoughnutChart = ({
  height,
  width,
  className,
  children,
  style,
  svgRef,
  ...chartProps
}) => {
  const { viewBox } = calculateDisplaySpacing(
    chartProps.strokeWidth,
    chartProps.padding
  );
  return (
    <svg
      ref={svgRef}
      className={className}
      height={width}
      viewBox={viewBox}
      width={height}
      style={style}
    >
      <Doughnut {...chartProps} />
      {children}
    </svg>
  );
};

DoughnutChart.propTypes = {
  height: oneOfType([number, string]),
  width: oneOfType([number, string]),
  className: string,
  children: any,
  ...Doughnut.propTypes
};

export default DoughnutChart;
export const DoughnutSegment = Segment;
