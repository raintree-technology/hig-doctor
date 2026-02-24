import {Composition} from "remotion";
import {HigDoctorShowcase} from "./HigDoctorShowcase";

export const RemotionRoot = () => {
  return (
    <Composition
      id="HigDoctorShowcase"
      component={HigDoctorShowcase}
      durationInFrames={632}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
