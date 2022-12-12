import { FC } from 'react';
import { Hexagon, Text } from 'react-hexgrid';
import './App.css';

interface Props {
  letter: string;
  primary?: boolean;
  q: number,
  r: number,
  s: number,
}

const Hex: FC<Props> = ({ letter, primary, q, r, s }) => {
  return (
    <Hexagon q={q} r={r} s={s} className={primary ? "primary" : ""}>
        <Text>{letter.toUpperCase()}</Text>
    </Hexagon>
  );
};

export default Hex;