export enum EnumSelectionShape {
    Square = "square",
    Circle = "circle"
  }
  
  export interface ICropperStyles {
    dragPointsColor?: string;
    borderColor?: string;
    selectionShape?: EnumSelectionShape;
    selectionShapeColor?: string;
  }