import { Dialog ,DialogContent, IconButton , SxProps } from '@mui/material';
import { CustomDialogTitle } from './WrapperDialog';
import { Images } from 'src/assets/images';
import Slider from '../customCarousel/Slider';


type caroselDialogProps = {
    open: boolean,
    onClose: () => void;
    items: any[];
    dots: boolean;
    arrows: boolean;
    mediaClassName: string;
    autoScroll: boolean;
    noOfVisibleItems: number;
    sliderOnItemClick: boolean;
    styles:{
        item: object,
        arrows: object,
        arrowLeft:object,
        arrowRight:object,
        cardContent: object
    }
    hideTitle: boolean;
    maxWidth?: 'sm' | 'md' | 'lg';
    sx?: SxProps,
    dimension?:string
}
function CaroselDialog(props: caroselDialogProps) {

  return (
    <Dialog open={props.open} 
    onClose={props.onClose} sx={ props.sx } 
    className='dialogPopup mediaSliderPop'
    maxWidth = {props.maxWidth || 'lg'}>
        {!props.hideTitle && 
        <CustomDialogTitle>
            Media
            <IconButton
            aria-label="close"
            onClick={props.onClose}
            sx={ {
                position: 'absolute',
                right: 12,
                width: 36,
                height: 36,
                top: 18,
                color: () => '#1D472E',
            } }
            >
                <i className="icon-Cross" />
            {/* <img src={Images.cross} alt="close" style={ { width:'36px', height:'36px' } }/> */}
            </IconButton>
        </CustomDialogTitle>}
        <DialogContent sx={ { position: 'relative' } }>
            <Slider {...props}/>
        </DialogContent>
    </Dialog>
  )
}

export default CaroselDialog