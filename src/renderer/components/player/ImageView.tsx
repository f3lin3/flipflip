import * as React from 'react';
import {animated, useSpring, useTransition} from "react-spring";
import Timeout = NodeJS.Timeout;

import {BT} from "../../data/const";

export const FadeLayer = (data: {image: any, contentRef: any, backgroundRef: any, backgroundType: string,
  backgroundColor: string, backgroundBlur: number, horizTransLevel: number, vertTransLevel: number,
  zoomStart: number, zoomEnd: number, transDuration: number, fadeDuration: any, crossFade: boolean}) => {

  const fadeTransitions: [{item: any, props: any, key: any}] = useTransition(
    data.image,
    (image: any) => {
      return image.key
    },
    {
      initial: { // Initial (first time) base values, optional (can be null)
        opacity: 1,
      },
      from: { // Base values, optional
        opacity: data.crossFade ? 0 : 1,
      },
      enter: { // Styles apply for entering elements
        opacity: 1,
      },
      leave: { // Styles apply for leaving elements
        opacity: data.crossFade ? 0.99 : 1,
      },
      unique: true, // If this is true, items going in and out with the same key will be re-used
      config: {
        duration: parseInt(data.fadeDuration, 10),
      },
    }
  );

  return (
    <React.Fragment>
      {fadeTransitions.map(({item, props, key}) => {
        return (
          <animated.div className="ImageView u-fill-container" key={key} style={{ ...props }}>
            <ZoomMoveLayer
              contentRef={data.contentRef}
              horizTransLevel={data.horizTransLevel}
              vertTransLevel={data.vertTransLevel}
              zoomStart={data.zoomStart}
              zoomEnd={data.zoomEnd}
              duration={data.transDuration} />
            <Image
              className="ImageView__Background"
              contentRef={data.backgroundRef}
              backgroundType={data.backgroundType}
              backgroundColor={data.backgroundColor}
              backgroundBlur={data.backgroundBlur}
              imageProps={null} />
          </animated.div>
        );
      })}
    </React.Fragment>
  );
};

const ZoomMoveLayer = (data: {contentRef: any, horizTransLevel: number, vertTransLevel: number,
  zoomStart: number, zoomEnd: number, duration: any }) => {
  const imageProps = useSpring(
    {
      from: {
        transform: 'translate(0%, 0%) scale(' + data.zoomStart + ')',
      },
      to: {
        transform: 'translate(' + data.horizTransLevel + '%, ' + data.vertTransLevel + '%) scale(' + data.zoomEnd + ')',
      },
      config: {
        duration: parseInt(data.duration, 10),
      },
    }
  );

  return (
    <Image
      className="ImageView__Image"
      contentRef={data.contentRef}
      backgroundType={null}
      backgroundColor={null}
      backgroundBlur={null}
      imageProps={imageProps} />
  );
};

const Image = (data: {className: string, contentRef: any, backgroundType: string, backgroundColor: string, backgroundBlur: number, imageProps: any }) => {
  let backgroundStyle = {};
  if (data.imageProps == null) {
    if (data.backgroundType == BT.color) {
      backgroundStyle = {
        backgroundColor: data.backgroundColor,
      };
    } else if (data.backgroundType == BT.blur) {
      backgroundStyle = {
        filter: 'blur(' + data.backgroundBlur + 'px)',
      };
    }
  }

  return (
    <animated.div
      ref={data.contentRef}
      className={data.className}
      style={{...data.imageProps, ...backgroundStyle}} />
  );
};

export default class ImageView extends React.Component {
  readonly props: {
    image: HTMLImageElement | HTMLVideoElement,
    backgroundType: string,
    backgroundColor: string,
    backgroundBlur: number,
    horizTransLevel: number,
    vertTransLevel: number,
    zoomStart: number,
    zoomEnd: number,
    transDuration: number,
    crossFade: boolean,
    fadeDuration: number,
    videoVolume: number,
    onLoaded(): void,
    setVideo(video: HTMLVideoElement): void,
  };

  readonly backgroundRef: React.RefObject<any> = React.createRef();
  readonly contentRef: React.RefObject<any> = React.createRef();
  _timeout: Timeout = null;

  componentDidMount() {
    this._applyImage();
  }

  componentDidUpdate() {
    this._applyImage();
  }

  componentWillUnmount() {
    clearTimeout(this._timeout);
    this._timeout = null;
  }

