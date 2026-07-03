import { Composition } from "remotion";
import { LensoLaunchVideo } from "./LensoLaunchVideo";

export const RemotionRoot = () => {
  return (
    <Composition
      component={LensoLaunchVideo}
      durationInFrames={1800}
      fps={30}
      height={1080}
      id="LensoLaunch"
      width={1920}
    />
  );
};
