interface StairBlockVividPurpleProps {
  width?: number;
  height?: number;
  scale?: number;
}

const StairBlockVividPurple: React.FC<StairBlockVividPurpleProps> = ({
  width = 394,
  height = 472,
  scale = 1,
}) => {
  return (
    <svg
      width={width * scale}
      height={height * scale}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M394 0V157.333H315.2V78.6667L394 0Z" fill="#8C7AFF" />
      <path
        d="M236.4 314.667H157.6V236L236.4 157.333V314.667Z"
        fill="#8C7AFF"
      />
      <path
        d="M78.8 472H383.457H282.987H0V393.333L78.8 314.667V472Z"
        fill="#8C7AFF"
      />
      <path d="M394 0V472H78.8V314.667H236.4V157.333H394V0Z" fill="#F0F0FE" />
    </svg>
  );
};

export default StairBlockVividPurple;
