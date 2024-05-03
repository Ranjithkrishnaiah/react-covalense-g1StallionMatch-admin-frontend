import { Avatar, Badge } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import CropArea from "./CropArea";
import { buildImageFile } from "./helpers";

type SaveFile = {
    original: Blob;
    cropped: Blob;
}

type CropperProps = {
    onSaveFile: (original: Blob, cropped: Blob) => void;
    image: any;
}

const readFile = (file : File) : Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result));
      reader.readAsDataURL(file);
    } catch (e) {
      console.error("Error during convertation file to dataurl in cropper");
      reject(e);
    }
  });
};

const Cropper = ({ onSaveFile, image } : CropperProps) => {
  const [isFileLoading, setIsFileLoading] = useState(false);
  const preview1ref = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>();

  const [imageContent, setImageContent] = useState<string>("");

  useEffect(() => {
    if (!image) setImageContent("");

    try {
      readFile(image).then((img : string) => setImageContent(img));
    } catch (e) {
      console.error("Something wrong with incoming image file", e);
      return ;
    }
  }, [image]);

  const handleCrop = (canvas : HTMLCanvasElement) => {
    if (!canvas) return;
    canvasRef.current = canvas;
    const dataURL = canvas.toDataURL();
    if(preview1ref)
     if(preview1ref.current)
    preview1ref.current.src = dataURL;
  };

  const handleSubmit = async () => {
    await setIsFileLoading(true);
    const cropped : Blob = await buildImageFile(canvasRef.current, { name: "avatar" });
    await onSaveFile(image,cropped);
    await setIsFileLoading(false);
  };

  return (
    <div>
      {imageContent && <CropArea data={imageContent} onCrop={handleCrop} />}

      {imageContent && (
        <img
          ref={preview1ref}
          alt="avatar"
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%"
          }}
        />
      )}
      {isFileLoading && <span>Loading</span>}
      <div>
        <button type="button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

function useGetBase64FromImageUrl(url : string) {
  const [data, setData] = useState<Blob | null>(null);
  const [isImageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    const img = new Image();

    img.setAttribute("crossOrigin", "anonymous");

    img.onload = function(event : any) {
      var canvas = document.createElement("canvas");
      canvas.width = event.currentTarget.width;
      canvas.height = event.currentTarget.height;

      var ctx = canvas.getContext("2d");
      ctx?.drawImage(event.currentTarget, 0, 0);

      var dataURL = canvas.toDataURL("image/png");

      // console.log("dataURL", dataURL);

      canvas.toBlob(
        blob => {
          // console.log("BLOB", blob);
          setData(blob);
          setImageLoading(false);
        },
        "image/jpeg",
        0.95
      );
    };

    img.src = url;
    setImageLoading(true);
  }, [url]);

  return {data, isImageLoading};
}

const ImageCropper = (imgInput: string) => {
  const {data: imageData} = useGetBase64FromImageUrl(imgInput);

  const [avatar, setAvatar] = useState("");
  const [original, setOriginal] = useState("");
  const [image, setImage] = useState<boolean | Blob | string>(imgInput);

  useEffect(() => {
    if(imageData)
     setImage(imageData);
  }, [imageData]);

  const handleSaveFile = (original : Blob, cropped : Blob) => {
    setAvatar(URL.createObjectURL(cropped));
    typeof(original) !== 'object' && setOriginal(URL.createObjectURL(original));
  };

  return (
    <div>
      {/* {imgInput && <Badge
               overlap="circular"
               anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
               style = {{ margin: 'auto' }}
             >
               {!imgInput && <Avatar alt="" style={ { width: '140px', height: '140px' } } /> }
               { imgInput && <img src = { imgInput } 
               style={ { width: '140px', height: '140px', borderRadius: '50%' } }/>}
             </Badge>} */}
      {false && <Cropper onSaveFile={handleSaveFile} image={image} />}
      

      {avatar && (
        <img
          src={avatar}
          alt="avatar"
          width="100"
          height="100"
          style={{ border: "1px solid red" }}
        />
      )}
    </div>
  );
};
export default ImageCropper
