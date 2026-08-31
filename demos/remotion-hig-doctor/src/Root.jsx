import {Composition} from "remotion";
import {HigDoctorShowcase} from "./HigDoctorShowcase";
import {SocialPromo} from "./SocialPromo";

export const RemotionRoot = () => {
  return (
    <>
    <Composition
      id="HigDoctorShowcase"
      component={HigDoctorShowcase}
      durationInFrames={632}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="HigDoctorLinkedIn"
      component={SocialPromo}
      defaultProps={{platform: "linkedin"}}
      durationInFrames={540}
      fps={30}
      width={1080}
      height={1350}
    />
    <Composition
      id="HigDoctorX"
      component={SocialPromo}
      defaultProps={{platform: "x"}}
      durationInFrames={540}
      fps={30}
      width={1080}
      height={1080}
    />
    </>
  );
};