  _applyImage() {
    const el = this.contentRef.current;
    const bg = this.backgroundRef.current;
    const img = this.props.image;
    if (!el || !img) return;

    const firstChild = el.firstChild;
    if (firstChild instanceof HTMLImageElement || firstChild instanceof HTMLVideoElement) {
      if (firstChild.src === img.src) return;
    }

    if (img instanceof HTMLVideoElement) {
      img.volume = this.props.videoVolume / 100;
      img.play();
    }

    let parentWidth = el.offsetWidth;
    let parentHeight = el.offsetHeight;
    if (parentWidth == 0 || parentHeight == 0) {
      parentWidth = window.innerWidth;
      parentHeight = window.innerHeight;
    }
    const parentAspect = parentWidth / parentHeight;
    let imgWidth;
    if (img instanceof HTMLImageElement) {
      imgWidth = img.width;
    } else {
      imgWidth = img.videoWidth;
    }
    let imgHeight;
    if (img instanceof HTMLImageElement) {
      imgHeight = img.height;
    } else {
      imgHeight = img.videoHeight;
    }
    const imgAspect = imgWidth / imgHeight;

    const blur = this.props.backgroundType == BT.blur;
    let bgImg: any;
    if (blur) {
      if (img.src.endsWith(".gif")) {
        bgImg = img.cloneNode();
      } else {
        bgImg = document.createElement('canvas');

        const context = bgImg.getContext('2d');
        bgImg.width = parentWidth;
        bgImg.height = parentHeight;

        const draw = (v: any, c: CanvasRenderingContext2D, w: number, h: number) => {
          if (v.paused || v.ended) return;
          c.drawImage(v, 0, 0, w, h);
          this._timeout = setTimeout(draw, 20, v, c, w, h);
        };

        clearTimeout(this._timeout);
        if (img instanceof HTMLImageElement) {
          draw(img, context, parentWidth, parentHeight);
        } else {
          img.addEventListener('play', () => {
            draw(img, context, parentWidth, parentHeight);
          }, false);
        }
      }
    }

    if (imgAspect < parentAspect) {
      const scale = parentHeight / imgHeight;
      img.style.width = 'auto';
      img.style.height = '100%';
      img.style.marginTop = '0';
      img.style.marginLeft = (parentWidth / 2 - imgWidth * scale / 2) + 'px';
      if (blur) {
        const bgscale = parentWidth / imgWidth;
        bgImg.style.width = '100%';
        bgImg.style.height = (imgHeight * bgscale) + 'px';
        bgImg.style.marginTop = (parentHeight / 2 - imgHeight * bgscale / 2) + 'px';
        bgImg.style.marginLeft = '0';
      }
    } else {
      const scale = parentWidth / imgWidth;
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.marginTop = (parentHeight / 2 - imgHeight * scale / 2) + 'px';
      img.style.marginLeft = '0';
      if (blur) {
        const bgscale = parentHeight / imgHeight;
        bgImg.style.width = (imgWidth * bgscale) + 'px';
        bgImg.style.height = '100%';
        bgImg.style.marginTop = '0';
        bgImg.style.marginLeft = (parentWidth / 2 - imgWidth * bgscale / 2) + 'px';
      }
    }

    this.props.setVideo(img instanceof HTMLVideoElement ? img : null);

    el.appendChild(img);
    if (blur) {
      bg.appendChild(bgImg);
    }

    this.props.onLoaded();
  }

  shouldComponentUpdate(props: any): boolean {
    return ((!this.props.image && props.image) ||
      (props.image && this.props.image && props.image.src !== this.props.image.src) ||
      (props.backgroundType !== this.props.backgroundType) ||
      (props.backgroundColor !== this.props.backgroundColor) ||
      (props.backgroundBlur !== this.props.backgroundBlur) ||
      (props.horizTransLevel !== this.props.horizTransLevel) ||
      (props.vertTransLevel !== this.props.vertTransLevel) ||
      (props.zoomStart !== this.props.zoomStart) ||
      (props.zoomEnd !== this.props.zoomEnd) ||
      (props.transDuration !== this.props.transDuration) ||
      (props.crossFade !== this.props.crossFade) ||
      (props.fadeDuration !== this.props.fadeDuration));
  }

  render() {
    if (!this.props.image) {
      return (
        <div className="ImageView u-fill-container">
          <div className="ImageView__Image"ref={this.contentRef}/>
        </div>
      );
    }
    return (
      <FadeLayer
        image={this.props.image}
        backgroundType={this.props.backgroundType}
        backgroundColor={this.props.backgroundColor}
        backgroundBlur={this.props.backgroundBlur}
        horizTransLevel={this.props.horizTransLevel}
        vertTransLevel={this.props.vertTransLevel}
        zoomStart={this.props.zoomStart}
        zoomEnd={this.props.zoomEnd}
        transDuration={this.props.transDuration}
        crossFade={this.props.crossFade}
        fadeDuration={this.props.fadeDuration}
        contentRef={this.contentRef}
        backgroundRef={this.backgroundRef}/>
    );
  }
}