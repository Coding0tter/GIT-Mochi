import styles from "./skeleton.module.css";

interface SkeletonProps {
  width?: string;
  height?: string;
  radius?: string;
  class?: string;
}

const Skeleton = (props: SkeletonProps) => (
  <div
    class={`${styles.skeleton} ${props.class ?? ""}`}
    style={{
      width: props.width,
      height: props.height,
      "border-radius": props.radius ?? "6px",
    }}
  />
);

export default Skeleton;
