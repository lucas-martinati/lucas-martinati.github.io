import images from '../data/images.json';

export default function ResponsiveImage({ src, sizes, prefix = '', ...props }) {
    const image = images[src];
    return (
        <img
            {...props}
            src={`${prefix}${image?.src ?? src}`}
            srcSet={image?.variants.map((variant) => `${prefix}${variant.url} ${variant.width}w`).join(', ')}
            sizes={sizes}
            width={image?.width}
            height={image?.height}
            decoding="async"
        />
    );
}
