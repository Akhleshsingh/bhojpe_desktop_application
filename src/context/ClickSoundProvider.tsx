// ClickSoundProvider.tsx
import useSound from "use-sound";
import clickSound from "../assets/mouse-click-290204.mp3";
import { useEffect } from "react";

export default function ClickSoundProvider() {
  const [play] = useSound(clickSound, { volume: 0.8 });

  // useEffect(() => {
  //   const handler = () => {
  //     play();
  //   };

  //   window.addEventListener("click", handler);

  //   return () => {
  //     window.removeEventListener("click", handler);
  //   };
  // }, [play]);

  return null;
}
