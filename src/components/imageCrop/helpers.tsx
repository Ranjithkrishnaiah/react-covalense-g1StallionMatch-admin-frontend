import { PercentCrop } from "react-image-crop";

type Draw = {
    image: CanvasImageSource;
    canvas: HTMLCanvasElement;
    crop: PercentCrop;
    scale: any;
    dpr: any
}

export const getScale = (img : any) => ({
    x: img.naturalWidth / img.width,
    y: img.naturalHeight / img.height
  });
  
  export const setCanvasSize = (cnvs:HTMLCanvasElement, crop:PercentCrop, dpr: any) => {
    cnvs.width = crop.width * dpr;
    cnvs.height = crop.height * dpr;
  };
  
  export const draw = ({ image, canvas, crop, scale, dpr }:Draw ) => {
    const ctx2d = canvas.getContext("2d");
  
    return ctx2d?.drawImage(
      image,
      crop.x * scale.x,
      crop.y * scale.y,
      crop.width * scale.x,
      crop.height * scale.y,
      0,
      0,
      crop.width * dpr,
      crop.height * dpr
    );
  };
  
  export const buildImageFile = (
    canvas : HTMLCanvasElement | undefined,
    {
      type = "image/jpeg",
      name = "unnamed image",
      lastModified = new Date().getTime()
    } = {}
  ) : Promise<Blob> =>
    new Promise((resolve, reject) => {
      canvas?.toBlob(blob => {
        if (!!blob) {
          console.error("Error while creating file from canvas", blob);
          reject(blob);
          const file = new File([blob], name, { type, lastModified });
  
        if (!file) {
          reject("Error while building image file from blob");
        }
  
        resolve(file);
        }
  
        
      });
    });
  
  export function drawCrop(crop :PercentCrop, image:CanvasImageSource, canvas :HTMLCanvasElement) {
    // console.log(crop,image,canvas)
    const dpr = window.devicePixelRatio || 1;
    const scale = getScale(image);
    setCanvasSize(canvas, crop, dpr);
    draw({ image, canvas, crop, scale, dpr });
  
    return canvas;
  }
  