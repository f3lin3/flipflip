import {BT, HTF, IF, SL, TF, TOT, VTF, WF} from './const';
import LibrarySource from "../components/library/LibrarySource";
import Audio from "../components/library/Audio";
import Overlay from "../components/library/Overlay";

export default class Scene {
  id: number = 0;
  name: string = "Unnamed scene";
  sources: Array<LibrarySource> = [];
  timingFunction = TF.constant;
  timingConstant = 1000;
  timingMin = 200;
  timingMax = 1200;
  timingSinRate = 100;
  weightFunction = WF.sources;
  randomize = true;
  forceAll = false;
  imageTypeFilter = IF.any;
  zoom = false;
  zoomStart = 1;
  zoomEnd = 2;
  horizTransType = HTF.none;
  horizTransLevel = 10;
  vertTransType = VTF.none;
  vertTransLevel = 10;
  transTF = TF.constant;
  transDuration = 5000;
  transDurationMin = 1000;
  transDurationMax = 7000;
  transSinRate = 100;
  crossFade = false;
  fadeTF = TF.constant;
  fadeDuration = 500;
  fadeDurationMin = 100;
  fadeDurationMax = 700;
  fadeSinRate = 100;
  backgroundType = BT.blur;
  backgroundColor = "#000000";
  backgroundBlur = 8;
  strobe = false;
  strobePulse = false;
  strobeLayer = SL.top;
  strobeOpacity = 1;
  strobeTF = TF.constant;
  strobeTime = 200;
  strobeTimeMin = 100;
  strobeTimeMax = 300;
  strobeSinRate = 100;
  strobeDelayTF = TF.constant;
  strobeDelay = 200;
  strobeDelayMin = 100;
  strobeDelayMax = 300;
  strobeDelaySinRate = 100;
  strobeColor = "#FFFFFF";
  playFullGif = false;
  playFullVideo = false;
  randomVideoStart = false;
  continueVideo = false;
  textKind: string = "";
  textSource: string = "";
  blinkColor = "#FFFFFF";
  blinkFontSize = 20;
  blinkFontFamily = "Arial Black,Arial Bold,Gadget,sans-serif";
  captionColor = "#FFFFFF";
  captionFontSize = 8;
  captionFontFamily = "Helvetica Neue,Helvetica,Arial,sans-serif";
  captionBigColor = "#FFFFFF";
  captionBigFontSize = 12;
  captionBigFontFamily = "Arial Black,Arial Bold,Gadget,sans-serif";
  countColor = "#FFFFFF";
  countFontSize = 20;
  countFontFamily = "Arial Black,Arial Bold,Gadget,sans-serif";
  generatorMax = 100;
  overlays: Array<Overlay> = [];
  nextSceneID: number = 0;
  nextSceneTime: number = 900;
  libraryID: number = -1;
  displayedLibrary: Array<LibrarySource> = null;
  videoVolume = 0;
  audios: Array<Audio> = [];
  tagWeights?: string;
  sceneWeights?: string;

  // unused; migration only
  effectLevel = 0;
  audioURL?: string = "";
  overlaySceneID: number = 0;
  overlaySceneOpacity: number = 0.5;
  transFull = false;
  fadeFull = false;

  constructor(init?: Partial<Scene>) {
    Object.assign(this, init);
    this.sources = this.sources.filter((d) => !!d);

    if (!this.transDuration && this.effectLevel != 0) {
      this.transDuration = this.effectLevel * 1000;
      this.effectLevel = 0;
    }
    if (this.overlaySceneID != 0) {
      this.overlays.push(new Overlay({sceneID: this.overlaySceneID, opacity: this.overlaySceneOpacity * 100}));
      this.overlaySceneID = 0;
    }

    if (this.audioURL && this.audioURL != "") {
      this.audios.push(new Audio({url: this.audioURL}));
      this.audioURL = "";
    }

    if (typeof this.timingConstant == "string") {
      this.timingConstant = parseInt(this.timingConstant, 10);
    }

    if (this.timingFunction == 'tf.variableFaster') {
      this.timingFunction = TF.sin;
      this.timingMin = 0;
      this.timingMax = 600;
    } else if (this.timingFunction == 'tf.variableMedium') {
      this.timingFunction = TF.sin;
      this.timingMin = 3000;
      this.timingMax = 5000;
    } else if (this.timingFunction == 'tf.variableSlow') {
      this.timingFunction = TF.sin;
      this.timingMin = 3500;
      this.timingMax = 6500;
    } else if (this.timingFunction == 'tf.variableSlower') {
      this.timingFunction = TF.sin;
      this.timingMin = 10000;
      this.timingMax = 20000;
    } else if (this.timingFunction == 'tf.variableSlowest') {
      this.timingFunction = TF.sin;
      this.timingMin = 30000;
      this.timingMax = 60000;
    } else if (this.timingFunction == "at.random") {
      this.timingFunction = "tf.random"
    } else if (this.timingFunction == "at.sin") {
      this.timingFunction = "tf.sin"
    }

    if (this.transFull) {
      this.transTF = TF.scene;
      this.transFull = false;
    }

    if (this.fadeFull) {
      this.fadeTF = TF.scene;
      this.fadeFull = false;
    }

    if (!(this.textKind && this.textKind.length)) {
      this.textKind = TOT.url;
    }
  }
}
