import styles from "./Card.module.css";

interface CardProps {
  children: any;
  class?: string;
  selectedBorderColor?: string;
  selected: () => boolean;
}

const Card = (props: CardProps) => {
  return (
    <div
      class={`${styles.card} ${props.class} ${
        props.selected() ? styles[props.selectedBorderColor || "blue"] : ""
      }`}
    >
      {props.children}
    </div>
  );
};

export default Card;
