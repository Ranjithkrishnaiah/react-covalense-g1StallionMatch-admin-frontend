import Accordion from '@mui/material/Accordion';
import { styled } from '@mui/material/styles';

const CustomAccordion = styled(Accordion)(({ theme }) => ({
    boxShadow: 'none',
    fontFamily: 'Synthese-Regular',
    fontSize: '16px',
    lineHeight: '24px', 
    color: '#1D472E',
    paddingLeft: '0',
    
}))

export default CustomAccordion