type CircularProgressProps = {
  color: string;
  width: number;
  height: number;
  progress: number; // Progress value between 0 and 1
  children?: React.ReactNode;
};

export function CircularProgress({
  color,
  width,
  height,
  progress,
  children,
}: CircularProgressProps) {
  const strokeDashoffset = 251.2 * (1 - progress / 100); // 251.2 is the total circumference of the circle (2 * Math.PI * 40)

  return (
    <div className="flex items-center justify-center h-full">
      <div
        className="relative"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <svg
          className="absolute top-0 left-0 w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke="#F0F0FE"
            strokeWidth="12"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="transparent"
            stroke={color}
            strokeWidth="12"
            strokeDasharray="251.2"
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        {children}
      </div>
    </div>
  );
}
