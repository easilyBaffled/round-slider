import { number, string, object } from "prop-types";
import React from "react";

const DoughnutSegment = ({
  className,
  value,
  baseCircleProps,
  stroke = "#ce4b99",
  strokeDashoffset
}) => (
  <circle
    className={className}
    fill="transparent"
    {...baseCircleProps}
    stroke={stroke}
    strokeDasharray={`${value} ${100 - value}`}
    strokeDashoffset={strokeDashoffset}
  />
);

DoughnutSegment.propTypes = {
  value: number.isRequired,
  baseCircleProps: object.isRequired,
  stroke: string,
  strokeDashoffset: number
};

export default DoughnutSegment;
