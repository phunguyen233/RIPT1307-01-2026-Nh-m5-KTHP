import React from "react";

interface Slice {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  data: Slice[];
  size?: number;
  innerRadius?: number; // as fraction of radius (0..1)
}

const defaultColors = ["#16a34a", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"];

export default function PieChart({ data, size = 220, innerRadius = 0.6 }: Props) {
  const radius = size / 2;
  const strokeWidth = radius * (1 - innerRadius);
  const circumference = 2 * Math.PI * (radius - strokeWidth / 2);

  const total = data.reduce((s, d) => s + Math.max(0, d.value), 0);

  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`translate(${radius},${radius}) rotate(-90)`}>
          {data.map((d, idx) => {
            const value = Math.max(0, d.value);
            const portion = total === 0 ? 0 : value / total;
            const dash = portion * circumference;
            const dashArray = `${dash} ${circumference - dash}`;
            const stroke = d.color || defaultColors[idx % defaultColors.length];

            const circle = (
              <circle
                key={idx}
                r={radius - strokeWidth / 2}
                cx={0}
                cy={0}
                fill="transparent"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeDasharray={dashArray}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );

            offset += dash;
            return circle;
          })}
          {/* center mask to create donut */}
          <circle r={radius * innerRadius} cx={0} cy={0} fill="#ffffff" />
        </g>
      </svg>

      <div className="text-sm">
        {data.map((d, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <span style={{ width: 12, height: 12, background: d.color || defaultColors[idx % defaultColors.length] }} className="inline-block rounded-sm" />
            <div>
              <div className="font-medium text-gray-700">{d.label}</div>
              <div className="text-gray-500">{d.value.toLocaleString()} đ</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
