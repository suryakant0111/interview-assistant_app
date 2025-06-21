import React from "react";

export default function Spinner({ size = "20px", color = "#3B82F6" }) {
  return (
    <div
      className="animate-spin rounded-full border-[3px] border-solid border-gray-300"
      style={{
        width: size,
        height: size,
        borderTopColor: color,
        borderRightColor: "transparent",
        borderBottomColor: "transparent",
        borderLeftColor: "transparent",
      }}
    />
  );
}
