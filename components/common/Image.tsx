import { Box, SxProps } from '@mui/material';
import { ImgHTMLAttributes } from 'react';
import { StaticImageData } from 'next/image';

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string | StaticImageData;
  alt?: string;
  sx?: SxProps;
}

const Image = ({ src, alt, sx, ...rest }: ImageProps) => {
  const imageSrc = typeof src === 'string' ? src : src.src;
  return <Box component="img" src={imageSrc} alt={alt} sx={sx} {...rest} />;
};

export default Image;
