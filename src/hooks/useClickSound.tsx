import useSound from "use-sound";
import clickSound from "../assets/mouse-click-290204.mp3";
import React from "react";

export default function useClickSound() {
  const [play] = useSound(clickSound, { volume: 0.8 });

  React.useEffect(() => {
    const handler = () => play();

    // Play sound on every click
    window.addEventListener("click", handler);

    return () => {
      window.removeEventListener("click", handler);
    };
  }, [play]);

  return null;
}
