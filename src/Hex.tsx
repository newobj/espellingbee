import { FC } from 'react';
import { Hexagon, Text } from 'react-hexgrid';
import { HexagonMouseEventHandler } from 'react-hexgrid/lib/Hexagon/Hexagon';
import './App.css';

interface Props {
  letter: string;
  primary?: boolean;
  q: number,
  r: number,
  s: number,
  onClick?: HexagonMouseEventHandler<SVGGElement>
}

const Hex: FC<Props> = ({ letter, primary, onClick, q, r, s }) => {
  return (
    <Hexagon q={q} r={r} s={s} onClick={onClick} className={primary ? "primary" : ""}>
        <Text>{letter.toUpperCase()}</Text>
    </Hexagon>
  );
};

export default Hex;