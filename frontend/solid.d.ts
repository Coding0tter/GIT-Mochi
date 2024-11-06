// solid.d.ts
import "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      dndzone: any;
    }
  }
}
