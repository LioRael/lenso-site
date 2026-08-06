import { Composition } from "remotion";
import {LensoLaunchVideo, LensoSocialCut} from "./LensoLaunchVideo";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        component={LensoLaunchVideo}
        durationInFrames={1260}
        fps={30}
        height={1080}
        id="LensoLaunch"
        width={1920}
      />
      <Composition
        component={LensoSocialCut}
        durationInFrames={450}
        fps={30}
        height={1080}
        id="LensoSocialCut"
        width={1920}
      />
    </>
  );
};
