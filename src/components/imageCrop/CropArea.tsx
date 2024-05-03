import React, { useState, useCallback, useRef, useEffect } from "react";
import ReactCrop, { Crop, PercentCrop, PixelCrop, ReactCropProps } from "react-image-crop";
import { drawCrop } from "./helpers";
import CropperStyles from "./CropperStyles";
import { ICropperStyles } from "./types";
import "react-image-crop/dist/ReactCrop.css";

const CROP_DEFAULTS: any = {
  width: 100,
  height: 100,
  unit: '%',
  x : 0,
  y : 0
};

interface ICropArea {
  data: string;
  onCrop: (canvas: HTMLCanvasElement) => void;
  cropParams?: typeof CROP_DEFAULTS;
  cropperStyles?: ICropperStyles;
}

const CropArea: React.FC<ICropArea> = ({
  data,
  onCrop,
  cropParams = CROP_DEFAULTS,
  cropperStyles = {}
}) => {
  const { current: containerCls } = useRef(
    `cropper-${Math.ceil(new Date().getTime() * Math.random())}`
  );
  const imgRef = useRef<CanvasImageSource>();
  const [crop, setCrop] = useState<Crop>({
    x: 0,
    y: 0,
    unit: "%",
    width: cropParams.width || CROP_DEFAULTS.width,
    height: cropParams.height || CROP_DEFAULTS.height,
  });

  useEffect(() => {
    setCrop({
        x: cropParams.x || 0,
        y: cropParams.y || 0,
        unit: "%",
        width: cropParams.width || CROP_DEFAULTS.width,
        height: cropParams.height || CROP_DEFAULTS.height,
    });
  }, [cropParams]);

  const onLoad = useCallback(img => {
    // console.log(img,'IMG')
    imgRef.current = img?.target;
  }, []);

  const handleCrop = (crop: PixelCrop, cropParams : PercentCrop) => {
    // console.log(crop,'canvas',imgRef.current)
    if (cropParams && imgRef.current) {
      const canvas = drawCrop(
        cropParams,
        imgRef.current,
        document.createElement("canvas")
        );

      return onCrop(canvas);
    }
  };

  return (
    <>
      <CropperStyles containerCls={containerCls} {...cropperStyles} />

      <div className={containerCls}>
        <ReactCrop
          // src={data}
          // onImageLoaded={onLoad}
          crop={crop}
          onChange={setCrop}
          onComplete={handleCrop}
          aspect={1/1}
        >
          <img src={data} onLoad={onLoad} alt="crop image"/>
        </ReactCrop>
      </div>
    </>
  );
};

export default CropArea;
