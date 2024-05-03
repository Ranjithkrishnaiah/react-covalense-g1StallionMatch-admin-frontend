import React, { useState, useCallback, useRef } from 'react';
import { Box } from '@mui/system';
import CaroselDialog from '../WrappedDialog/CaroselDialog';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import { Stack, Typography, Grid } from '@mui/material';
import { useFullScreenHandle } from 'react-full-screen';
import '../cards/card.css';
import { Images } from 'src/assets/images';
import FullScreenDialog from '../fullscreenDialog/FullScreenWrapperDialog';

type Styles = {
  item: object;
  arrows: object;
  arrowLeft: object;
  arrowRight: object;
  cardContent: object;
};
export type CaroselProps = {
  items: any[];
  dots: boolean;
  mediaClassName: string;
  arrows: boolean;
  autoScroll: boolean;
  noOfVisibleItems: number;
  sliderOnItemClick: boolean;
  styles: Styles;
  insideDialog?: boolean;
  isRecentSearches?: boolean;
  isSimilarStallions?: boolean;
  isPopularStallions?: boolean;
  isCompatibleStallions?: boolean;
  dimension?: string;
  farmDetailsProps?: any;
  media?: boolean;
  presentSlide?: number;
};

function Slider(props: CaroselProps) {
  const vidref: any = useRef<HTMLInputElement | null>(); // This const is used for videos to stop playing when they are not active on carusel
  
  const totalPages = Math.ceil(props.items?.length / props.noOfVisibleItems);
  const pageArr = [];
  for (let i = 0; i < totalPages; i++) {
    pageArr.push(i);
  }
  const [currentPage, setCurrentPage] = useState(props.presentSlide ? props.presentSlide : 0);

  const [openDialog, setOpenDialog] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  let startIndex = currentPage * props.noOfVisibleItems;
  let endIndex = Math.min((currentPage + 1) * props.noOfVisibleItems - 1, props.items?.length - 1);

  let displayArr = Array(props.items?.length);
  displayArr = props.items?.map((_: any, index: number) =>
    index < startIndex || index > endIndex ? false : true
  );
  const goToPreviousPage = () => {
    if(vidref.current){
    vidref.current.pause(); // this line is used to pause video when moving to next slide
    }
    if (currentPage > 0) setCurrentPage((currentPage) => currentPage - 1);
  };
  const goToNextPage = () => {
    if(vidref.current){
      vidref.current.pause(); // this line is used to pause video when moving to next slide
    }  
    if (currentPage < totalPages - 1) setCurrentPage((currentPage) => currentPage + 1);
  };
  const goToPage = (evt: React.SyntheticEvent) => setCurrentPage(parseInt(evt.currentTarget.id));

  const openCaroselInDialog = (e: React.SyntheticEvent) => {
    if (props.sliderOnItemClick) {
      setOpenDialog(true);
    }
  };
  const caroselDialogProps = {
    open: openDialog,
    onClose: () => setOpenDialog(false),
    items: props.items,
    mediaClassName: 'show',
    dots: true,
    arrows: true,
    autoScroll: false,
    noOfVisibleItems: 1,
    sliderOnItemClick: false,
    insideDialog: true,
    styles: {
      item: {},
      arrows: {
        top: '50%',
        width: '100%',
        display: 'flex',
      },
      arrowLeft: {
        left: 0,
      },
      arrowRight: {
        right: 0,
        marginLeft: 'auto',
      },
      cardContent: {},
    },
    hideTitle: false,
    dimension: '?w=536&h=401&fit=crop&ar=3:2',
    presentSlide: currentPage,
  };

  const NOTLists =
    !props.isRecentSearches &&
    !props.isSimilarStallions &&
    !props.isPopularStallions &&
    !props.isCompatibleStallions;

  const handle = useFullScreenHandle();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const stopvideo = () => {
    vidref.current.play(); // this line is used to prevent video to play while clicking on the body of the video
  };

  const openFullscreen = () => {
    setIsFullScreen(true);
    handle.enter();
  };
  const closeFullscreen = () => {
    handle.exit();
    setIsFullScreen(false);
  };
  const reportChange = useCallback(
    (state) => {
    setIsFullScreen(state);
  }, [handle]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  // console.log(props.dimension, 'dimension');

  return (
    <Grid item lg={12} xs={12}>
      <Box
        className="recent-slider-box farm-media"
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: `repeat(${props.noOfVisibleItems}, 1fr)`,
          },
        }}
      >
        {/* To Display Images in Dialog on Click of an image */}
        <CaroselDialog {...caroselDialogProps} />
       {/*To display Image in fullScreen*/}
       <FullScreenDialog disablePortal={false} className={`fullscreen ${open ? 'fullscreen-enabled' : ''}`} open={open} setOpen={setOpen}>
        {/* <FullScreen handle={handle} onChange={reportChange}> */}
          {open && (
            <>
              <img
                src={props.items[currentPage].src}
                style={{ width: '100%' }}
              ></img>
              <img
                src={Images.arrowcollapse}
                className="arrowcollapse"
                alt="close"
                onClick={handleClose}
              />
            </>
          )}
        {/* </FullScreen> */}
        </FullScreenDialog>
         {/* To Display Images in Carosel */}
        {NOTLists &&
          props.items?.map((item: any, index: number) => (
            <Box
              onClick={openCaroselInDialog}
              key={item + index}
              className={displayArr[index] ? props.mediaClassName : 'hide'}
            >
              <div>
                <Stack className="farm-media-image media-slider">
                  {/* {item.type == 'video'? <Box sx={{position:'absolute', zIndex:'1'}}><img src={Images.play}/></Box>:''} */}
                  {item.type == 'video' ? (
                    <video
                      width="100%"
                      height="auto"
                      onClick={stopvideo}
                      ref={vidref}
                      controls
                      src={item.src}
                    ></video>
                  ) : (
                    <CardMedia
                      component={item.type}
                      image={`${item.src}${props?.dimension ? props?.dimension : ''}`}
                      alt={`${
                        props?.farmDetailsProps?.farmDetails
                          ? props?.farmDetailsProps?.farmDetails?.farmName +
                            ` ${props.media ? 'Media Image' : 'Gallery Image'} #${index + 1}`
                          : props?.farmDetailsProps?.farmName +
                            ` ${
                              props.media
                                ? item.type == 'video'
                                  ? 'Media Video'
                                  : 'Media Image'
                                : 'Gallery Image'
                            } #${index + 1}`
                      }`}
                      sx={props.styles.item}
                      
                    />
                  )}

                  {props.insideDialog && item.type != 'video' && !isFullScreen ? (
                    <i
                      className="icon-Arrows-expand"
                      style={{ position: 'absolute', right: '15px', bottom: '15px' }}
                      onClick={handleClickOpen}
                    />
                  ) :""}
                  {props.dots && !props.autoScroll ? (
                    <Box className={`dots`}>
                      {props.items?.map((item: any, index: number) => (
                        <Box
                          key={item + index}
                          className={`dots__dot ${displayArr[index] ? 'dot-active' : ''}`}
                          id={`${index}`}
                          onClick={(e: any) => goToPage(e)}
                        />
                      ))}
                    </Box>
                  ):"" }
                </Stack>
              </div>
              {item.date ? (
                <CardContent>
                  <Typography
                    gutterBottom
                    variant="h5"
                    sx={{ color: '#626E60', fontFamily: 'Synthese-Book' }}
                  >
                    {item.date}
                  </Typography>
                  <Typography py={1} gutterBottom variant="h4" className="MediacardTitle">
                    {item.name}
                  </Typography>
                  <Typography variant="h6" mt={1}>
                    {item.description}
                  </Typography>
                </CardContent>
              ) : (
                ''
              )}
            </Box>
          ))}
        

        {/* To Display Arrows in Carosel */}
        {props.arrows && !props.autoScroll && !isFullScreen ? (
          <Box
            className="navigarion-arrow-wrapper"
            sx={{ position: 'absolute', ...props.styles.arrows }}
          >
            <Box className="navigarion-arrow-left" sx={props.styles.arrowLeft}>
              {currentPage <= 0 ? (
                ''
              ) : (
                <i
                  className="icon-Carousel-Arrow-Left"
                  style={{ fontSize: '40px' }}
                  onClick={goToPreviousPage}
                />
              )}
            </Box>
            <Box className="navigarion-arrow-right" sx={props.styles.arrowRight}>
              {currentPage >= totalPages - 1 || isNaN(totalPages) ? (
                ''
              ) : (
                <i
                  className="icon-Carousel-Arrow-Right"
                  style={{ fontSize: '40px' }}
                  onClick={goToNextPage}
                />
              )}
            </Box>
          </Box>
        ) : (
          ' '
        )}
      </Box>
    </Grid>
  );
}
export default Slider;
