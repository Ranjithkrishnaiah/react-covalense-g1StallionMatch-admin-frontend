import React from "react";
import { ICropperStyles, EnumSelectionShape } from "./types";

type TCropperStyles = ICropperStyles & {
  containerCls: string;
};

const CropperStyles: React.FC<TCropperStyles> = ({
  containerCls,
  dragPointsColor = "#283cfa",
  borderColor = "#283cfa",
  selectionShape = EnumSelectionShape.Circle,
  selectionShapeColor = "transparent"
}) => {
  const c = `.${containerCls}`;

  const styles = `
    ${c} {
      max-height: 290px;
      height: 290px;
      width: 243px;
      max-width: 243px;
      justify-content: center;
      background: #cdcdcd;
      display: flex;
      align-items: center;
    }

     ${c} .ReactCrop__drag-handle::after {
      background: ${dragPointsColor};
      border: none;
    }
    
    ${c} .ReactCrop__crop-selection {
      border: 1px solid ${selectionShapeColor};
      border-radius: ${
        selectionShape === EnumSelectionShape.Circle ? "50%" : "0"
      };
    }
    
    ${c} .ReactCrop__drag-elements {
      outline: 1px solid ${borderColor};
      height: 100%;
    }
    
    ${c} .ReactCrop__image {
      max-height: 290px;
    }
  `;

  return <style>{styles}</style>;
};

export default CropperStyles;
