import React, { useState, useRef } from 'react'

import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from 'react-image-crop'
import { canvasPreview } from './canvasPreview'
import  {imgPreview}  from './imgPreview'
import { useDebounceEffect } from './useDebounceEffect'
import './styles.css';
import 'react-image-crop/dist/ReactCrop.css'

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function CropCon(props:any) {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [scale, setScale] = useState(props.zoom)
  const [rotate, setRotate] = useState(0)
  const [aspect, setAspect] = useState<number | undefined>(props.circularCrop !== undefined ? 3/2 : 1/1)
    

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          props.zoom,
          rotate,
        )
        let url:any = await imgPreview(
          imgRef.current,
        //   previewCanvasRef.current,
          completedCrop,
          props.zoom,
          rotate,
        )
        props.handleImageUrl(url,completedCrop);
        // console.log(previewCanvasRef.current,completedCrop,url,'CRR')
      }
    },
    100,
    [completedCrop, props.zoom, rotate],
  )

  function handleToggleAspectClick() {
    if (aspect) {
      setAspect(undefined)
    } else if (imgRef.current) {
      const { width, height } = imgRef.current
      setAspect(16 / 9)
      setCrop(centerAspectCrop(width, height, 16 / 9))
    }
  }

  return (
    <div>
      {false && <div className="Crop-Controls">
        {/* <input type="file" accept="image/*" onChange={onSelectFile} /> */}
        <div>
          <label htmlFor="scale-input">Scale: </label>
          <input
            id="scale-input"
            type="number"
            step="0.1"
            value={scale}
            disabled={!props.imgSrc}
            onChange={(e) => setScale(Number(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="rotate-input">Rotate: </label>
          <input
            id="rotate-input"
            type="number"
            value={rotate}
            disabled={!props.imgSrc}
            onChange={(e) =>
              setRotate(Math.min(180, Math.max(-180, Number(e.target.value))))
            }
          />
        </div>
        <div>
          <button onClick={handleToggleAspectClick}>
            Toggle aspect {aspect ? 'off' : 'on'}
          </button>
        </div>
      </div>}
      {!!props.imgSrc && (
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={props.circularCrop !== undefined ? 3/2 : 1/1}
          circularCrop={props.circularCrop !== undefined ? props.circularCrop : true}
          // minWidth={270}
          // maxWidth={270}
          // minHeight={180}
          // maxHeight={180}
        >
          <img
            ref={imgRef}
            alt="Crop me"
            src={props.imgSrc}
            style={{ transform: `scale(${props.zoom}) rotate(${rotate}deg)`}}
            onLoad={onImageLoad}
          />
        </ReactCrop>
      )}
      <div>
        {!!completedCrop && (
          <canvas
            ref={previewCanvasRef}
            className={`${props.circularCrop !== undefined ? 'squarePreview': 'circularCropPreview'}`}
            style={{
              border: '1px solid black',
              objectFit: 'contain'
            //   width: completedCrop.width,
            //   height: completedCrop.height,
            }}
          />
        )}
      </div>
    </div>
  )
}
