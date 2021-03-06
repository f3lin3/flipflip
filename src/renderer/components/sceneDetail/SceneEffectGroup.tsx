import * as React from 'react';

import {SceneSettings} from "../../data/Config";
import ControlGroup from "./ControlGroup";
import Scene from "../../data/Scene";
import SimpleOptionPicker from "../ui/SimpleOptionPicker";
import SimpleSliderInput from "../ui/SimpleSliderInput";
import SimpleNumberInput from "../ui/SimpleNumberInput";
import {TF} from "../../data/const";
import Overlay from "../library/Overlay";

export default class SceneEffectGroup extends React.Component {
  readonly props: {
    scene: Scene | SceneSettings,
    showAll: boolean
    allScenes: Array<Scene>,
    onUpdateScene(scene: Scene | SceneSettings, fn: (scene: Scene | SceneSettings) => void): void,
  };

  render() {
    return (
      <ControlGroup title="Scene Effects" isNarrow={true}>
        <div className="ControlSubgroup m-inline">
          <div style={{display: 'flex'}}>
            <SimpleOptionPicker
              onChange={this.changeKey.bind(this, 'timingFunction').bind(this)}
              label="Timing"
              value={this.props.scene.timingFunction}
              keys={[TF.constant, TF.random, TF.sin]}/>
            {this.props.scene.timingFunction == TF.sin && (
              <div>
                <SimpleSliderInput
                  label={`Wave Rate: ${this.props.scene.timingSinRate}`}
                  min={1}
                  max={100}
                  value={this.props.scene.timingSinRate}
                  isEnabled={true}
                  onChange={this.changeKey.bind(this, 'timingSinRate').bind(this)}/>
              </div>
            )}
          </div>
          <div className="TimingControlGroup">
            {this.props.scene.timingFunction == TF.constant && (
              <div>
                Every
                <SimpleNumberInput
                  label=""
                  value={this.props.scene.timingConstant}
                  isEnabled={true}
                  min={0}
                  onChange={this.changeKey.bind(this, 'timingConstant').bind(this)}/>
                ms
              </div>
            )}
            {(this.props.scene.timingFunction == TF.random || this.props.scene.timingFunction == TF.sin) && (
              <div>
                Between
                <SimpleNumberInput
                  label=""
                  value={this.props.scene.timingMin}
                  isEnabled={true}
                  min={0}
                  onChange={this.changeKey.bind(this, 'timingMin').bind(this)}/>
                ms and
                <SimpleNumberInput
                  label=""
                  value={this.props.scene.timingMax}
                  isEnabled={true}
                  min={0}
                  onChange={this.changeKey.bind(this, 'timingMax').bind(this)}/>
                ms
              </div>
            )}
          </div>
        </div>

        {this.props.showAll && (
          <React.Fragment>
            <hr/>

            <div className="ControlSubgroup  m-inline">
              <SimpleOptionPicker
                onChange={this.changeKey.bind(this, 'nextSceneID').bind(this)}
                label="Next Scene"
                value={this.props.scene.nextSceneID.toString()}
                parseKeyFunction={this.getSceneName.bind(this)}
                keys={["0"].concat(this.props.allScenes.filter((s) => s.id !== this.props.scene.id && s.sources.length > 0).map((s) => s.id.toString()))}/>
              {this.props.scene.nextSceneID != 0 && (
                <SimpleNumberInput
                  label="Time before playing next scene (sec)"
                  min={1}
                  value={this.props.scene.nextSceneTime}
                  isEnabled={this.props.scene.nextSceneID != 0}
                  onChange={this.changeKey.bind(this, 'nextSceneTime').bind(this)}/>
              )}
            </div>

            <hr/>

            <div className="ControlSubgroup m-inline">
              <div className="u-small-icon-button u-clickable"
                   style={{float: 'left', marginRight: '5px', marginBottom: '7px'}}
                   onClick={this.onAddOverlay.bind(this)}
                   title="Add Overlay">
                <div className="u-add"/>
              </div>
              <div className="u-clickable"
                   style={{color: '#010101', float: 'left'}}
                   onClick={this.onAddOverlay.bind(this)}>
                Add a new overlay
              </div>
              <div style={{clear: 'both'}}>
                {this.props.scene.overlays.map((overlay, index) =>
                  <React.Fragment key={overlay.id}>
                    <div className="u-small-icon-button u-clickable"
                         style={{float: 'right'}}
                         onClick={this.onRemoveOverlay.bind(this, overlay.id)}
                         title="Remove Audio">
                      <div className="u-delete"/>
                    </div>
                    <SimpleOptionPicker
                      onChange={this.onEditKey.bind(this, overlay.id, 'sceneID').bind(this)}
                      label="Overlay scene"
                      value={overlay.sceneID.toString()}
                      parseKeyFunction={this.getSceneName.bind(this)}
                      keys={["0"].concat(this.props.allScenes.filter((s) => s.sources.length > 0).map((s) => s.id.toString()))}/>
                    {overlay.sceneID != 0 && (
                      <SimpleSliderInput
                        isEnabled={overlay.sceneID != 0}
                        onChange={this.onEditKey.bind(this, overlay.id, 'opacity').bind(this)}
                        label={"Overlay opacity: " + overlay.opacity + "%"}
                        min={0}
                        max={99}
                        value={(overlay.opacity)}/>
                    )}
                    {index != this.props.scene.overlays.length - 1 && (
                      <hr/>
                    )}
                  </React.Fragment>
                )}
              </div>
            </div>
          </React.Fragment>
        )}
      </ControlGroup>
    );
  }

  getSceneName(id: string): string {
    if (id === "0") return "None";
    return this.props.allScenes.filter((s) => s.id.toString() === id)[0].name;
  }

  onEditKey(id: number, key: string, value: string) {
    const newOverlays = Array.from(this.props.scene.overlays);
    const overlay: any = newOverlays.find((o) => o.id == id);
    if (["sceneID", "opacity"].includes(key)) {
      overlay[key] = parseInt(value, 10);
    } else {
      overlay[key] = value;
    }
    this.update((s) => {s.overlays = newOverlays});
  }

  onAddOverlay() {
    let id = this.props.scene.overlays.length + 1;
    this.props.scene.overlays.forEach((o) => {
      id = Math.max(o.id + 1, id);
    });
    const newOverlays = this.props.scene.overlays.concat([new Overlay({id: id})]);
    this.update((s) => {s.overlays = newOverlays});
  }

  onRemoveOverlay(id: number) {
    const newOverlays = Array.from(this.props.scene.overlays);
    newOverlays.splice(newOverlays.map((o) => o.id).indexOf(id), 1);
    this.update((s) => {s.overlays = newOverlays});
  }

  update(fn: (scene: any) => void) {
    this.props.onUpdateScene(this.props.scene, fn);
  }

  changeKey(key: string, value: any) {
    if (["timingConstant", "timingMin", "timingMax", "timingSinRate", "nextSceneTime"].includes(key)) {
      this.update((s) => s[key] = parseInt(value, 10));
    } else {
      this.update((s) => s[key] = value);
    }
  }
}
